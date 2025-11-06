// 🧠 Helper: format difference between two times using Saudi time
const getTimeDiffString = (pastTime) => {
  // نجيب التوقيت الحالي بالسعودية
  const nowSaudi = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const pastSaudi = new Date(
    new Date(pastTime).toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );

  const diffMs = nowSaudi - pastSaudi;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// 🚗 Main function to get car status (Saudi time)
export const getCarStatus = (car) => {
  if (!car) return "Unknown";

  const { lastSignel, lastSignelGPS, speed } = car;

  if (!lastSignel) return "Inactive";

  const nowSaudi = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const lastSignalTime = new Date(
    new Date(lastSignel).toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );
  const lastGPS = new Date(
    new Date(lastSignelGPS).toLocaleString("en-US", { timeZone: "Asia/Riyadh" })
  );

  const hoursSinceLastSignal = (nowSaudi - lastSignalTime) / (1000 * 60 * 60);
  const hoursSinceLastGPS = (nowSaudi - lastGPS) / (1000 * 60 * 60);

  if (hoursSinceLastSignal > 2) {
    return `Offline (${getTimeDiffString(lastSignel)})`;
  }

  if (speed > 0) {
    return `Moving (${speed} km/h)`;
  }

  if ((speed === 0 || !speed || speed ==='undefined' )) {// && hoursSinceLastGPS <= 2
    return `Static (${getTimeDiffString(lastSignelGPS)})`;
  }

  console.clear();
  console.log("hoursSinceLastSignal", hoursSinceLastSignal);
  console.log("speed", speed);
  console.log("hoursSinceLastGPS", hoursSinceLastGPS);
  return "Unknown" ;
};
