import { useSelector } from "react-redux";
import MapSwitcher from "../../../components/common/MapSwitcher";
import PolygonMenu from "../../../components/common/PolygonMenu";
import ZoomBtns from "../../../components/common/ZoomBtns";

const MapActions = ({
  setZoom,
  setViewState,
  showClusters,
  setShowClusters,
}) => {
  const { provider: mapProvider } = useSelector((state) => state.mapType);

  return (
    <div className="absolute top-3 right-3 z-20 space-y-2 flex flex-col items-center">
      {/* ✅ زر اختيار نوع الخريطة */}
      <MapSwitcher />

      {/* ✅ قائمة أدوات الرسم */}
      <PolygonMenu
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
      />

      {/* ✅ زر تفعيل Marker Cluster */}
      <button
        onClick={() => setShowClusters((prev) => !prev)}
        className={`px-4 py-2 rounded-lg text-white transition ${
          showClusters ? "bg-green-600" : "bg-gray-600"
        }`}
      >
        {showClusters ? "إلغاء التجميع" : "تجميع العربيات"}
      </button>

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
