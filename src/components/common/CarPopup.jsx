import { FaMapMarkerAlt, FaPlane, FaPlaneSlash, FaSatelliteDish, FaUser } from "react-icons/fa";
import {
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
import { MdOutlineCarCrash, MdOutlineElectricBolt } from "react-icons/md";
import { getCarStatus } from "../../utils/getCarStatus";
import { useDispatch } from "react-redux";
import {
  openDetailsModal,
  openPolygonMenu,
  openShareModal,
} from "../../store/modalsSlice";
import { PiPhoneCall, PiPolygon } from "react-icons/pi";
import { Link } from "react-router-dom";

const CarPopup = ({ car, showActions = true }) => {
  const { status, color } = getCarStatus(car);

  const isFlightMode = (() => {

    return car.status ==  "off";
    const v = car?.voltageLevel;
    if (v == null || v === "") return true;
    const n = typeof v === "number" ? v : Number.parseFloat(String(v));
    if (!Number.isFinite(n)) return true;
    return n <= 0;
  })();

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ملاحظة: تجنب console.log داخل Popup لأن تحديثات العربيات كثيفة وقد تبطئ المتصفح

  const carDetails = [
    { label: formatDate(car.lastSignel), icon: <FaSatelliteDish /> },
    { label: "Wired", icon: <FiWifi /> },
    
    { label: formatDate(car.lastSignelGPS), icon: <ImLocation2 /> },
    // { label: `${car.speed} km/h`, icon: <IoSpeedometerSharp /> },
    { label: status, icon: <MdOutlineCarCrash /> },


    isFlightMode
      ? {
          label: "Flight mode",
          icon: <FaPlane style={{ color: "#ef4444" }} />,
        }
      : { label: car.voltageLevel, icon: <MdOutlineElectricBolt /> },
    { label: car.iccid, icon: `iccid` },

    { label: car.contact_person, icon: <FaUser /> },
    { label: car.contact_phone, icon: <PiPhoneCall /> },

    // إضافة اسم السائق و رقم الاي دي 


  ];

  const dispatch = useDispatch();

  return (
    <div className="
    bg-white p-3 rounded-xl shadow-lg space-y-3 w-[400px] max-w-[95vw]" dir="rtl">
      {/* عنوان العربية */}
      <h4 className="font-bold text-sm flex items-center justify-between gap-2">
        <span className="line-clamp-1">{car.name}</span>
        <span
          className="text-xs font-semibold whitespace-nowrap"
          style={{ color }}
        >
          {isFlightMode && (
            <span className="inline-flex items-center me-1" title="Flight mode">
              <FaPlaneSlash style={{ color: "#ef4444" }} />
            </span>
          )}
          {status}
        </span>
      </h4>

      {/* بيانات */}
      <div className="grid grid-cols-2 gap-2">
        {carDetails.map((detail, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="text-sm text-gray-400"> {detail.icon}</span>
            <p className="text-gray-600 text-xs font-medium line-clamp-1">
              {detail.label || "—"}
            </p>
          </div>
        ))}
      </div>

      {/* العنوان */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
        target="_blank"
        rel="noreferrer"
        className="flex gap-1 w-full hover:underline outline-none"
      >
        <FaMapMarkerAlt className="text-mainColor text-base mt-0.5" />
        <p className="text-gray-600 font-medium flex-1 text-xs line-clamp-2">
          {car.address}
        </p>
      </a>

      {showActions && (
        <div className="w-full flex flex-wrap justify-between items-center gap-1 text-lg">
          <span className="tooltip tooltip-top" data-tip="التفاصيل">
            <button
              type="button"
              aria-label="التفاصيل"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() => dispatch(openDetailsModal({ section: "", id: car.id }))}
            >
              <FiMenu />
            </button>
          </span>

          <span className="tooltip tooltip-top" data-tip="تتبع">
            <a
              aria-label="Tracking"
              href={car.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
            >
              <FiNavigation />
            </a>
          </span>

          <span className="tooltip tooltip-top" data-tip="Playback">
            <Link
              aria-label="Playback"
              target="_blank"
              to={`/car-replay/${car.serial_number}`}
              rel="noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
            >
              <FiPlayCircle />
            </Link>
          </span>

          <span className="tooltip tooltip-top" data-tip="أوامر">
            <button
              type="button"
              aria-label="أوامر"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() =>
                dispatch(openDetailsModal({ section: "command", id: car.id }))
              }
            >
              <HiOutlineCommandLine />
            </button>
          </span>

          <span className="tooltip tooltip-top" data-tip="Fence">
            <button
              type="button"
              aria-label="Fence"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() => dispatch(openPolygonMenu())}
            >
              <PiPolygon />
            </button>
          </span>

          <span className="tooltip tooltip-top" data-tip="Street View">
            <a
              aria-label="Street View"
              href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
            >
              <FiUser />
            </a>
          </span>

          <span className="tooltip tooltip-top" data-tip="تقارير">
            <a
              aria-label="Reports"
              href={car.report_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
            >
              <FiBarChart2 />
            </a>
          </span>

          <span className="tooltip tooltip-top" data-tip="مشاركة">
            <button
              type="button"
              aria-label="مشاركة"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-mainColor/10 hover:text-mainColor hover:border-mainColor/30 transition"
              onClick={() => dispatch(openShareModal(car.serial_number))}
            >
              <FiShare2 />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default CarPopup;
