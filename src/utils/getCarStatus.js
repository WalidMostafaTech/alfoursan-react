// 🧠 Helper function: format difference between two times
const getTimeDiffString = (pastTime) => {
  const diffMs = Date.now() - new Date(pastTime).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// 🚗 Main function to get car status
export const getCarStatus = (car) => {
  if (!car) return "Unknown";

  const { lastSignel, lastSignelGPS, speed } = car;

  if (!lastSignel) return "Inactive";

  const now = new Date();
  const lastSignalTime = new Date(lastSignel);
  const lastGPS = new Date(lastSignelGPS);

  const hoursSinceLastSignal =
    (now.getTime() - lastSignalTime.getTime()) / (1000 * 60 * 60);
  const hoursSinceLastGPS =
    (now.getTime() - lastGPS.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastSignal > 2) {
    return `Offline (${getTimeDiffString(lastSignel)})`;
  }

  if (speed > 0) {
    return `Moving (${speed} km/h)`;
  }

  if (speed === 0 && hoursSinceLastGPS <= 2) {
    return `Static (${getTimeDiffString(lastSignelGPS)})`;
  }

  return "Unknown" ;
};
