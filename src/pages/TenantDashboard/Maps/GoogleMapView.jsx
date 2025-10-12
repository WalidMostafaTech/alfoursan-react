import { GoogleMap, InfoWindow, OverlayView } from "@react-google-maps/api";
import CarPopup from "../../../components/common/CarPopup";
import { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useSelector } from "react-redux";
import GeofenceModal from "../GeofenceModal/GeofenceModal";

const GoogleMapView = ({
  cars,
  center,
  zoom,
  selectedCarId,
  handleSelectCar,
}) => {
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);

  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const { clusters } = useSelector((state) => state.map);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // ✅ Marker Cluster logic
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    const map = mapRef.current;

    // لو أول مرة نعمل ماركرات
    if (!window.carMarkers) {
      window.carMarkers = new Map();
    }

    // ✅ تحديث أو إنشاء الماركرات
    cars.forEach((car) => {
      let marker = window.carMarkers.get(car.id);

      if (!marker) {
        // إنشاء ماركر جديد
        marker = new window.google.maps.Marker({
          position: car.position,
          map: clusters ? null : map,
          icon: {
            url:
              car.speed > 5
                ? "/car-green.png"
                : car.speed === 0
                ? "/car-red.png"
                : "/car-blue.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        marker.addListener("click", () => handleSelectCar(car));
        window.carMarkers.set(car.id, marker);
      } else {
        // ✅ تحديث موقع الماركر الحالي بدل ما نحذفه
        marker.setPosition(car.position);

        // تحديث الايقونة لو السرعة اتغيرت
        marker.setIcon({
          url:
            car.speed > 5
              ? "/car-green.png"
              : car.speed === 0
              ? "/car-red.png"
              : "/car-blue.png",
          scaledSize: new window.google.maps.Size(40, 40),
        });
      }
    });

    // ✅ نحذف الماركرات اللي مش موجودة في القائمة الحالية
    const currentIds = cars.map((c) => c.id);
    for (const [id, marker] of window.carMarkers.entries()) {
      if (!currentIds.includes(id)) {
        marker.setMap(null);
        window.carMarkers.delete(id);
      }
    }

    // ✅ التعامل مع الـ clustering
    if (clusters) {
      // لو شغال الكلاستر
      if (window.carClusterer) {
        window.carClusterer.clearMarkers();
      }

      window.carClusterer = new MarkerClusterer({
        map,
        markers: Array.from(window.carMarkers.values()),
      });

      // نخلي كل الماركرات map=null علشان الكلاستر هو اللي يتحكم
      for (const marker of window.carMarkers.values()) {
        marker.setMap(null);
      }
    } else {
      // لو قفلنا الكلاستر
      if (window.carClusterer) {
        window.carClusterer.clearMarkers();
        window.carClusterer = null;
      }

      // ✅ نرجّع الماركرات تاني للخريطة
      for (const marker of window.carMarkers.values()) {
        marker.setMap(map);
      }
    }
  }, [cars, clusters]);

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
        let overlay = ev.overlay; // الشكل اللي اتحرك أو اتعمل
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
          const polygonData = {
            type: "polygon",
            path,
          };
          if (window.confirmGeofenceSettings)
            window.confirmGeofenceSettings(polygonData);
        }

          // setGeofenceData();
          setGeofenceModalOpen(true);

        // ✅ نجعل الشكل غير قابل للتعديل وغير قابل للسحب
        overlay.setEditable(false);
        overlay.setDraggable(false);

        // ✅ نوقف وضع الرسم بعد ما المستخدم يخلص
        manager.setDrawingMode(null);

        // ✅ نخزن الشكل الحالي عشان لو حبينا نحذفه بعدين
        window.currentShape = overlay;
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
    <>
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
        {/* ✅ نافذة معلومات السيارة المحددة */}
        {selectedCarId &&
          (() => {
            const car = cars?.find((c) => c.id === selectedCarId);
            if (!car) return null;
            return (
              <InfoWindow
                position={car.position}
                onCloseClick={() => handleSelectCar(car)}
              >
                <CarPopup car={car} />
              </InfoWindow>
            );
          })()}
      </GoogleMap>

      <GeofenceModal
        isOpen={geofenceModalOpen}
        onClose={() => setGeofenceModalOpen(false)}
        onConfirm={(data) => {
          setGeofenceModalOpen(false);
          // ممكن هنا تبعت البيانات للسيرفر أو تخزنها في الـ Redux
        }}
      />
    </>
  );
};

export default GoogleMapView;
