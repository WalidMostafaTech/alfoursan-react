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
            onClick={() => handleSelectCar(car)}
          >
            <div
              style={{
                transform: `translate(-50%, -50%) rotate(${car.bearing}deg)`,
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
                className="w-full h-full object-contain cursor-pointer"
              />
            </div>
          </Marker>
        ))}

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
              longitude={car.position.lng-0.00005}
              latitude={car.position.lat+0.0001}
              maxWidth="none"
              closeOnClick={false} // عشان ما يتقفلش لو ضغطت على الماركر
              onClose={() => handleSelectCar(car)} // يقفل البوباب ويعمل reset
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
