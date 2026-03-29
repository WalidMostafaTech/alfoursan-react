/**
 * يستخرج رسالة خطأ قابلة للعرض من أخطاء Axios/الشبكة/استجابات غير JSON.
 * يدعم Laravel: response()->json(['status'=>false,'message'=>...], 400)
 */
export function getApiErrorMessage(error, tFallback) {
  const fallback = (key) =>
    typeof tFallback === "function" ? tFallback(key) : key;

  const res = error?.response;
  const status = res?.status;
  const data = res?.data;

  if (res && data != null) {
    if (typeof data === "object" && !Array.isArray(data)) {
      const msg = data.message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();

      if (data.errors && typeof data.errors === "object") {
        const flat = Object.values(data.errors).flat().filter(Boolean);
        const first = flat[0];
        if (typeof first === "string") return first;
      }

      if (data.status === false && typeof data.message === "string") {
        return data.message.trim();
      }
    }

    if (typeof data === "string") {
      const trimmed = data.trim();
      if (trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed?.message && typeof parsed.message === "string") {
            return parsed.message.trim();
          }
        } catch {
          // ليس JSON صالحاً
        }
      }
      if (trimmed.startsWith("<") || trimmed.length > 280) {
        return fallback("command.sendCommandErrorInvalidResponse");
      }
      if (trimmed) return trimmed.length > 500 ? `${trimmed.slice(0, 500)}…` : trimmed;
    }

    if (status === 302 || status === 301 || status === 307 || status === 308) {
      return fallback("command.sendCommandErrorRedirect");
    }
  }

  const code = error?.code;
  const msg = String(error?.message || "");

  if (
    code === "ERR_NETWORK" ||
    msg === "Network Error" ||
    /cors/i.test(msg)
  ) {
    return fallback("command.sendCommandErrorNetwork");
  }

  if (!res && msg) {
    return msg.length > 400 ? `${msg.slice(0, 400)}…` : msg;
  }

  if (code === "ECONNABORTED" || /timeout/i.test(msg)) {
    return fallback("command.sendCommandErrorTimeout");
  }

  if (msg && msg !== "Error") return msg;

  return fallback("command.sendCommandErrorGeneric");
}
