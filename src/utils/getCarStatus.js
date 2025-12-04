// 🧠 Helper: format difference between two times using Saudi time
const getTimeDiffString = (pastTime) => {
  const nowSaudi = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const pastSaudi = new Date(pastTime);

  const diffMs = nowSaudi - pastSaudi;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
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

// مثال استخدام
const lastSignelGPS = "2025-11-05 10:15:20";
const diff = getTimeDiffDetailed(lastSignelGPS);

console.log(
  `${diff.days} يوم ${diff.hours} ساعة ${diff.minutes} دقيقة ${diff.seconds} ثانية`
);

// 🚗 Main function to get car status (Saudi time)
export const getCarStatus = (car) => {
  if (!car) return { status: "Unknown", color: "#6b7280" }; // رمادي فاتح

  const { lastSignel, lastSignelGPS, speed } = car;

  if (!lastSignel) return { status: "Inactive", color: "#6b7280" }; // أحمر
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

  const diffSignal = getTimeDiffDetailed(lastSignel);
  const diffGPS = getTimeDiffDetailed(lastSignelGPS);

  const hoursSinceLastSignal = diffSignal.hoursSinceLastGPS;
  const hoursSinceLastGPS = diffGPS.hoursSinceLastGPS;

  // ⏹ Offline
  if (hoursSinceLastSignal > 4) {
    return {
      status: `Offline (${getTimeDiffString(lastSignel)})  `,
      color: "#ef4444", // رمادي
    };
  }

  // 🟢 Moving
  if (speed > 0) {
    return {
      status: `Moving (${speed} km/h)`,
      color: "#22c55e", // أخضر
    };
  }

  // 🔵 Static
  if (speed === 0 || !speed || speed === "undefined") {
    return {
      status: `Static (${getTimeDiffString(lastSignelGPS)})   `,
      color: "#3b82f6", // أزرق
    };
  }

  console.clear();
  console.log("hoursSinceLastSignal", hoursSinceLastSignal);
  console.log("speed", speed);
  console.log("hoursSinceLastGPS", hoursSinceLastGPS);

  return { status: "Unknown", color: "#6b7280" };
};
