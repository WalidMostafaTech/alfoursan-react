import { useSelector } from "react-redux";
import MapSwitcher from "../../../components/common/MapSwitcher";
import ZoomBtns from "../../../components/common/ZoomBtns";
import MapTypes from "../../../components/common/MapTypes";
import PolygonMenu from "../../../components/modals/PolygonMenu";
import SupportBtn from "../../../components/common/SupportBtn";
import NotificationBtn from "../../../components/common/NotificationBtn";

const MapActions = ({ setViewState }) => {
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
      <ZoomBtns mapProvider={mapProvider} setViewState={setViewState} />
      <SupportBtn />
      <NotificationBtn />
    </div>
  );
};

export default MapActions;
