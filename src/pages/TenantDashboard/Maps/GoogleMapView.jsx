import { GoogleMap, InfoWindow, OverlayView } from "@react-google-maps/api";
import CarPopup from "../../../components/common/CarPopup";
import { useEffect, useRef } from "react";

const GoogleMapView = ({
  cars,
  center,
  zoom,
  selectedCarId,
  handleSelectCar,
}) => {
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // ✅ إضافة حدث لتفعيل الرسم
  useEffect(() => {
    const handleDrawingStart = (e) => {
      const { type } = e.detail;
      if (!window.google || !mapRef.current) return;

      if (!window.google.maps.drawing) {
        console.error("Google Maps Drawing library not loaded");
        return;
      }

      // لو فيه DrawingManager قديم نحذفه
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
      }

      const manager = new window.google.maps.drawing.DrawingManager({
        drawingMode:
          type === "circle"
            ? window.google.maps.drawing.OverlayType.CIRCLE
            : window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        circleOptions: {
          fillColor: "#2196F3",
          fillOpacity: 0.3,
          strokeColor: "#0D47A1",
          strokeWeight: 2,
          editable: true,
          draggable: true,
        },
        polygonOptions: {
          fillColor: "#4CAF50",
          fillOpacity: 0.3,
          strokeColor: "#1B5E20",
          strokeWeight: 2,
          editable: true,
          draggable: true,
        },
      });

      manager.setMap(mapRef.current);
      drawingManagerRef.current = manager;

      window.google.maps.event.addListener(manager, "overlaycomplete", (ev) => {
        if (ev.type === "circle") {
          const center = ev.overlay.getCenter();
          const radius = ev.overlay.getRadius();
          const circleData = {
            type: "circle",
            center: center.toJSON(),
            radius: radius.toFixed(2),
          };

          if (window.confirmGeofenceSettings) {
            window.confirmGeofenceSettings(circleData);
          }
        } else if (ev.type === "polygon") {
          const path = ev.overlay
            .getPath()
            .getArray()
            .map((p) => p.toJSON());
          const polygonData = {
            type: "polygon",
            path,
          };

          if (window.confirmGeofenceSettings) {
            window.confirmGeofenceSettings(polygonData);
          }
        }

        manager.setDrawingMode(null);
      });
    };

    // ✅ استماع لبدء الرسم
    window.addEventListener("start-drawing", handleDrawingStart);

    // ✅ استماع لحدث التعديل من الـ JS
    const handleEditShape = (event) => {
      const { type, polygonData, center, radius } = event.detail;
      if (!window.google || !mapRef.current) return;

      const map = mapRef.current;

      // 🧹 نحذف أي أشكال قديمة قبل الرسم الجديد
      if (window.currentShape) {
        window.currentShape.setMap(null);
      }

      if (type === "polygon") {
        const polygon = new window.google.maps.Polygon({
          paths: polygonData,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
        });

        polygon.setMap(map);
        window.currentShape = polygon;

        const bounds = new window.google.maps.LatLngBounds();
        polygonData.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds);
      }

      if (type === "circle") {
        const circle = new window.google.maps.Circle({
          center,
          radius,
          strokeColor: "#FF5722",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF9800",
          fillOpacity: 0.35,
        });

        circle.setMap(map);
        window.currentShape = circle;

        // 🧭 نحدد حدود الدائرة بناءً على نصف قطرها
        const bounds = new window.google.maps.LatLngBounds();
        const north = window.google.maps.geometry.spherical.computeOffset(
          center,
          radius,
          0
        );
        const south = window.google.maps.geometry.spherical.computeOffset(
          center,
          radius,
          180
        );
        const east = window.google.maps.geometry.spherical.computeOffset(
          center,
          radius,
          90
        );
        const west = window.google.maps.geometry.spherical.computeOffset(
          center,
          radius,
          270
        );

        bounds.extend(north);
        bounds.extend(south);
        bounds.extend(east);
        bounds.extend(west);

        map.fitBounds(bounds);
      }
    };

    window.addEventListener("edit-shape", handleEditShape);

    return () => {
      window.removeEventListener("start-drawing", handleDrawingStart);
      window.removeEventListener("edit-shape", handleEditShape);
    };
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
      options={{
        fullscreenControl: false,
        mapTypeControl: true,
      }}
      onLoad={onLoad}
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
              x: 0,
              y: 70,
            })}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
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
