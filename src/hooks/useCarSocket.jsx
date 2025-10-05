import { useEffect } from "react";

const useCarSocket = (cars, setCars, isInit) => {
  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const ws = new WebSocket("wss://alfursantracking.com:2053");

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      cars.forEach((car) => {
        if (car.serial_number) {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              imei: car.serial_number, // السيرفر بيستخدم IMEI
            })
          );
        }
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WS message:", data);

      // GPS Update
      if (data.type === "gps" && data.data?.imei) {
        const gps = data.data.gps;
        if (gps?.longitude && gps?.latitude) {
          setCars((prev) => {
            const updated = prev.map((car) =>
              car.serial_number === data.data.imei
                ? {
                    ...car,
                    position: {
                      lat: parseFloat(gps.latitude),
                      lng: parseFloat(gps.longitude),
                    },
                    speed: data.data.speed,
                    bearing: data.data.direction,
                    status: data.data.statusDecoded?.accOn ? "on" : "off",
                    lastUpdate: Date.now(),
                    lastSignel: data.data.date,
                    lastSignelGPS: data.data.date,
                  }
                : car
            );

            // إعادة ترتيب العربيات بحيث اللي سرعتها > 0 تبقى فوق
            return [...updated].sort((a, b) => {
              const aMoving = a.speed > 0 ? 1 : 0;
              const bMoving = b.speed > 0 ? 1 : 0;
              return bMoving - aMoving; // العربيات المتحركة الأول
            });
          });
        }
      }

      // Alarm
      if (data.type === "alarm" && data.data?.imei) {
        console.warn("🚨 Alarm:", data.data.alarmTextAr);
      }

      // Heartbeat
      if (data.type === "heartbeat" && data.data?.imei) {
        setCars((prev) =>
          prev.map((car) =>
            car.serial_number === data.data.imei
              ? {
                  ...car,
                  voltage: data.data.heartbeat.externalVoltage,
                }
              : car
          )
        );
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [isInit]);
};

export default useCarSocket;
