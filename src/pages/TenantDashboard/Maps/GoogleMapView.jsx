import { GoogleMap, InfoWindow, OverlayView } from "@react-google-maps/api";
import CarPopup from "../../../components/common/CarPopup";

const GoogleMapView = ({
  cars,
  center,
  zoom,
  selectedCarId,
  handleSelectCar,
}) => {
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
      options={{ fullscreenControl: false }}
      onClick={() => selectedCarId && handleSelectCar(null)}
    >
      {cars
        ?.filter((car) => car.lastPosition)
        .map((car) => (
          <OverlayView
            key={car.id}
            position={car.position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            // eslint-disable-next-line no-unused-vars
            getPixelPositionOffset={(width, height) => ({
              x: 0, // موجب = يمين ، سالب = شمال
              y: 70, // موجب = لتحت ، سالب = لفوق
            })}
          >
            <div
              onClick={(e) => {
                if (e.stopPropagation) e.stopPropagation();
                if (e.originalEvent && e.originalEvent.stopPropagation)
                  e.originalEvent.stopPropagation();

                handleSelectCar(car);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: "translate(-50%, -100%)",
                cursor: "pointer",
              }}
            >
              {/* صورة العربية */}
              <div
                style={{
                  transform: `rotate(${car.bearing}deg)`,
                  width: 40,
                  height: 40,
                }}
              >
                <img
                  src={
                    car.speed > 5
                      ? "/car-green.png"
                      : car.speed === 0
                      ? "/car-red.png"
                      : "/car-blue.png"
                  }
                  alt="car"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* الكارت الأبيض بالاسم */}
              <div
                style={{
                  background: "#fff",
                  color: "#333",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  marginTop: "4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                {car.name || "بدون اسم"}
              </div>
            </div>
          </OverlayView>
        ))}

      {selectedCarId &&
        (() => {
          const car = cars?.find((c) => c.id === selectedCarId);
          if (!car) return null;
          return (
            <InfoWindow position={car.position}>
              <CarPopup car={car} />
            </InfoWindow>
          );
        })()}
    </GoogleMap>
  );
};

export default GoogleMapView;
