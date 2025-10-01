import { FaMapMarkerAlt, FaSatelliteDish } from "react-icons/fa";
import {
  FiBarChart2,
  FiMail,
  FiMenu,
  FiNavigation,
  FiPlayCircle,
  FiShare2,
  FiSliders,
  FiUser,
  FiWifi,
} from "react-icons/fi";
import { ImLocation2 } from "react-icons/im";
import { IoSpeedometerSharp } from "react-icons/io5";
import {
  MdOutlineCarCrash,
  MdClose,
  MdOutlineElectricBolt,
} from "react-icons/md";

const CarPopup = ({ car, onClose, closeBtn = true }) => {
  const carDetails = [
    {
      label: car.lastSignel,
      icon: <FaSatelliteDish />,
    },
    {
      label: "Wired",
      icon: <FiWifi />,
    },
    {
      label: car.lastSignelGPS,
      icon: <ImLocation2 />,
    },
    {
      label: "19.08km",
      icon: <IoSpeedometerSharp />,
    },
    {
      label: "Off (1h40m)",
      icon: <MdOutlineCarCrash />,
    },
    {
      label: car.voltageLevel,
      icon: <MdOutlineElectricBolt />,
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg space-y-6 w-[500px]">
      {/* زرار إغلاق */}
      {closeBtn && (
        <div className="flex">
          <button
            onClick={onClose}
            className="w-fit ml-auto text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
          >
            <MdClose />
          </button>
        </div>
      )}

      {/* عنوان العربية */}
      <h4 className="font-bold text-lg">
        {car.name} <span className="text-mainColor">123123123</span>
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
        <FiMenu className="cursor-pointer hover:text-mainColor" />
        <FiNavigation className="cursor-pointer hover:text-mainColor" />
        <FiPlayCircle className="cursor-pointer hover:text-mainColor" />
        <FiMail className="cursor-pointer hover:text-mainColor" />
        <FiSliders className="cursor-pointer hover:text-mainColor" />
        <FiUser className="cursor-pointer hover:text-mainColor" />
        <FiBarChart2 className="cursor-pointer hover:text-mainColor" />
        <FiShare2 className="cursor-pointer hover:text-mainColor" />
      </div>
    </div>
  );
};

export default CarPopup;
