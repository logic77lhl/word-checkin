/* ═══════════════════════════════════════════════════════════
   WQCloud —— Supabase 云同步层
   ───────────────────────────────────────────────────────────
   没有 config.js（或没填 URL / key）时整层关闭，应用保持纯本地模式。
   有配置但没登录时也能用，只是不往云端写。

   数据模型：
     public.progress (user_id uuid pk, data jsonb, revision bigint, updated_at)
   写入用 revision 做乐观锁：版本对不上就拉最新 → 合并 → 重试。
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const GUEST_KEY = "wordquest-v1";
  const DEBOUNCE_MS = 1500;
  const MAX_RETRY = 3;
  const MAX_BYTES = 1900000; // 云端约束 2MB，留点余量

  const cloud = {
    ready: false,
    client: null,
    session: null,
    user: null,
    status: "off", // off | signed-out | idle | syncing | error
    reason: "", // no-config | no-lib | file-protocol | init-failed
    lastSyncAt: 0,
    lastError: "",
    revision: 0,
    revKnown: false,
    listeners: [],
    getState: null,
    setState: null,
  };

  let timer = null;
  let inFlight = false;
  let pending = false;

  /* ─────────── 工具 ─────────── */

  const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : 0);

  function hasData(s) {
    if (!s) return false;
    return Boolean(
      (s.words && Object.keys(s.words).length) ||
      (s.days && Object.keys(s.days).length) ||
      (s.custom && s.custom.length) ||
      num(s.xp) > 0
    );
  }

  function countWords(s) {
    return s && s.words ? Object.keys(s.words).length : 0;
  }

  function countDays(s) {
    return s && s.days ? Object.keys(s.days).length : 0;
  }

  /* ─────────── 合并（纯函数，可单测） ─────────── */

  function mergeWords(a, b) {
    a = a || {};
    b = b || {};
    const out = {};
    for (const k of Object.keys(a)) out[k] = a[k];
    for (const k of Object.keys(b)) {
      const x = out[k];
      const y = b[k];
      if (!x) { out[k] = y; continue; }
      if (!y) continue;
      const newer = (y.last || "") > (x.last || "") ? y : x;
      const older = newer === y ? x : y;
      const m = Object.assign({}, older, newer);
      // 计数取较大值：两台设备算同一批词时不会重复累加
      for (const f of ["seen", "lstSeen", "lstOk", "spkSeen", "spkOk", "lapses"]) {
        if (f in x || f in y) m[f] = Math.max(num(x[f]), num(y[f]));
      }
      out[k] = m;
    }
    return out;
  }

  function mergeDays(a, b) {
    a = a || {};
    b = b || {};
    const out = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const d of keys) {
      const x = a[d];
      const y = b[d];
      if (!x) { out[d] = y; continue; }
      if (!y) { out[d] = x; continue; }
      const m = {};
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
        const vx = x[k];
        const vy = y[k];
        if (typeof vx === "boolean" || typeof vy === "boolean") m[k] = !!(vx || vy);
        else if (typeof vx === "number" || typeof vy === "number") m[k] = Math.max(num(vx), num(vy));
        else m[k] = vx === undefined ? vy : vx;
      }
      if (m.checkinAt) {
        m.checkinAt = Math.min(x.checkinAt || Infinity, y.checkinAt || Infinity);
      }
      out[d] = m;
    }
    return out;
  }

  function mergeBadges(a, b) {
    a = a || {};
    b = b || {};
    const out = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[k];
      const y = b[k];
      if (x && y) out[k] = String(x) < String(y) ? x : y; // 解锁日期取较早
      else out[k] = x || y;
    }
    return out;
  }

  function mergeSkills(a, b) {
    a = a || {};
    b = b || {};
    const out = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[k] || {};
      const y = b[k] || {};
      const m = {};
      for (const f of new Set([...Object.keys(x), ...Object.keys(y)])) {
        m[f] = Math.max(num(x[f]), num(y[f]));
      }
      out[k] = m;
    }
    return out;
  }

  function mergeCustom(a, b) {
    const map = new Map();
    for (const it of [].concat(a || [], b || [])) {
      if (it && it.w) map.set(String(it.w).toLowerCase(), it);
    }
    return [...map.values()];
  }

  function mergeSettings(a, b) {
    a = a || {};
    b = b || {};
    const ta = num(a.updatedAt);
    const tb = num(b.updatedAt);
    if (ta || tb) return ta >= tb ? { ...b, ...a } : { ...a, ...b };
    return { ...a, ...b }; // 都没有时间戳时以云端为准（本机可能只是默认值）
  }

  /** 合并两份进度。a = 本机，b = 云端。 */
  function mergeStates(a, b) {
    if (!a) return b;
    if (!b) return a;
    const out = { ...a, ...b };
    out.settings = mergeSettings(a.settings, b.settings);
    out.words = mergeWords(a.words, b.words);
    out.days = mergeDays(a.days, b.days);
    out.badges = mergeBadges(a.badges, b.badges);
    out.skills = mergeSkills(a.skills, b.skills);
    out.custom = mergeCustom(a.custom, b.custom);
    out.xp = Math.max(num(a.xp), num(b.xp));
    out.quizPerfect = !!(a.quizPerfect || b.quizPerfect);
    out.createdAt = Math.min(num(a.createdAt) || Infinity, num(b.createdAt) || Infinity) || Date.now();
    out.v = Math.max(num(a.v) || 1, num(b.v) || 1);
    return out;
  }

  /* ─────────── 初始化 ─────────── */

  function emit() {
    for (const fn of cloud.listeners) {
      try { fn(cloud.status); } catch (e) { /* 监听器自己出错不拖垮同步 */ }
    }
  }

  function setStatus(s) {
    if (cloud.status === s) return;
    cloud.status = s;
    emit();
  }

  function describeError(e) {
    if (!e) return "";
    const code = e.code || "";
    const msg = e.message || String(e);
    if (code === "PGRST205") return "云端还没有 progress 表，请先在 Supabase 执行建表 SQL";
    if (code === "42501") return "没有权限：请检查 progress 表的 RLS 策略";
    if (/JWT|token/i.test(msg)) return "登录状态已过期，请重新登录";
    if (/Failed to fetch|NetworkError|load failed/i.test(msg)) return "网络不通，稍后会自动重试";
    return msg;
  }

  async function init() {
    const cfg = window.WQ_CONFIG || {};
    cloud.ready = false;

    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      cloud.reason = "no-config";
      setStatus("off");
      return false;
    }
    if (!/^https?:$/.test(location.protocol)) {
      cloud.reason = "file-protocol";
      setStatus("off");
      return false;
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      cloud.reason = "no-lib";
      setStatus("off");
      return false;
    }

    try {
      cloud.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          flowType: "pkce",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // 只有 login.html 处理回调
        },
      });
      const { data } = await cloud.client.auth.getSession();
      cloud.session = (data && data.session) || null;
      cloud.user = cloud.session ? cloud.session.user : null;
      cloud.ready = true;
      setStatus(cloud.user ? "idle" : "signed-out");

      cloud.client.auth.onAuthStateChange((evt, s) => {
        cloud.session = s || null;
        cloud.user = s ? s.user : null;
        if (!s) {
          cloud.revKnown = false;
          cloud.revision = 0;
          setStatus("signed-out");
        } else if (cloud.status !== "syncing") {
          setStatus("idle");
        }
      });
      return true;
    } catch (e) {
      cloud.reason = "init-failed";
      cloud.lastError = describeError(e);
      setStatus("off");
      return false;
    }
  }

  /* ─────────── 读写 ─────────── */

  function storageKey() {
    return cloud.user ? GUEST_KEY + ":" + cloud.user.id : GUEST_KEY;
  }

  function title() {
    const u = cloud.user;
    if (!u) return "";
    const meta = u.user_metadata || {};
    return meta.user_name || meta.preferred_username || meta.name || u.email || "已登录";
  }

  async function pull() {
    if (!cloud.client || !cloud.user) return null;
    const { data, error } = await cloud.client
      .from("progress")
      .select("data,revision,updated_at")
      .eq("user_id", cloud.user.id)
      .maybeSingle();
    if (error) throw new Error(describeError(error));
    if (!data) {
      cloud.revKnown = true;
      cloud.revision = 0;
      return null;
    }
    cloud.revision = num(data.revision);
    cloud.revKnown = true;
    cloud.lastSyncAt = Date.now();
    return { data: data.data || null, revision: num(data.revision), updatedAt: data.updated_at };
  }

  async function writeOnce(state) {
    const uid = cloud.user.id;
    const revision = cloud.revision + 1;
    const payload = {
      data: state,
      revision,
      updated_at: new Date().toISOString(),
    };
    if (cloud.revision === 0) {
      const { error } = await cloud.client
        .from("progress")
        .insert({ user_id: uid, ...payload });
      if (error) {
        // 云端已经有一行（别的设备刚写入）→ 交给外层拉取合并
        if (error.code === "23505" || /duplicate key/i.test(error.message || "")) return "conflict";
        throw new Error(describeError(error));
      }
      cloud.revision = revision;
      return "ok";
    }
    const { data, error } = await cloud.client
      .from("progress")
      .update(payload)
      .eq("user_id", uid)
      .eq("revision", cloud.revision)
      .select("revision")
      .maybeSingle();
    if (error) throw new Error(describeError(error));
    if (!data) return "conflict"; // 版本号已被别的设备推进
    cloud.revision = revision;
    return "ok";
  }

  /**
   * 推送当前进度。遇到版本冲突会自动合并后重试。
   * @param {object} state 要上传的完整状态
   * @returns {Promise<{ok:boolean, state:object, merged:boolean}>}
   */
  async function push(state) {
    if (!cloud.client || !cloud.user) return { ok: false, state, merged: false };
    if (!cloud.revKnown) {
      const row = await pull();
      if (row) {
        state = mergeStates(state, row.data);
        if (cloud.setState) cloud.setState(state);
      }
    }

    const size = JSON.stringify(state).length;
    if (size > MAX_BYTES) {
      cloud.lastError = `进度数据 ${(size / 1024 / 1024).toFixed(2)}MB，超过 2MB 上限，本次未上传`;
      setStatus("error");
      return { ok: false, state, merged: false, error: cloud.lastError };
    }

    let current = state;
    let merged = false;
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      const r = await writeOnce(current);
      if (r === "ok") {
        cloud.lastSyncAt = Date.now();
        cloud.lastError = "";
        setStatus("idle");
        return { ok: true, state: current, merged };
      }
      // conflict
      const row = await pull();
      if (row) {
        current = mergeStates(current, row.data);
      } else {
        cloud.revision = 0;
      }
      merged = true;
      if (cloud.setState) cloud.setState(current);
    }
    throw new Error("同步冲突次数过多，请稍后重试");
  }

  /* ─────────── 防抖队列 ─────────── */

  function touch() {
    if (!cloud.ready || !cloud.user) return;
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  }

  async function flush(force) {
    clearTimeout(timer);
    timer = null;
    if (!cloud.ready || !cloud.user || !cloud.getState) return { ok: false };
    if (inFlight) return { ok: false, queued: true };
    if (!pending && !force && cloud.status !== "error") return { ok: false };
    inFlight = true;
    pending = false;
    setStatus("syncing");
    try {
      const res = await push(cloud.getState());
      if (res && res.state && cloud.setState && res.merged) cloud.setState(res.state);
      return res;
    } catch (e) {
      cloud.lastError = describeError(e);
      setStatus("error");
      return { ok: false, error: cloud.lastError };
    } finally {
      inFlight = false;
      if (pending) touch();
    }
  }

  async function signOut() {
    try { if (cloud.client) await cloud.client.auth.signOut(); } catch (e) { /* 忽略 */ }
    cloud.user = null;
    cloud.session = null;
    cloud.revision = 0;
    cloud.revKnown = false;
    pending = false;
    clearTimeout(timer);
    setStatus("signed-out");
  }

  async function deleteCloud() {
    if (!cloud.client || !cloud.user) return false;
    const { error } = await cloud.client.from("progress").delete().eq("user_id", cloud.user.id);
    if (error) throw new Error(describeError(error));
    cloud.revision = 0;
    cloud.revKnown = true;
    cloud.lastSyncAt = Date.now();
    return true;
  }

  window.WQCloud = {
    init,
    pull,
    push,
    touch,
    flush,
    signOut,
    deleteCloud,
    storageKey,
    title,
    mergeStates,
    hasData,
    countWords,
    countDays,
    describeError,
    bind({ get, set }) {
      cloud.getState = get;
      cloud.setState = set;
    },
    onChange(fn) {
      cloud.listeners.push(fn);
    },
    get ready() { return cloud.ready; },
    get user() { return cloud.user; },
    get status() { return cloud.status; },
    get reason() { return cloud.reason; },
    get lastSyncAt() { return cloud.lastSyncAt; },
    get lastError() { return cloud.lastError; },
    get revision() { return cloud.revision; },
    isOn() { return cloud.ready && !!cloud.user; },
  };
})();
