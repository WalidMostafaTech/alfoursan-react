import { toast } from "react-toastify";

function feedbackMessage() {
  if (typeof window === "undefined") return "Copied";
  return window.__LANG__ === "ar" ? "تم النسخ" : "Copied";
}

function errorMessage() {
  if (typeof window === "undefined") return "Copy failed";
  return window.__LANG__ === "ar" ? "تعذر النسخ" : "Copy failed";
}

/**
 * نسخ نص مع إشعار toast قصير (يستخدم الـ ToastContainer الافتراضي).
 */
export async function copyToClipboard(text) {
  const s = String(text ?? "");
  if (!s) return false;
  try {
    await navigator.clipboard.writeText(s);
    toast.success(feedbackMessage(), { autoClose: 1200 });
    return true;
  } catch {
    toast.error(errorMessage(), { autoClose: 2000 });
    return false;
  }
}
