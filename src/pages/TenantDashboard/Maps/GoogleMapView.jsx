import {
  GoogleMap,
  Marker,
  InfoWindow,
  OverlayView,
} from "@react-google-maps/api";
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
    >
      {cars
        ?.filter((car) => car.lastPosition)
        .map((car) => (
          <>
            {/* <Marker
              key={car.id}
              position={car.position}
              onClick={() => setSelectedCarId(car.id)}
              icon={{
                url:
                  car.speed > 5
                    ? "/car-green.png"
                    : car.speed === 0
                    ? "/car-red.png"
                    : "/car-blue.png",
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20),
                rotation: car.bearing,
              }}
            /> */}

            <OverlayView
              key={car.id}
              position={car.position}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => handleSelectCar(car)}
                style={{
                  transform: `rotate(${car.bearing}deg)`,
                  width: 40,
                  height: 40,
                  cursor: "pointer",
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
            </OverlayView>
          </>
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
