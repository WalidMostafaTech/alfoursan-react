// import { useEffect } from "react";
// import { toast } from "react-toastify";

// /* ===== Alarm Toast UI ===== */
// const AlarmToast = ({ carName, speed, alarm, IMEI }) => {
//   return (
//     <div className="text-sm leading-5 space-y-2 w-full" >
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
    <div className="w-full">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-red-200 bg-red-50 text-red-700 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.198 0l7.17 12.414c1.154 2-.288 4.5-2.599 4.5H4.83c-2.31 0-3.753-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-red-700 leading-5">
            {alarm}
          </p>

          <div className="mt-2 space-y-1 text-xs text-slate-700">
            <p className="truncate">
              السيارة:{" "}
              <span className="font-bold text-slate-900">{carName}</span>
            </p>
            <p>
              السرعة: <span className="font-bold text-slate-900">{speed}</span>{" "}
              كم/س
            </p>
            <p className="text-[11px] text-slate-500 break-all">IMEI: {IMEI}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Hook ===== */
// options:
// - enabled: لتفعيل/إيقاف السوكت يدويًا (مثلاً لإعادة تشغيل دورية)
// - resetKey: تغيير القيمة يجبر الـ hook يعمل disconnect ثم reconnect
// - onStatusChange: callback لاستقبال حالة السوكت (للـ loaders/health UI)
const useCarSocket = (cars, setCars, isInit, options = {}) => {
  const dispatch = useDispatch();
  const { notificationSound } = useSelector((state) => state.map);
  const { detailsModal } = useSelector((state) => state.modals);
  const enabled = options?.enabled ?? true;
  const resetKey = options?.resetKey ?? 0;
  const onStatusChange = options?.onStatusChange;
  const debug = options?.debug ?? false;
  const tag = options?.tag ?? "CarSocket";

  const alarmAudioRef = useRef(null);

  const notificationSoundRef = useRef(notificationSound);
  const detailsModalRef = useRef(detailsModal);
  const wsRef = useRef(null);
  const subscribedImeisRef = useRef(new Set());
  const indexByImeiRef = useRef(new Map());
  const onStatusRef = useRef(onStatusChange);

  useEffect(() => {
    notificationSoundRef.current = notificationSound;
  }, [notificationSound]);

  useEffect(() => {
    detailsModalRef.current = detailsModal;
  }, [detailsModal]);

  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);

  const emitStatus = (status, extra = {}) => {
    try {
      onStatusRef.current?.({ status, ...extra });
    } catch {
      // ignore
    }
  };

  const carsRef = useRef(cars);

  const log = (...args) => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.log(`[${tag}]`, ...args);
  };
  const warn = (...args) => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.warn(`[${tag}]`, ...args);
  };
  const error = (...args) => {
    // أخطاء السوكت مفيدة حتى لو debug=false
    // eslint-disable-next-line no-console
    console.error(`[${tag}]`, ...args);
  };

  const parseTimeMs = (value) => {
    if (!value) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  };

  const normalizeBool = (value) => {
    if (value === null || value === undefined) return null;
    if (value === "") return null;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.toLowerCase();
      if (v === "on" || v === "true" || v === "1") return true;
      if (v === "off" || v === "false" || v === "0") return false;
      return null;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return null;
      return value !== 0;
    }
    return !!value;
  };

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  useEffect(() => {
    // تجهيز الصوت مرة واحدة
    alarmAudioRef.current = new Audio("/alarm.wav");
    alarmAudioRef.current.volume = 1;
    alarmAudioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    // ✅ إيقاف السوكت يدويًا (مثلاً أثناء refresh كل 15 دقيقة)
    if (!enabled) {
      emitStatus("disabled");
      const ws = wsRef.current;
      if (ws) {
        try {
          ws.close();
        } catch {
          // ignore
        } finally {
          wsRef.current = null;
          subscribedImeisRef.current = new Set();
          indexByImeiRef.current = new Map();
        }
      }
      return;
    }

    if (!isInit) return;
    if (!cars || cars.length === 0) return;

    emitStatus("connecting");
    log("connecting...", { resetKey });
    const ws = new WebSocket("wss://alfursantracking.com:2053");
    wsRef.current = ws;
    subscribedImeisRef.current = new Set();
    indexByImeiRef.current = new Map();

    ws.onopen = () => {
      emitStatus("open");
      let subscribedCount = 0;
      (carsRef.current || []).forEach((car, idx) => {
        const imei = car?.serial_number;
        if (!imei) return;
        // index map: يجهّز lookup سريع لتحديثات GPS
        if (!indexByImeiRef.current.has(imei))
          indexByImeiRef.current.set(imei, idx);
        if (subscribedImeisRef.current.has(imei)) return;
        subscribedImeisRef.current.add(imei);
        ws.send(JSON.stringify({ type: "subscribe", imei }));
        subscribedCount += 1;
        log("subscribe =>", imei);
      });
      // ✅ "ready": تم فتح الاتصال وبعث الاشتراكات الحالية
      emitStatus("ready", { subscribedCount });
      log("ready", { subscribedCount });
    };

    ws.onerror = (e) => {
      emitStatus("error");
      error("socket error", e);
    };

    ws.onclose = (e) => {
      emitStatus("closed");
      warn("socket closed", { code: e?.code, reason: e?.reason });
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        error("failed to parse ws message", e, event?.data);
        return;
      }

      log("<= message", data);

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

      if (data.type === "gps" && (data.data?.imei || data.data?.serial)) {
        // السيرفر أحيانًا يبعث imei + serial معًا (مثل: imei=3539..., serial=10b2)
        const imei = data.data.imei ?? null;
        const serial = data.data.serial ?? null;
        const matchKeys = [imei, serial].filter(Boolean);

        // ✅ دعم أكثر من شكل للـ payload (أحيانًا gps تكون داخل data.data.gps وأحيانًا مباشرة)
        const gps = data.data.gps ?? data.data;
        const latRaw = gps?.latitude ?? gps?.lat;
        const lngRaw = gps?.longitude ?? gps?.lng;
        if (latRaw == null || lngRaw == null) return;

        const lat = parseFloat(latRaw);
        const lng = parseFloat(lngRaw);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const dateValue = data.data.date ?? gps?.date ?? null;
        const incomingMs = parseTimeMs(dateValue);

        const nextPos = { lat, lng };
        const nextSpeed = Number(data.data.speed ?? gps?.speed ?? 0) || 0;
        const nextDir = data.data.direction ?? gps?.direction;
        const nextStatus = data.data.statusDecoded?.accOn ? "on" : "off";
        const attrs =
          data.data.attributes ??
          data.data.traccar_raw?.attributes ??
          data.data.legacy?.attributes ??
          {};
        const nextIgnition = normalizeBool(
          attrs?.ignition ??
            data.data.ignition ??
            data.data.accOn ??
            data.data.acc_status ??
            null,
        );
        const nextMotion = normalizeBool(
          attrs?.motion ?? data.data.motion ?? null,
        );
        const nextCharge = normalizeBool(
          attrs?.charge ?? data.data.charge ?? null,
        );

        log("GPS", {
          imei,
          serial,
          lat,
          lng,
          speed: nextSpeed,
          direction: nextDir,
          date: dateValue,
        });

        setCars((prev) => {
          // ✅ اختَر أول مفتاح يطابق (imei ثم serial)
          const resolveIndex = () => {
            for (const key of matchKeys) {
              let idx = indexByImeiRef.current.get(key);
              if (idx !== undefined && prev[idx]?.serial_number === key)
                return { idx, key };
              if (idx !== undefined && prev[idx]?.serial_number !== key) {
                idx = prev.findIndex((c) => c?.serial_number === key);
              } else if (idx === undefined) {
                idx = prev.findIndex((c) => c?.serial_number === key);
              }
              if (idx >= 0) {
                indexByImeiRef.current.set(key, idx);
                return { idx, key };
              }
            }
            return { idx: -1, key: null };
          };

          const { idx, key: matchedKey } = resolveIndex();

          const applyUpdate = (car) => {
            if (!car) return car;
            const ignition_on =
              nextIgnition === null ? car.ignition_on : nextIgnition;
            const motion = nextMotion === null ? car.motion : nextMotion;
            const charge = nextCharge === null ? car.charge : nextCharge;

            // ✅ تجاهل تحديثات GPS الأقدم (out-of-order) لتجنب الرجوع للخلف/الوميض
            const prevMs =
              car.lastGpsAtMs ??
              parseTimeMs(car.lastSignelGPS) ??
              parseTimeMs(car.lastSignel);
            // ملاحظة: نسمح بـ incomingMs === prevMs لأن بعض البروتوكولات قد تعيد نفس التوقيت
            // مع تحديثات مختلفة، لكن نرفض الأقدم فقط.
            // if (incomingMs != null && prevMs != null && incomingMs < prevMs) {
            //   log("GPS ignored (out-of-order)", { matchedKey, incomingMs, prevMs });
            //  // return car;
            // }

            const samePos =
              car.position?.lat === nextPos.lat &&
              car.position?.lng === nextPos.lng;
            const sameMeta =
              (Number(car.speed) || 0) === nextSpeed &&
              (car.direction ?? 0) === (nextDir ?? 0) &&
              (car.status ?? "") === nextStatus &&
              (car.ignition_on ?? null) === ignition_on &&
              (car.motion ?? null) === motion &&
              (car.charge ?? null) === charge;

            // ✅ no-op: لا تعمل rerender لو مفيش تغيير فعلي
            if (samePos && sameMeta) return car;

            return {
              ...car,
              position: nextPos,
              speed: nextSpeed,
              direction: nextDir,
              status: nextStatus,
              ignition_on,
              motion,
              charge,
              lastUpdate: Date.now(),
              lastSignel: dateValue ?? car.lastSignel,
              lastSignelGPS: dateValue ?? car.lastSignelGPS,
              lastGpsAtMs: incomingMs ?? Date.now(),
            };
          };

          if (idx < 0) {
            // لم نجد السيارة — هذا أهم log لتشخيص "السيارة لا تتحرك"
            warn("GPS for unknown device (no matching serial_number)", {
              matchKeys,
              availableCount: prev?.length || 0,
            });
            return prev;
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

      /* ===== ALARM ===== */
      if (data.type === "alarm" && data.data?.imei) {
        const imei = data.data.imei;
        const car = carsRef.current.find((c) => c.serial_number === imei);
        const attrs =
          data.data.attributes ??
          data.data.traccar_raw?.attributes ??
          data.data.legacy?.attributes ??
          {};
        const nextIgnition = normalizeBool(
          attrs?.ignition ??
            data.data.ignition ??
            data.data.accOn ??
            data.data.acc_status ??
            null,
        );
        const nextMotion = normalizeBool(
          attrs?.motion ?? data.data.motion ?? null,
        );
        const nextCharge = normalizeBool(
          attrs?.charge ?? data.data.charge ?? null,
        );

        if (
          nextIgnition !== null ||
          nextMotion !== null ||
          nextCharge !== null
        ) {
          setCars((prev) => {
            const idx = prev.findIndex((c) => c?.serial_number === imei);
            if (idx < 0) return prev;
            const existing = prev[idx];
            if (!existing) return prev;
            const next = prev.slice();
            next[idx] = {
              ...existing,
              ignition_on:
                nextIgnition === null ? existing.ignition_on : nextIgnition,
              motion: nextMotion === null ? existing.motion : nextMotion,
              charge: nextCharge === null ? existing.charge : nextCharge,
              lastUpdate: Date.now(),
            };
            return next;
          });
        }

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
          {
            position: "bottom-right",
            autoClose: 5000, // ✅ رجعنا الإغلاق التلقائي
            closeOnClick: true,
            draggable: true,
            hideProgressBar: false,
            icon: false,
            closeButton: ({ closeToast }) => (
              <button
                type="button"
                onClick={closeToast}
                aria-label="إغلاق"
                className="opacity-100! text-slate-500 hover:text-slate-900 transition-colors
                  rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-mainColor/40
                   left-0 absolute z-10 top-5"
                style={{ marginInlineStart: "8px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ),
            className:
              "alarm-toast !bg-white !text-slate-900 !rounded-xl !shadow-xl !border !border-red-200",
            style: { marginBottom: "48px" }, // رفع بسيط عن المكان الحالي
          },
        );
      }

      /* ===== HEARTBEAT ===== */
      if (data.type === "heartbeat" && data.data?.imei) {
        setCars((prev) => {
          const key = data.data.imei;
          let idx = indexByImeiRef.current.get(key);
          if (idx !== undefined && prev[idx]?.serial_number !== key) {
            idx = prev.findIndex((c) => c?.serial_number === key);
            if (idx >= 0) indexByImeiRef.current.set(key, idx);
          }
          if (idx === undefined) {
            idx = prev.findIndex((c) => c?.serial_number === key);
            if (idx >= 0) indexByImeiRef.current.set(key, idx);
          }
          if (idx < 0) return prev;
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

      /* ===== DEVICE STATUS (Traccar devices[] updates) ===== */
      if (data.type === "device" && (data.data?.imei || data.data?.uniqueId)) {
        const imei = (data.data.imei ?? data.data.uniqueId ?? "").toString();
        const status = data.data.status ?? data.data.device_status ?? null; // 'online' | 'offline'
        const lastUpdate =
          data.data.lastUpdate ?? data.data.device_lastUpdate ?? null;

        setCars((prev) => {
          const idx = prev.findIndex((c) => c?.serial_number === imei);
          if (idx < 0) return prev;
          const existing = prev[idx];
          if (!existing) return prev;

          const nextOffline =
            status === "offline"
              ? true
              : status === "online"
                ? false
                : existing.isOffline;

          const next = prev.slice();
          next[idx] = {
            ...existing,
            device_status: status ?? existing.device_status,
            device_lastUpdate: lastUpdate ?? existing.device_lastUpdate,
            // ✅ ربط Offline/Online من السوكت (بدون 4 ساعات)
            isOffline: nextOffline,
            isInactive: false,
            // لو ما عنده lastSignel قبل كده، خليه يتحدث من device.lastUpdate
            lastSignel:
              existing.lastSignel ?? lastUpdate ?? existing.lastSignel,
            lastUpdate: Date.now(),
          };
          return next;
        });
      }

      /* ===== COMMAND RESPONSE ===== */
      if (
        data.type === "command_response" &&
        data.data?.response &&
        data.data?.imei
      ) {
        const response = data.data.response;
        const imei = data.data.imei;

        // التحقق من أن Modal مفتوح وأن IMEI يطابق الجهاز المفتوح
        const currentModal = detailsModalRef.current;
        const isModalOpen = currentModal?.show;
        const modalDeviceId = currentModal?.id;
        const modalDevice = carsRef.current.find(
          (car) => car.id === modalDeviceId,
        );
        const modalImei = modalDevice?.serial_number;

        const isMatchingDevice = isModalOpen && modalImei === imei;

        // حفظ الاستجابة في Redux
        dispatch(setCommandResponse({ response, imei }));

        // إذا كان Modal مغلق أو الجهاز غير مطابق، عرض toast
        if (!isMatchingDevice) {
          const car = carsRef.current.find((c) => c.serial_number === imei);
          const carName = car?.name || car?.car_number || "غير معروف";

          toast.success(
            <div className="text-sm leading-5 space-y-1 w-full">
              <p className="font-bold text-mainColor">✅ استجابة الأمر</p>
              <p className="text-gray-700 break-all">{response}</p>
              <p className="text-xs text-gray-500">
                السيارة: {carName} | IMEI: {imei}
              </p>
            </div>,
            {
              position: "bottom-right",
              autoClose: 8000,
            },
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
        indexByImeiRef.current = new Map();
        emitStatus("closed");
        log("cleanup");
      }
    };
  }, [isInit, enabled, resetKey]);

  // لو الأجهزة اتغيرت بعد فتح الـ socket (مثلاً بعد full=1)، اشترك في IMEIs الجديدة بدون reconnect
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    (carsRef.current || []).forEach((car, idx) => {
      const imei = car?.serial_number;
      if (!imei) return;
      if (!indexByImeiRef.current.has(imei))
        indexByImeiRef.current.set(imei, idx);
      if (subscribedImeisRef.current.has(imei)) return;
      subscribedImeisRef.current.add(imei);
      ws.send(JSON.stringify({ type: "subscribe", imei }));
      log("subscribe (late) =>", imei);
    });
  }, [cars?.length]);

  return null;
};

export default useCarSocket;
