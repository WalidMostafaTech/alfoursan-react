// import { useEffect } from "react";
// import { toast } from "react-toastify";

// /* ===== Alarm Toast UI ===== */
// const AlarmToast = ({ carName, speed, alarm, IMEI }) => {
//   return (
//     <div className="text-sm leading-5 space-y-2 w-full" dir="rtl">
//       <p className="font-bold text-mainColor">{alarm}</p>
//       <p>
//         السيارة: <b>{carName}</b>
//       </p>
//       <p>
//         السرعة: <b>{speed} كم/س</b>
//       </p>
//       <p> IMEI: {IMEI}</p>
//     </div>
//   );
// };

// /* ===== Hook ===== */
// const useCarSocket = (cars, setCars, isInit) => {
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
//       // console.log("📩 WS:", data);

//       /* ===== GPS UPDATE ===== */
//       if (data.type === "gps" && data.data?.imei) {
//         const gps = data.data.gps;

//         if (gps?.latitude && gps?.longitude) {
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

//             return [...updated].sort((a, b) => {
//               const aMoving = a.speed > 0 ? 1 : 0;
//               const bMoving = b.speed > 0 ? 1 : 0;
//               return bMoving - aMoving;
//             });
//           });
//         }
//       }

//       /* ===== ALARM ===== */
//       if (data.type === "alarm" && data.data?.imei) {
//         console.warn("🚨 ALARM", data.data);
//         const imei = data.data.imei;

//         const car = cars.find((c) => c.serial_number === imei);

//         toast(
//           <AlarmToast
//             carName={car?.name || car?.car_number || "غير معروف"}
//             speed={data.data.speed || 0}
//             alarm={data.data.alarmTextAr || "غير معروف"}
//             time={data.data.date || "غير معروف"}
//             IMEI={imei || "غير معروف"}
//           />,
//           {
//             position: "bottom-right",
//             autoClose: 5000,
//           }
//         );
//       }

//       /* ===== HEARTBEAT ===== */
//       if (data.type === "heartbeat" && data.data?.imei) {
//         setCars((prev) =>
//           prev.map((car) =>
//             car.serial_number === data.data.imei
//               ? {
//                   ...car,
//                   voltage: data.data.heartbeat.externalVoltage,
//                 }
//               : car
//           )
//         );
//       }
//     };

//     ws.onclose = () => {
//       console.log("❌ WebSocket closed");
//     };

//     return () => {
//       ws.close();
//     };
//   }, [isInit]);

//   return null;
// };

// export default useCarSocket;

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setCommandResponse } from "../store/modalsSlice";

/* ===== Alarm Toast UI ===== */
const AlarmToast = ({ carName, speed, alarm, IMEI }) => {
  return (
    <div className="text-sm leading-5 space-y-2 w-full" dir="rtl">
      <p className="font-bold text-mainColor">{alarm}</p>
      <p>
        السيارة: <b>{carName}</b>
      </p>
      <p>
        السرعة: <b>{speed} كم/س</b>
      </p>
      <p>IMEI: {IMEI}</p>
    </div>
  );
};

/* ===== Hook ===== */
const useCarSocket = (cars, setCars, isInit) => {
  const dispatch = useDispatch();
  const { notificationSound } = useSelector((state) => state.map);
  const { detailsModal } = useSelector((state) => state.modals);

  const alarmAudioRef = useRef(null);

  const notificationSoundRef = useRef(notificationSound);
  const detailsModalRef = useRef(detailsModal);
  const wsRef = useRef(null);
  const subscribedImeisRef = useRef(new Set());
  const indexByImeiRef = useRef(new Map());

  useEffect(() => {
    notificationSoundRef.current = notificationSound;
  }, [notificationSound]);

  useEffect(() => {
    detailsModalRef.current = detailsModal;
  }, [detailsModal]);

  const carsRef = useRef(cars);

  const parseTimeMs = (value) => {
    if (!value) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  };

  useEffect(() => {
    carsRef.current = cars;
    const next = new Map();
    (cars || []).forEach((car, idx) => {
      if (car?.serial_number) next.set(car.serial_number, idx);
    });
    indexByImeiRef.current = next;
  }, [cars]);

  useEffect(() => {
    // تجهيز الصوت مرة واحدة
    alarmAudioRef.current = new Audio("/alarm.wav");
    alarmAudioRef.current.volume = 1;
    alarmAudioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const ws = new WebSocket("wss://alfursantracking.com:2053");
    wsRef.current = ws;
    subscribedImeisRef.current = new Set();

    ws.onopen = () => {
      carsRef.current.forEach((car) => {
        const imei = car.serial_number;
        if (!imei) return;
        if (subscribedImeisRef.current.has(imei)) return;
        subscribedImeisRef.current.add(imei);
        ws.send(JSON.stringify({ type: "subscribe", imei }));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      /* ===== GPS ===== */
      // if (data.type === "gps" && data.data?.imei) {
      //   const gps = data.data.gps;

      //   if (gps?.latitude && gps?.longitude) {
      //     setCars((prev) =>
      //       [
      //         ...prev.map((car) =>
      //           car.serial_number === data.data.imei
      //             ? {
      //                 ...car,
      //                 position: { lat: +gps.latitude, lng: +gps.longitude },
      //                 speed: data.data.speed || 0,
      //                 status: data.data.statusDecoded?.accOn ? "on" : "off",
      //                 lastUpdate: Date.now(),
      //               }
      //             : car
      //         ),
      //       ].sort((a, b) => (b.speed > 0) - (a.speed > 0))
      //     );
      //   }
      // }

      if (data.type === "gps" && data.data?.imei) {
        const gps = data.data.gps;
        if (gps?.longitude && gps?.latitude) {
          const imei = data.data.imei;
          const incomingMs = parseTimeMs(data.data.date);
          const nextPos = {
            lat: parseFloat(gps.latitude),
            lng: parseFloat(gps.longitude),
          };
          const nextSpeed = data.data.speed || 0;
          const nextDir = data.data.direction;
          const nextStatus = data.data.statusDecoded?.accOn ? "on" : "off";

          setCars((prev) => {
            // ✅ استخدم index سريع لو صحيح، وإلا اعمل fallback للبحث (لتجنب تحديث عنصر غلط عند reorder)
            let idx = indexByImeiRef.current.get(imei);
            if (idx !== undefined && prev[idx]?.serial_number !== imei) {
              idx = prev.findIndex((c) => c?.serial_number === imei);
            }

            const applyUpdate = (car) => {
              if (!car) return car;

              // ✅ تجاهل تحديثات GPS القديمة (out-of-order) لتجنب القفزات الكبيرة/الوميض
              const prevMs =
                car.lastGpsAtMs ??
                parseTimeMs(car.lastSignelGPS) ??
                parseTimeMs(car.lastSignel);
              if (incomingMs != null && prevMs != null && incomingMs <= prevMs) {
                return car;
              }

              const samePos =
                car.position?.lat === nextPos.lat && car.position?.lng === nextPos.lng;
              const sameMeta =
                (Number(car.speed) || 0) === nextSpeed &&
                (car.direction ?? 0) === (nextDir ?? 0) &&
                (car.status ?? "") === nextStatus;

              // ✅ no-op: لا تعمل rerender لو مفيش تغيير فعلي
              if (samePos && sameMeta) return car;

              return {
                ...car,
                position: nextPos,
                speed: nextSpeed,
                direction: nextDir,
                status: nextStatus,
                lastUpdate: Date.now(),
                lastSignel: data.data.date,
                lastSignelGPS: data.data.date,
                lastGpsAtMs: incomingMs ?? Date.now(),
              };
            };

            if (idx === undefined || idx < 0) {
              let changed = false;
              const next = prev.map((car) => {
                if (car?.serial_number !== imei) return car;
                const updated = applyUpdate(car);
                if (updated !== car) changed = true;
                return updated;
              });
              return changed ? next : prev;
            }

            const existing = prev[idx];
            if (!existing) return prev;
            const updated = applyUpdate(existing);
            if (updated === existing) return prev;
            const next = prev.slice();
            next[idx] = updated;
            return next;
          });
        }
      }

      /* ===== ALARM ===== */
      if (data.type === "alarm" && data.data?.imei) {
        const imei = data.data.imei;
        const car = carsRef.current.find((c) => c.serial_number === imei);

        // 🔥 شغّل الصوت فقط لو ref.current = true
        if (notificationSoundRef.current && alarmAudioRef.current) {
          alarmAudioRef.current.currentTime = 0;
          alarmAudioRef.current.play().catch(() => {});
        }

        toast(
          <AlarmToast
            carName={car?.name || "غير معروف"}
            speed={data.data.speed || 0}
            alarm={data.data.alarmTextAr || "غير معروف"}
            IMEI={imei}
          />,
          { position: "bottom-right", autoClose: 5000 }
        );
      }



      /* ===== HEARTBEAT ===== */
      if (data.type === "heartbeat" && data.data?.imei) {
        setCars((prev) => {
          const idx = indexByImeiRef.current.get(data.data.imei);
          if (idx === undefined) {
            return prev.map((car) =>
              car.serial_number === data.data.imei
                ? { ...car, voltage: data.data.heartbeat.externalVoltage }
                : car
            );
          }
          const existing = prev[idx];
          if (!existing) return prev;
          const next = prev.slice();
          next[idx] = {
            ...existing,
            voltage: data.data.heartbeat.externalVoltage,
          };
          return next;
        });
      }

      /* ===== COMMAND RESPONSE ===== */
      if (data.type === "command_response" && data.data?.response && data.data?.imei) {
        const response = data.data.response;
        const imei = data.data.imei;
        
        // التحقق من أن Modal مفتوح وأن IMEI يطابق الجهاز المفتوح
        const currentModal = detailsModalRef.current;
        const isModalOpen = currentModal?.show;
        const modalDeviceId = currentModal?.id;
        const modalDevice = carsRef.current.find((car) => car.id === modalDeviceId);
        const modalImei = modalDevice?.serial_number;
        
        const isMatchingDevice = isModalOpen && modalImei === imei;
        
        // حفظ الاستجابة في Redux
        dispatch(setCommandResponse({ response, imei }));
        
        // إذا كان Modal مغلق أو الجهاز غير مطابق، عرض toast
        if (!isMatchingDevice) {
          const car = carsRef.current.find((c) => c.serial_number === imei);
          const carName = car?.name || car?.car_number || "غير معروف";
          
          toast.success(
            <div className="text-sm leading-5 space-y-1 w-full" dir="rtl">
              <p className="font-bold text-mainColor">✅ استجابة الأمر</p>
              <p className="text-gray-700 break-all">{response}</p>
              <p className="text-xs text-gray-500">
                السيارة: {carName} | IMEI: {imei}
              </p>
            </div>,
            {
              position: "bottom-right",
              autoClose: 8000,
            }
          );
        }
      }

    };

    return () => {
      try {
        ws.close();
      } finally {
        if (wsRef.current === ws) wsRef.current = null;
        subscribedImeisRef.current = new Set();
      }
    };
  }, [isInit]);

  // لو الأجهزة اتغيرت بعد فتح الـ socket (مثلاً بعد full=1)، اشترك في IMEIs الجديدة بدون reconnect
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    carsRef.current.forEach((car) => {
      const imei = car.serial_number;
      if (!imei) return;
      if (subscribedImeisRef.current.has(imei)) return;
      subscribedImeisRef.current.add(imei);
      ws.send(JSON.stringify({ type: "subscribe", imei }));
    });
  }, [cars]);

  return null;
};

export default useCarSocket;
