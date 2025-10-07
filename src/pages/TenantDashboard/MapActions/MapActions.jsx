import MapSwitcher from "../../../components/common/MapSwitcher";
import PolygonMenu from "../../../components/common/PolygonMenu";
import ZoomBtns from "../../../components/common/ZoomBtns";

const MapActions = ({
  mapProvider,
  handleMapProviderChange,
  setZoom,
  setViewState,
}) => {
  return (
    <div className="absolute top-3 right-3 z-50 space-y-2 flex flex-col items-center">
      {/* ✅ زرار اختيار نوع الخريطة */}
      <MapSwitcher
        setMapProvider={handleMapProviderChange}
        mapProvider={mapProvider}
      />

      {/* ✅ قائمة أدوات الرسم */}
      {/* <PolygonMenu
        onSelect={(type) => {
          if (mapProvider === "google") {
            const event = new CustomEvent("start-drawing", {
              detail: { type },
            });
            window.dispatchEvent(event);
          } else {
            alert("الرسم متاح في خريطة Google فقط حاليًا ✅");
          }
        }}
      /> */}

      {/* ✅ أزرار الزوم */}
      <ZoomBtns
        setZoom={setZoom}
        mapProvider={mapProvider}
        setViewState={setViewState}
      />
    </div>
  );
};

export default MapActions;
