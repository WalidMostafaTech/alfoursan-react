import { FaMapMarkerAlt, FaSatelliteDish } from "react-icons/fa";
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
import { PiPolygon } from "react-icons/pi";
import { Link } from "react-router-dom";

const CarPopup = ({ car }) => {
  const { status } = getCarStatus(car);

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

  const carDetails = [
    { label: formatDate(car.lastSignel), icon: <FaSatelliteDish /> },
    { label: "Wired", icon: <FiWifi /> },
    { label: formatDate(car.lastSignelGPS), icon: <ImLocation2 /> },
    { label: `${car.speed} km/h`, icon: <IoSpeedometerSharp /> },
    { label: status, icon: <MdOutlineCarCrash /> },
    { label: car.voltageLevel, icon: <MdOutlineElectricBolt /> },
  ];

  const dispatch = useDispatch();

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg space-y-4 w-[400px]">
      {/* عنوان العربية */}
      <h4 className="font-bold text-sm flex items-center gap-4">
        {car.name} <span className="text-mainColor">{status}</span>
      </h4>

      {/* بيانات */}
      <div className="grid grid-cols-2 gap-2">

        {carDetails.map((detail, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-gray-400"> {detail.icon}</span>
            <p className="text-gray-600 text-sm font-medium">{detail.label}</p>
          </div>
        ))}
      </div>

      {/* العنوان */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-1 w-fit hover:underline outline-none"
      >
        <FaMapMarkerAlt className="text-mainColor text-lg" />
        <p className="text-gray-600 font-medium flex-1 text-sm">
          {car.address}
        </p>
      </a>

      {/* الأيقونات */}
      <div className="w-full flex justify-evenly items-center gap-2 text-xl">
        <span
          title="Details"
          className="cursor-pointer hover:text-mainColor text-base"
          onClick={() =>
            dispatch(openDetailsModal({ section: "", id: car.id }))
          }
        >
          <FiMenu />
        </span>
        <a
          title="Tracking"
          href={car.tracking_url}
          target="_blank"
          className="cursor-pointer hover:text-mainColor text-base"
        >
          <FiNavigation />
        </a>
        <Link
          title="Playback"
          target="_blank"
          to={`/car-replay/${car.serial_number}`}
          className="cursor-pointer hover:text-mainColor text-base"
        >
          <FiPlayCircle />
        </Link>
        <span
          title="Command"
          className="cursor-pointer hover:text-mainColor text-base"
          onClick={() =>
            dispatch(openDetailsModal({ section: "command", id: car.id }))
          }
        >
          <HiOutlineCommandLine />
        </span>
        <span
          title="Fence"
          onClick={() => dispatch(openPolygonMenu())}
          className="cursor-pointer hover:text-mainColor text-base"
        >
          <PiPolygon />
        </span>
        <a
          title="Street View"
          href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
          target="_blank"
          className="cursor-pointer hover:text-mainColor text-base"
        >
          <FiUser />
        </a>
        <a
          title="Reports"
          href={car.report_url}
          target="_blank"
          className="cursor-pointer hover:text-mainColor text-base"
        >
          <FiBarChart2 />
        </a>
        <span
          title="Share"
          className="cursor-pointer hover:text-mainColor text-base"
          onClick={() => dispatch(openShareModal(car.serial_number))}
        >
          <FiShare2 />
        </span>
      </div>
    </div>
  );
};

export default CarPopup;
