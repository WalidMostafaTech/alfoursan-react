import { useEffect } from "react";
import { toast } from "react-toastify";

const useCarSocket = (cars, setCars, isInit) => {
  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const ws = new WebSocket("wss://alfursantracking.com:2053");

    ws.onopen = () => {
      // console.log("✅ WebSocket connected");
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
      // console.log("📩 WS message:", data);

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
                    speed: data.data.speed || 0,
                    direction: data.data.direction,
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

      // if (data.type === "replay" && data.data?.imei) {
      //   console.warn("🚨 replay:", data);
      //   toast.success("Hello", {
      //     position: "bottom-right",
      //   });
      // }

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
      // console.log("❌ WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [isInit]);
};

export default useCarSocket;

// import { useEffect, useState, useRef } from "react";
// import { toast } from "react-toastify";

// const useCarSocket = (cars, setCars, isInit) => {
//   const [toastQueue, setToastQueue] = useState([]);
//   const activeToasts = useRef([]);

//   useEffect(() => {
//     if (!cars || cars.length === 0) return;

//     const ws = new WebSocket("wss://alfursantracking.com:2053");

//     ws.onopen = () => {
//       cars.forEach((car) => {
//         if (car.serial_number) {
//           ws.send(
//             JSON.stringify({
//               type: "subscribe",
//               imei: car.serial_number,
//             })
//           );
//         }
//       });
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       // GPS Update
//       if (data.type === "gps" && data.data?.imei) {
//         const gps = data.data.gps;
//         if (gps?.longitude && gps?.latitude) {
//           setCars((prev) => {
//             const updated = prev.map((car) =>
//               car.serial_number === data.data.imei
//                 ? {
//                     ...car,
//                     position: {
//                       lat: parseFloat(gps.latitude),
//                       lng: parseFloat(gps.longitude),
//                     },
//                     speed: data.data.speed || 0,
//                     direction: data.data.direction,
//                     status: data.data.statusDecoded?.accOn ? "on" : "off",
//                     lastUpdate: Date.now(),
//                     lastSignel: data.data.date,
//                     lastSignelGPS: data.data.date,
//                   }
//                 : car
//             );
//             return [...updated].sort((a, b) => (b.speed > 0 ? 1 : 0) - (a.speed > 0 ? 1 : 0));
//           });
//         }
//       }

//       // Alarm: Push to queue
//       if (data.type === "replay" && data.data?.imei) {
//         setToastQueue((prev) => [
//           ...prev,
//           { id: Date.now() + Math.random(), message: data.data.alarmTextAr },
//         ]);
//       }

//       // Heartbeat
//       if (data.type === "heartbeat" && data.data?.imei) {
//         setCars((prev) =>
//           prev.map((car) =>
//             car.serial_number === data.data.imei
//               ? { ...car, voltage: data.data.heartbeat.externalVoltage }
//               : car
//           )
//         );
//       }
//     };

//     ws.onclose = () => {};

//     return () => ws.close();
//   }, [isInit]);

//   // Effect to handle toast queue
//   useEffect(() => {
//     if (!toastQueue.length) return;

//     const interval = setInterval(() => {
//       if (activeToasts.current.length < 3 && toastQueue.length > 0) {
//         const next = toastQueue.shift();
//         const toastId = toast(next.message, {
//           position: "bottom-right",
//           onClose: () => {
//             activeToasts.current = activeToasts.current.filter((id) => id !== toastId);
//           },
//         });
//         activeToasts.current.push(toastId);
//         setToastQueue([...toastQueue]);
//       }
//     }, 500); // كل نص ثانية نحاول نشوف لو نقدر نعرض جديد

//     return () => clearInterval(interval);
//   }, [toastQueue]);
// };

// export default useCarSocket;
