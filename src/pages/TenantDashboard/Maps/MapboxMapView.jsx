import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import CarPopup from "../../../components/common/CarPopup";

const MapboxMapView = ({
  cars,
  viewState,
  setViewState,
  MAPBOX_TOKEN,
  selectedCarId,
  setSelectedCarId,
  focusCar,
}) => {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {cars
        ?.filter((car) => car.lastPosition)
        .map((car) => (
          <Marker
            key={car.id}
            longitude={car.lastPosition[0]}
            latitude={car.lastPosition[1]}
            anchor="center"
          >
            <div
              style={{
                transform: `translate(-50%, -50%) rotate(${car.bearing}deg)`,
                width: 40,
                height: 40,
              }}
            >
              <img
                // src={car.image}
                src="/car.png"
                alt={car.name}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => {
                  focusCar(car);
                  setSelectedCarId(car.id);
                }}
              />
            </div>
          </Marker>
        ))}

      {selectedCarId &&
        (() => {
          const car = cars?.find((c) => c.id === selectedCarId);
          if (!car) return null;
          return (
            <Popup
              longitude={car.position.lng - 0.00005}
              latitude={car.position.lat + 0.0001}
              closeButton={false}
              maxWidth="none"
              style={{
                padding: 0,
                backgroundColor: "transparent",
              }}
            >
              <CarPopup car={car} onClose={() => setSelectedCarId(null)} />
            </Popup>
          );
        })()}
    </Map>
  );
};

export default MapboxMapView;
