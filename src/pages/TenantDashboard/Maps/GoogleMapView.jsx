import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import CarPopup from "../../../components/common/CarPopup";
import { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useSelector } from "react-redux";
import GeoFenceModal from "../GeoFenceModal/GeoFenceModal";
import DeviceNamePopup from "../../../components/common/DeviceNamePopup";

// ✅ رمز السيارة (path)
const CAR_PATH =
  // "M42.3 110.94c2.22 24.11 2.48 51.07 1.93 79.75-13.76.05-24.14 1.44-32.95 6.69-4.96 2.96-8.38 6.28-10.42 12.15-1.37 4.3-.36 7.41 2.31 8.48 4.52 1.83 22.63-.27 28.42-1.54 2.47-.54 4.53-1.28 5.44-2.33.55-.63 1-1.4 1.35-2.31 1.49-3.93.23-8.44 3.22-12.08.73-.88 1.55-1.37 2.47-1.61-1.46 62.21-6.21 131.9-2.88 197.88 0 43.41 1 71.27 43.48 97.95 41.46 26.04 117.93 25.22 155.25-8.41 32.44-29.23 30.38-50.72 30.38-89.54 5.44-70.36 1.21-134.54-.79-197.69.69.28 1.32.73 1.89 1.42 2.99 3.64 1.73 8.15 3.22 12.08.35.91.8 1.68 1.35 2.31.91 1.05 2.97 1.79 5.44 2.33 5.79 1.27 23.9 3.37 28.42 1.54 2.67-1.07 3.68-4.18 2.31-8.48-2.04-5.87-5.46-9.19-10.42-12.15-8.7-5.18-18.93-6.6-32.44-6.69-.75-25.99-1.02-51.83-.01-77.89C275.52-48.32 29.74-25.45 42.3 110.94zm69.63-90.88C83.52 30.68 62.75 48.67 54.36 77.59c21.05-15.81 47.13-39.73 57.57-57.53zm89.14-4.18c28.41 10.62 49.19 28.61 57.57 57.53-21.05-15.81-47.13-39.73-57.57-57.53zM71.29 388.22l8.44-24.14c53.79 8.36 109.74 7.72 154.36-.15l7.61 22.8c-60.18 28.95-107.37 32.1-170.41 1.49zm185.26-34.13c5.86-34.1 4.8-86.58-1.99-120.61-12.64 47.63-9.76 74.51 1.99 120.61zM70.18 238.83l-10.34-47.2c45.37-57.48 148.38-53.51 193.32 0l-12.93 47.2c-57.58-14.37-114.19-13.21-170.05 0zM56.45 354.09c-5.86-34.1-4.8-86.58 1.99-120.61 12.63 47.63 9.76 74.51-1.99 120.61z";
  "m42.3,110.94c2.22,24.11 2.48,51.07 1.93,79.75c-13.76,0.05 -24.14,1.44 -32.95,6.69c-4.96,2.96 -8.38,6.28 -10.42,12.15c-1.37,4.3 -0.36,7.41 2.31,8.48c4.52,1.83 22.63,-0.27 28.42,-1.54c2.47,-0.54 4.53,-1.28 5.44,-2.33c0.55,-0.63 1,-1.4 1.35,-2.31c1.49,-3.93 0.23,-8.44 3.22,-12.08c0.73,-0.88 1.55,-1.37 2.47,-1.61c-1.46,62.21 -6.21,131.9 -2.88,197.88c0,43.41 1,71.27 43.48,97.95c41.46,26.04 117.93,25.22 155.25,-8.41c32.44,-29.23 30.38,-50.72 30.38,-89.54c5.44,-70.36 1.21,-134.54 -0.79,-197.69c0.69,0.28 1.32,0.73 1.89,1.42c2.99,3.64 1.73,8.15 3.22,12.08c0.35,0.91 0.8,1.68 1.35,2.31c0.91,1.05 2.97,1.79 5.44,2.33c5.79,1.27 23.9,3.37 28.42,1.54c2.67,-1.07 3.68,-4.18 2.31,-8.48c-2.04,-5.87 -5.46,-9.19 -10.42,-12.15c-8.7,-5.18 -18.93,-6.6 -32.44,-6.69c-0.75,-25.99 -1.02,-51.83 -0.01,-77.89c6.25,-161.12 -239.53,-138.25 -226.97,-1.86zm69.63,-90.88c-28.41,10.62 -49.18,28.61 -57.57,57.53c21.05,-15.81 47.13,-39.73 57.57,-57.53zm89.14,-4.18c28.41,10.62 49.19,28.61 57.57,57.53c-21.05,-15.81 -47.13,-39.73 -57.57,-57.53zm-129.78,372.34l8.44,-24.14c53.79,8.36 109.74,7.72 154.36,-0.15l7.61,22.8c-60.18,28.95 -107.37,32.1 -170.41,1.49zm185.26,-34.13c5.86,-34.1 4.8,-86.58 -1.99,-120.61c-12.64,47.63 -9.76,74.51 1.99,120.61zm-186.37,-115.26l-10.34,-47.2c45.37,-57.48 148.38,-53.51 193.32,0l-12.93,47.2c-57.58,-14.37 -114.19,-13.21 -170.05,0zm-13.73,115.26c-5.86,-34.1 -4.8,-86.58 1.99,-120.61c12.63,47.63 9.76,74.51 -1.99,120.61z";
const GoogleMapView = ({
  cars,
  center,
  zoom,
  selectedCarId,
  handleSelectCar,
}) => {
  const [geoFenceModalOpen, setGeoFenceModalOpen] = useState(false);
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const { clusters, mapType } = useSelector((state) => state.map);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // ✅ إنشاء ماركر بعلامة Symbol
  const createRotatedMarker = (car, map) => {
    const rotation = car.bearing || 0;
    const color =
      car.speed > 5 ? "#1dbf73" : car.speed === 0 ? "#e53935" : "#1e88e5";

    const marker = new window.google.maps.Marker({
      position: car.position,
      map,
      icon: {
        path: CAR_PATH,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#000",
        strokeWeight: 0.7,
        scale: 0.07,
        rotation: rotation,
        anchor: new window.google.maps.Point(156, 256),
      },
    });

    marker.addListener("click", () => handleSelectCar(car));
    return marker;
  };

  // ✅ إعادة بناء الماركرات عند فتح الخريطة من جديد بعد تغيير الـ provider
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // لو الماركرات موجودة من قبل (من جلسة Google سابقة) نحذفها
    if (window.carMarkers) {
      Array.from(window.carMarkers.values()).forEach((m) => m.setMap(null));
    }

    // إعادة التهيئة بالكامل
    window.carMarkers = new Map();
    window.clusterMarkers = new Set();
    window.carClusterer = null;

    // بناء الماركرات من الصفر
    cars.forEach((car) => {
      if (!car.position) return;
      const marker = new window.google.maps.Marker({
        position: car.position,
        map: mapRef.current,
        icon: {
          path: CAR_PATH,
          fillColor:
            car.speed > 5 ? "#1dbf73" : car.speed === 0 ? "#e53935" : "#1e88e5",
          fillOpacity: 1,
          strokeColor: "#000",
          strokeWeight: 0.7,
          scale: 0.07,
          rotation: car.bearing || 0,
          anchor: new window.google.maps.Point(156, 256),
        },
      });
      marker.addListener("click", () => handleSelectCar(car));
      window.carMarkers.set(car.id, marker);
    });
  }, [mapRef.current]);

  // ✅ بناء الماركرات والتجميع
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    const map = mapRef.current;

    if (!window.carMarkers) window.carMarkers = new Map();
    if (!window.clusterMarkers) window.clusterMarkers = new Set();

    const markers = window.carMarkers;
    const currentIds = cars.map((c) => c.id);
    const existingIds = Array.from(markers.keys());

    // ✅ إنشاء أو تحديث الماركرات
    cars.forEach((car) => {
      const color =
        car.speed > 5 ? "#1dbf73" : car.speed === 0 ? "#e53935" : "#1e88e5";
      const rotation = car.bearing || 0;

      let marker = markers.get(car.id);
      if (!marker) {
        marker = createRotatedMarker(car, map);
        markers.set(car.id, marker);
      } else {
        marker.setPosition(car.position);
        const icon = marker.getIcon();
        marker.setIcon({ ...icon, fillColor: color, rotation });
      }

      if (!clusters && !marker.getMap()) marker.setMap(map);
    });

    // ✅ حذف الماركرات اللي اتشالت
    existingIds.forEach((id) => {
      if (!currentIds.includes(id)) {
        const m = markers.get(id);
        if (m) {
          m.setMap(null);
          markers.delete(id);
          window.clusterMarkers.delete(m);
        }
      }
    });

    // ✅ إدارة الكلاستر
    if (clusters) {
      if (!window.carClusterer) {
        window.carClusterer = new MarkerClusterer({
          map,
          markers: Array.from(markers.values()),
        });
        window.clusterMarkers = new Set(markers.values());
      } else {
        const clusterer = window.carClusterer;
        const allMarkers = Array.from(markers.values());

        allMarkers.forEach((m) => {
          if (!window.clusterMarkers.has(m)) {
            clusterer.addMarker(m, false);
            window.clusterMarkers.add(m);
          }
        });

        Array.from(window.clusterMarkers).forEach((m) => {
          if (!allMarkers.includes(m)) {
            clusterer.removeMarker(m, false);
            window.clusterMarkers.delete(m);
          }
        });

        // ✅ الإصدار الجديد يستخدم render() بدلاً من repaint()
        clusterer.render();
      }
    } else {
      if (window.carClusterer) {
        window.carClusterer.clearMarkers();
        window.carClusterer = null;
        window.clusterMarkers.clear();
      }

      Array.from(markers.values()).forEach((m) => {
        if (!m.getMap()) m.setMap(map);
      });
    }
  }, [cars, clusters]);

  // ✅ تحديث المواقع والاتجاه أثناء الحركة
  useEffect(() => {
    if (!window.carMarkers) return;

    cars.forEach((car) => {
      const marker = window.carMarkers.get(car.id);
      if (marker) {
        marker.setPosition(car.position);
        const rotation = car.bearing || 0;
        const icon = marker.getIcon();
        if (icon.rotation !== rotation) {
          marker.setIcon({
            ...icon,
            rotation: rotation,
          });
        }
      }
    });
  }, [cars]);

  // ✅ رسم الجيوفنس
  useEffect(() => {
    const handleDrawingStart = (e) => {
      const { type } = e.detail;
      if (!window.google || !mapRef.current) return;

      if (!window.google.maps.drawing) {
        console.error("Google Maps Drawing library not loaded");
        return;
      }

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
        let overlay = ev.overlay;
        if (ev.type === "circle") {
          const center = overlay.getCenter();
          const radius = overlay.getRadius();
          const circleData = {
            type: "circle",
            center: center.toJSON(),
            radius: radius.toFixed(2),
          };
          if (window.confirmGeofenceSettings)
            window.confirmGeofenceSettings(circleData);
        } else if (ev.type === "polygon") {
          const path = overlay
            .getPath()
            .getArray()
            .map((p) => p.toJSON());
          const polygonData = { type: "polygon", path };
          if (window.confirmGeofenceSettings)
            window.confirmGeofenceSettings(polygonData);
        }
        setGeoFenceModalOpen(true);
        overlay.setEditable(false);
        overlay.setDraggable(false);
        manager.setDrawingMode(null);
        window.currentShape = overlay;
      });
    };

    const handleEditShape = (event) => {
      const { type, polygonData, center, radius } = event.detail;
      if (!window.google || !mapRef.current) return;
      const map = mapRef.current;

      if (window.currentShape) window.currentShape.setMap(null);

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

    window.addEventListener("start-drawing", handleDrawingStart);
    window.addEventListener("edit-shape", handleEditShape);
    return () => {
      window.removeEventListener("start-drawing", handleDrawingStart);
      window.removeEventListener("edit-shape", handleEditShape);
    };
  }, []);

  return (
    <>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onClick={() => selectedCarId && handleSelectCar(null)}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          mapTypeId: mapType,
        }}
      >
        {selectedCarId &&
          (() => {
            const car = cars.find((c) => c.id === selectedCarId);
            if (!car) return null;
            return (
              <InfoWindow
                position={car.position}
                onCloseClick={() => handleSelectCar(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
              >
                <CarPopup car={car} />
              </InfoWindow>
            );
          })()}

        {!clusters &&
          cars.map((car) =>
            car.position ? <DeviceNamePopup key={car.id} car={car} /> : null
          )}
      </GoogleMap>

      <GeoFenceModal
        isOpen={geoFenceModalOpen}
        onClose={() => setGeoFenceModalOpen(false)}
        onConfirm={(data) => {
          setGeoFenceModalOpen(false);
          console.log("GeoFence data:", data);
        }}
      />
    </>
  );
};

export default GoogleMapView;
