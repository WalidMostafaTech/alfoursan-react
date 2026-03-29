import { useSelector } from "react-redux";
import MapSwitcher from "../../../components/common/MapSwitcher";
import ZoomBtns from "../../../components/common/ZoomBtns";
import MapTypes from "../../../components/common/MapTypes";
import PolygonMenu from "../../../components/modals/PolygonMenu";
import SupportBtn from "../../../components/common/SupportBtn";
import NotificationBtn from "../../../components/common/NotificationBtn";
import AlarmPoolBtn from "../../../components/common/AlarmPoolBtn";
import { CgHomeAlt } from "react-icons/cg";
import { useTranslation } from "react-i18next";

const MapActions = ({ setViewState }) => {
  const { t } = useTranslation();
  const { provider: mapProvider } = useSelector((state) => state.map);

  const BACK_URL = window.__BACK_URL__;

  return (
    <div className="absolute top-3 right-3 z-20 space-y-2 flex flex-col items-center">
      <a
        href={BACK_URL}
        className="bg-white 
        shadow rounded p-2 cursor-pointer hover:bg-gray-100"
      >
        <CgHomeAlt className="text-xl text-gray-700" />
      </a>
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
            alert(t("mapActions.drawingGoogleOnly"));
          }
        }}
      />
      <ZoomBtns mapProvider={mapProvider} setViewState={setViewState} />
      <SupportBtn />
      <NotificationBtn />
      <AlarmPoolBtn />
    </div>
  );
};

export default MapActions;
