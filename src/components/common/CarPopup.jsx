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

const CarPopup = ({ car }) => {
  const carDetails = [
    { label: car.lastSignel, icon: <FaSatelliteDish /> },
    { label: "Wired", icon: <FiWifi /> },
    { label: car.lastSignelGPS, icon: <ImLocation2 /> },
    { label: `${car.speed} km/h`, icon: <IoSpeedometerSharp /> },
    { label: getCarStatus(car), icon: <MdOutlineCarCrash /> },
    { label: car.voltageLevel, icon: <MdOutlineElectricBolt /> },
  ];

  const dispatch = useDispatch();

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg space-y-6 w-[500px]">
      {/* عنوان العربية */}
      <h4 className="font-bold text-lg flex items-center gap-4">
        {car.name} <span className="text-mainColor">{getCarStatus(car)}</span>
      </h4>

      {/* بيانات */}
      <div className="grid grid-cols-2 gap-2">
        {carDetails.map((detail, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-lg text-gray-400"> {detail.icon}</span>
            <p className="text-gray-600 text-base font-medium">
              {detail.label}
            </p>
          </div>
        ))}
      </div>

      {/* العنوان */}
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className="text-mainColor text-2xl" />
        <p className="text-base text-gray-600 font-medium flex-1">
          {car.address}
        </p>
      </div>

      {/* الأيقونات */}
      <div className="w-full flex justify-evenly items-center gap-2 text-xl">
        <span
          title="Details"
          className="cursor-pointer hover:text-mainColor"
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
          className="cursor-pointer hover:text-mainColor"
        >
          <FiNavigation />
        </a>
        <a
          title="Playback"
          href={car.replay_url}
          target="_blank"
          className="cursor-pointer hover:text-mainColor"
        >
          <FiPlayCircle />
        </a>
        <span
          title="Command"
          className="cursor-pointer hover:text-mainColor"
          onClick={() =>
            dispatch(openDetailsModal({ section: "command", id: car.id }))
          }
        >
          <HiOutlineCommandLine />
        </span>
        <span
          title="Fence"
          onClick={() => dispatch(openPolygonMenu())}
          className="cursor-pointer hover:text-mainColor"
        >
          <PiPolygon />
        </span>
        <a
          title="Street View"
          href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
          target="_blank"
          className="cursor-pointer hover:text-mainColor"
        >
          <FiUser />
        </a>
        <a
          title="Reports"
          href={car.report_url}
          target="_blank"
          className="cursor-pointer hover:text-mainColor"
        >
          <FiBarChart2 />
        </a>
        <span
          title="Share"
          className="cursor-pointer hover:text-mainColor"
          onClick={() => dispatch(openShareModal(car.serial_number))}
        >
          <FiShare2 />
        </span>
      </div>
    </div>
  );
};

export default CarPopup;
