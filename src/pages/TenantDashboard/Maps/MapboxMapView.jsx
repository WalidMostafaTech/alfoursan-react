import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import CarPopup from "../../../components/common/CarPopup";

const MapboxMapView = ({
  cars,
  viewState,
  setViewState,
  MAPBOX_TOKEN,
  selectedCarId,
  handleSelectCar,
}) => {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onClick={() => handleSelectCar(null)}
    >
      {cars
        ?.filter(
          (car) =>
            car?.position &&
            !isNaN(car.position.lat) &&
            !isNaN(car.position.lng)
        )
        .map((car) => (
          <Marker
            key={car.id}
            longitude={car.position.lng}
            latitude={car.position.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleSelectCar(car);
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: "translateY(-10px)", // يحركها لفوق شوية عشان ما تغطيش البواب
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
                  alt={car.name}
                  className="w-full h-full object-contain"
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
          </Marker>
        ))}

      {/* Popup لما تختار عربية */}
      {selectedCarId &&
        (() => {
          const car = cars?.find(
            (c) =>
              c.id === selectedCarId &&
              c?.position &&
              !isNaN(c.position.lat) &&
              !isNaN(c.position.lng)
          );
          if (!car) return null;
          return (
            <Popup
              longitude={car.position.lng - 0.0}
              latitude={car.position.lat + 0.00012}
              maxWidth="none"
              closeOnClick={false}
              onClose={() => handleSelectCar(car)}
              style={{
                padding: 0,
                backgroundColor: "transparent",
              }}
            >
              <CarPopup car={car} />
            </Popup>
          );
        })()}
    </Map>
  );
};

export default MapboxMapView;
