import { FiMap } from "react-icons/fi";
import { BsFillTriangleFill } from "react-icons/bs"; // أيقونة مثلث
import { MdPlayArrow } from "react-icons/md";

const MapSwitcher = ({ mapProvider, setMapProvider }) => {
  return (
    <div className="absolute top-3 right-3 z-20">
      <div className="relative group">
        <div className="bg-white shadow rounded p-2 cursor-pointer">
          <FiMap className="text-2xl text-gray-700" />
        </div>

        <div className="absolute top-0 right-[calc(100%+5px)] min-w-max hidden group-hover:flex flex-col gap-2 bg-white shadow rounded-lg p-2">
          <MdPlayArrow className="absolute top-3 -right-3 text-white text-2xl" />
          <button
            className={`px-3 py-1 rounded cursor-pointer ${
              mapProvider === "google"
                ? "bg-mainColor text-white"
                : "hover:bg-mainColor/10"
            }`}
            onClick={() => setMapProvider("google")}
          >
            Google Maps
          </button>
          <button
            className={`px-3 py-1 rounded cursor-pointer ${
              mapProvider === "mapbox"
                ? "bg-mainColor text-white"
                : "hover:bg-mainColor/10"
            }`}
            onClick={() => setMapProvider("mapbox")}
          >
            Mapbox
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSwitcher;
