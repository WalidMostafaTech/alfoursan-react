// 🧠 Helper: format difference between two times using Saudi time
const getTimeDiffString = (pastTime) => {
  const nowSaudi = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const pastSaudi = new Date(pastTime);

  let diffMs = nowSaudi - pastSaudi;
  if (diffMs < 0) diffMs = 0;

  const minutesTotal = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(minutesTotal / (60 * 24));
  const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
  const minutes = minutesTotal % 60;

  // ⏱ لو أقل من 24 ساعة → ساعات ودقايق فقط
  if (days === 0) {
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // 📅 لو أكتر من يوم → يوم + ساعة + دقيقة
  return `${days}d ${hours}h ${minutes}m`;
};

function getTimeDiffDetailed(lastSignelGPS) {
  const nowRiyadh = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const lastSignalDate = new Date(lastSignelGPS);

  let diffMs = nowRiyadh - lastSignalDate; // الفرق بالميلي ثانية
  if (diffMs < 0) diffMs = 0; // حماية من القيم السالبة

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;

  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 1000 * 60;

  const seconds = Math.floor(diffMs / 1000);

  const hoursSinceLastGPS = (nowRiyadh - lastSignalDate) / (1000 * 60 * 60);

  return { days, hours, minutes, seconds, hoursSinceLastGPS };
}

// 🚗 Main function to get car status (Saudi time)
export const getCarStatus = (car) => {
  if (!car) return { status: "Unknown", color: "#6b7280" }; // رمادي فاتح

  const { lastSignel, lastSignelGPS, speed } = car;

  // ✅ Inactive: لم يتم استلام إشارة نهائيًا
  if (!lastSignel) return { status: "Inactive", color: "#6b7280" };
  /*
  const nowSaudi = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const lastSignalTime = new Date(
    new Date(lastSignel).toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const lastGPS = new Date(
    new Date(lastSignelGPS).toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  */

  // const hoursSinceLastSignal = (nowSaudi - lastSignalTime) / (1000 * 60 * 60);
  // const hoursSinceLastGPS = (nowSaudi - lastGPS) / (1000 * 60 * 60);

  // ✅ أداء: لو عندنا lastGpsAtMs (من السوكت) نستخدمه بدل parsing string
  const nowRiyadh = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );

  const hoursSinceLastSignal = (() => {
    if (car.lastGpsAtMs && Number.isFinite(car.lastGpsAtMs)) {
      return (Date.now() - car.lastGpsAtMs) / (1000 * 60 * 60);
    }
    const diff = getTimeDiffDetailed(lastSignel);
    return diff.hoursSinceLastGPS;
  })();

  // ⏹ Offline
  if (hoursSinceLastSignal >= 4) {
    return {
      status: `Offline (${getTimeDiffString(lastSignel)})`,
      color: "#ef4444",
    };
  }

  // 🟢 Moving
  const s = Number(speed) || 0;
  if (s > 1) {
    return {
      status: `Moving (${s} km/h)`,
      color: "#22c55e",
    };
  }

  // 🔵 Static
  if (s <= 1) {
    const sinceSource = lastSignelGPS || lastSignel;
    return {
      status: sinceSource ? `Static ( ${getTimeDiffString(sinceSource)})` : "Static",
      color: "#3b82f6",
    };
  }

  return { status: "Unknown", color: "#6b7280" };
};
