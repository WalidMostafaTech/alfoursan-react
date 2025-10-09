import { FiMinus, FiPlus } from "react-icons/fi";

const ZoomBtns = ({ setZoom, mapProvider, setViewState }) => {
  return (
    <div className="bg-white shadow rounded overflow-hidden flex flex-col">
      <button
        onClick={() => {
          setZoom((prev) => {
            const newZoom = Math.min(prev + 1, 20); // أقصى زوم 20
            if (mapProvider === "mapbox") {
              setViewState((v) => ({ ...v, zoom: newZoom }));
            }
            return newZoom;
          });
        }}
        className="p-2 cursor-pointer hover:bg-gray-100"
      >
        <FiPlus className="text-2xl text-gray-700" />
      </button>

      <button
        onClick={() => {
          setZoom((prev) => {
            const newZoom = Math.max(prev - 1, 2); // أقل زوم 2
            if (mapProvider === "mapbox") {
              setViewState((v) => ({ ...v, zoom: newZoom }));
            }
            return newZoom;
          });
        }}
        className="p-2 cursor-pointer hover:bg-gray-100"
      >
        <FiMinus className="text-2xl text-gray-700" />
      </button>
    </div>
  );
};

export default ZoomBtns;
