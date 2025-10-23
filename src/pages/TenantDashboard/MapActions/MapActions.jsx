import { useSelector } from "react-redux";
import MapSwitcher from "../../../components/common/MapSwitcher";
import PolygonMenu from "../../../components/common/PolygonMenu";
import ZoomBtns from "../../../components/common/ZoomBtns";
import MapTypes from "../../../components/common/MapTypes";

const MapActions = ({ setZoom, setViewState }) => {
  const { provider: mapProvider } = useSelector((state) => state.map);

  return (
    <div className="absolute top-3 right-3 z-20 space-y-2 flex flex-col items-center">
      <MapSwitcher />
      <MapTypes />
      <PolygonMenu
        onSelect={(type) => {
          if (mapProvider === "google") {
            const event = new CustomEvent("start-drawing", {
              detail: { type },
            });
            window.dispatchEvent(event);
          } else {
            alert("الرسم متاح في خريطة Google فقط ✅");
          }
        }}
      />
      <ZoomBtns
        setZoom={setZoom}
        mapProvider={mapProvider}
        setViewState={setViewState}
      />
    </div>
  );
};

export default MapActions;
