import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import CarPopup from "../../../components/common/CarPopup";

const GoogleMapView = ({
  cars,
  center,
  zoom,
  selectedCarId,
  setSelectedCarId,
}) => {
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
      options={{ fullscreenControl: false }}
    >
      {cars?.map((car) => (
        <Marker
          key={car.id}
          position={car.position}
          onClick={() => setSelectedCarId(car.id)}
          icon={{
            url: "/car.png",
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
            rotation: car.bearing, 
          }}
        />
      ))}

      {selectedCarId &&
        (() => {
          const car = cars?.find((c) => c.id === selectedCarId);
          if (!car) return null;
          return (
            <InfoWindow position={car.position}>
              <CarPopup
                car={car}
                onClose={() => setSelectedCarId(null)}
                closeBtn={false}
              />
            </InfoWindow>
          );
        })()}
    </GoogleMap>
  );
};

export default GoogleMapView;
