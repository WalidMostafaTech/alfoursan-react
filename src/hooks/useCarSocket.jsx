import { useEffect } from "react";
import { toast } from "react-toastify";

/* ===== Alarm Toast UI ===== */
const AlarmToast = ({ carName, speed, alarm, time, IMEI }) => {
  return (
    <div className="text-sm leading-5 space-y-2 w-full" dir="rtl">
      <p className="font-bold text-mainColor">{alarm}</p>

      <p>
        السيارة: <b>{carName}</b>
      </p>

      <p>
        السرعة: <b>{speed} كم/س</b>
      </p>

      <p> IMEI: {IMEI}</p>
    </div>
  );
};

/* ===== Sound ===== */
const playAlarmSound = () => {
  const audio = new Audio("/alarm.wav");
  audio.play().catch(() => {});
};

/* ===== Hook ===== */
const useCarSocket = (cars, setCars, isInit) => {
  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const ws = new WebSocket("wss://alfursantracking.com:2053");

    ws.onopen = () => {
      cars.forEach((car) => {
        if (car.serial_number) {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              imei: car.serial_number,
            })
          );
        }
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WS:", data);

      /* ===== GPS UPDATE ===== */
      if (data.type === "gps" && data.data?.imei) {
        const gps = data.data.gps;

        if (gps?.latitude && gps?.longitude) {
          setCars((prev) => {
            const updated = prev.map((car) =>
              car.serial_number === data.data.imei
                ? {
                    ...car,
                    position: {
                      lat: parseFloat(gps.latitude),
                      lng: parseFloat(gps.longitude),
                    },
                    speed: data.data.speed || 0,
                    direction: data.data.direction,
                    status: data.data.statusDecoded?.accOn ? "on" : "off",
                    lastUpdate: Date.now(),
                    lastSignel: data.data.date,
                    lastSignelGPS: data.data.date,
                  }
                : car
            );

            return [...updated].sort((a, b) => {
              const aMoving = a.speed > 0 ? 1 : 0;
              const bMoving = b.speed > 0 ? 1 : 0;
              return bMoving - aMoving;
            });
          });
        }
      }

      /* ===== ALARM ===== */
      if (data.type === "alarm" && data.data?.imei) {
        console.warn("🚨 ALARM", data.data);
        const imei = data.data.imei;

        const car = cars.find((c) => c.serial_number === imei);

        playAlarmSound();

        toast(
          <AlarmToast
            carName={car?.name || car?.car_number || "غير معروف"}
            speed={data.data.speed || 0}
            alarm={data.data.alarmTextAr || "غير معروف"}
            time={data.data.date || "غير معروف"}
            IMEI={imei || "غير معروف"}
          />,
          {
            position: "bottom-right",
            autoClose: 5000,
          }
        );
      }

      /* ===== HEARTBEAT ===== */
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

  return null;
};

export default useCarSocket;
