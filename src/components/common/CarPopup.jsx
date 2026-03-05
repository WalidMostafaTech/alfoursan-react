import { FaMapMarkerAlt, FaPlane, FaPlaneSlash, FaSatelliteDish, FaUser } from "react-icons/fa";
import {
  FiActivity,
  FiBarChart2,
  FiMenu,
  FiNavigation,
  FiPlayCircle,
  FiShare2,
  FiUser,
  FiWifi,
} from "react-icons/fi";
import { ImLocation2 } from "react-icons/im";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { IoSpeedometerSharp } from "react-icons/io5";
import {
  MdOutlineCarCrash,
  MdOutlineElectricBolt,
  MdOutlinePowerSettingsNew,
} from "react-icons/md";
import { getCarStatus } from "../../utils/getCarStatus";
import { useDispatch } from "react-redux";
import {
  openDetailsModal,
  openPolygonMenu,
  openShareModal,
} from "../../store/modalsSlice";
import { PiPhoneCall, PiPolygon } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const CarPopup = ({ car, showActions = true }) => {
  const { status, color } = getCarStatus(car);
  const [now, setNow] = useState(() => Date.now());

  // ✅ countdown بسيط لتحديث العنوان (فقط داخل الـ Popup المفتوح)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const addressCountdown = useMemo(() => {
    const minMs = typeof car?.addressMinIntervalMs === "number" ? car.addressMinIntervalMs : null;
    if (minMs == null) return null; // لا نظهره إلا لو الصفحة مفعّلة الـ throttle
    const last = typeof car?.lastGeocodeAtMs === "number" ? car.lastGeocodeAtMs : 0;
    const remainingMs = Math.max(0, minMs - (now - last));
    const totalSec = Math.ceil(remainingMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    return { mm, ss };
  }, [car?.addressMinIntervalMs, car?.lastGeocodeAtMs, now]);

  const isFlightMode = (() => {
    return car?.status && car.status ==  "off";

    const v = car?.voltageLevel;
    if (v == null || v === "") return true;
    const n = typeof v === "number" ? v : Number.parseFloat(String(v));
    if (!Number.isFinite(n)) return true;
    return n <= 0;
  })();

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const formatBoolLabel = (value, onLabel, offLabel) => {
    if (value === null || value === undefined) return "—";
    return value ? onLabel : offLabel;
  };

  const formatTotalDistance = () => {
    // Prefer Traccar total distance (meters) coming from backend as device_total_distance
    const meters =
      car?.device_total_distance ??
      car?.totalDistance ??
      car?.attributes?.totalDistance ??
      null;
      // return `${meters.toFixed(1)} km`;

    if (meters != null && Number.isFinite(Number(meters))) {
      const km = Number(meters) / 1000;
      return `${km.toFixed(1)} km`;
    }

    // If backend sends a ready-to-display km field, use it WITHOUT converting again
    if (car?.totalDistanceKm != null && Number.isFinite(Number(car.totalDistanceKm))) {
      return `${Number(car.totalDistanceKm).toFixed(1)} km`;
    }

    // Legacy fallback
    if (car?.km_total != null && Number.isFinite(Number(car.km_total))) {
      return `${Number(car.km_total).toFixed(1)} km`;
    }

    return "—";
  };

  // ملاحظة: تجنب console.log داخل Popup لأن تحديثات العربيات كثيفة وقد تبطئ المتصفح

  const carDetails = [
    //totalDistance 
    // { label: formatTotalDistance(), icon: <FiNavigation /> },
    { label: formatDate(car.lastSignel), icon: <FaSatelliteDish /> },
    { label: "Wired", icon: <FiWifi /> },
    
    { label: formatDate(car.lastSignelGPS), icon: <ImLocation2 /> },
    // { label: `${car.speed} km/h`, icon: <IoSpeedometerSharp /> },
    { label: status, icon: <MdOutlineCarCrash /> },
    {
      label: formatBoolLabel(car?.ignition_on, "تشغيل", "إيقاف"),
      icon: (
        <MdOutlinePowerSettingsNew
          style={{ color: car?.ignition_on ? "#22c55e" : "#ef4444" }}
        />
      ),
    },
    {
      label: formatBoolLabel(car?.motion, "متحركة", "ثابتة"),
      icon: (
        <FiActivity style={{ color: car?.motion ? "#22c55e" : "#9ca3af" }} />
      ),
    },
    { label: car.iccid, icon: `iccid`, colSpan: 2 },

    {
      label: formatBoolLabel(car?.charge, "شحن", "غير شاحن"),
      icon: (
        <MdOutlineElectricBolt
          style={{ color: car?.charge ? "#f59e0b" : "#9ca3af" }}
        />
      ),
    },


    // isFlightMode
    //   ? {
    //       label: "Flight mode",
    //       icon: <FaPlane style={{ color: "#ef4444" }} />,
    //     }
    //   : { label: car.voltageLevel, icon: <MdOutlineElectricBolt /> },



    { label: car.contact_person, icon: <FaUser /> },
    { label: car.contact_phone, icon: <PiPhoneCall /> },

    // إضافة اسم السائق و رقم الاي دي 


  ];

  const dispatch = useDispatch();

  return (
    <div
      className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl border border-slate-200/70 w-[520px] max-w-[98vw] overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between gap-3 bg-white/70 backdrop-blur border-b border-slate-100">
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
            {car.name}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {car.carnum || car.serial_number || "—"}
          </p>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-white shadow-sm whitespace-nowrap"
          style={{ color }}
        >
          {status}
        </span>
      </div>

      {/* Details */}
      <div className="px-4 pt-2 pb-2">
        <div className="grid grid-cols-3 gap-1.5">
          {carDetails.map((detail, index) => (
            <div
              key={index}
              className={`flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white/80 px-2 py-1 shadow-sm ${
                detail.colSpan === 2 ? "col-span-2" : ""
              }`}
            >
              <span className="text-base text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                {detail.icon}
              </span>
              <p className="text-slate-700 text-[11px] font-medium leading-snug break-words">
                {detail.label || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="px-4 pb-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1 hover:bg-slate-100 transition"
        >
          <span className="text-mainColor text-base mt-0.5">
            <FaMapMarkerAlt />
          </span>
          <p className="text-slate-600 font-medium text-xs line-clamp-2">
            {car.address}
          </p>
        </a>
      </div>

      {showActions && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-8 gap-2 text-lg">
            <button
              type="button"
              aria-label="التفاصيل"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() =>
                dispatch(openDetailsModal({ section: "", id: car.id }))
              }
              title="التفاصيل"
            >
              <FiMenu />
            </button>

            <a
              aria-label="Tracking"
              href={car.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              title="تتبع"
            >
              <FiNavigation />
            </a>

            <Link
              aria-label="Playback"
              target="_blank"
              to={`/car-replay/${car.serial_number}`}
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              title="Playback"
            >
              <FiPlayCircle />
            </Link>

            <button
              type="button"
              aria-label="أوامر"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() =>
                dispatch(openDetailsModal({ section: "command", id: car.id }))
              }
              title="أوامر"
            >
              <HiOutlineCommandLine />
            </button>

            <button
              type="button"
              aria-label="Fence"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() => dispatch(openPolygonMenu())}
              title="Fence"
            >
              <PiPolygon />
            </button>

            <a
              aria-label="Street View"
              href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              title="Street View"
            >
              <FiUser />
            </a>

            <a
              aria-label="Reports"
              href={car.report_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              title="تقارير"
            >
              <FiBarChart2 />
            </a>

            <button
              type="button"
              aria-label="مشاركة"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() => dispatch(openShareModal(car.serial_number))}
              title="مشاركة"
            >
              <FiShare2 />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarPopup;
