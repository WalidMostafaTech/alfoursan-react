import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import CarPopup from "../../../components/common/CarPopup";
import { useEffect, useRef, useMemo } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useDispatch, useSelector } from "react-redux";
import { openGeoFenceModal } from "../../../store/modalsSlice";
import { carPath } from "../../../services/carPath";

const GoogleMapView = ({
  cars,
  center,
  zoom,
  selectedCarId,
  handleSelectCar,
}) => {
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const { clusters, mapType, showDeviceName } = useSelector(
    (state) => state.map
  );

  const dispatch = useDispatch();

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // ✅ تثبيت بيانات السيارات باستخدام useMemo
  const memoizedCars = useMemo(
    () => cars,
    [
      JSON.stringify(
        cars.map((c) => ({
          id: c.id,
          lat: c.position?.lat,
          lng: c.position?.lng,
          bearing: c.bearing,
          speed: c.speed,
        }))
      ),
    ]
  );

  // ✅ إنشاء ماركر بعلامة Symbol
  const createRotatedMarker = (car, map, showDeviceName) => {
    const rotation = car.bearing || 0;
    const color =
      car.speed > 5 ? "#1dbf73" : car.speed === 0 ? "#e53935" : "#1e88e5";

    const markerOptions = {
      position: car.position,
      map,
      icon: {
        path: carPath,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#000",
        strokeWeight: 0.7,
        scale: 0.07,
        rotation: rotation,
        anchor: new window.google.maps.Point(156, 256),
        labelOrigin: new window.google.maps.Point(156, 700),
      },
    };

    // if (showDeviceName) {
    //   markerOptions.label = {
    //     text: car.name || "بدون اسم",
    //     color: "#212121",
    //     fontWeight: "bold",
    //     fontSize: "12px",
    //     className: "car-label",
    //   };
    // }

    const marker = new window.google.maps.Marker(markerOptions);

    marker.addListener("click", () => handleSelectCar(car));
    return marker;
  };

  // ✅ إعادة بناء الماركرات فقط عند تغيير provider أو IDs
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (window.carMarkers) {
      Array.from(window.carMarkers.values()).forEach((m) => m.setMap(null));
    }

    window.carMarkers = new Map();
    window.clusterMarkers = new Set();
    window.carClusterer = null;

    memoizedCars.forEach((car) => {
      if (!car.position) return;
      const marker = new window.google.maps.Marker({
        position: car.position,
        map: mapRef.current,
        icon: {
          path: carPath,
          fillColor:
            car.speed > 5 ? "#1dbf73" : car.speed === 0 ? "#e53935" : "#1e88e5",
          fillOpacity: 1,
          strokeColor: "#000",
          strokeWeight: 0.7,
          scale: 0.07,
          rotation: car.bearing || 0,
          anchor: new window.google.maps.Point(156, 256),
          labelOrigin: new window.google.maps.Point(156, 700),
        },
        // label: showDeviceName
        //   ? {
        //       text: car.name || "بدون اسم",
        //       color: "#212121",
        //       fontWeight: "bold",
        //       fontSize: "12px",
        //       className: "car-label",
        //     }
        //   : null,
      });
      marker.addListener("click", () => handleSelectCar(car));
      window.carMarkers.set(car.id, marker);
    });
  }, [mapRef.current]);

  // ✅ تحديث ظهور أو إخفاء أسماء الأجهزة بدون إعادة بناء الماركرات
  useEffect(() => {
    if (!window.carMarkers) return;
    window.carMarkers.forEach((marker, id) => {
      const car = memoizedCars.find((c) => c.id === id);
      if (!car) return;

      // if (showDeviceName) {
      //   marker.setLabel({
      //     text: car.name || "بدون اسم",
      //     color: "#212121",
      //     fontWeight: "bold",
      //     fontSize: "12px",
      //     className: "car-label",
      //   });
      // } else {
      //   marker.setLabel(null);
      // }
    });
  }, [showDeviceName, memoizedCars]);

  // ✅ إدارة الماركرات والتجميع (بناء/تحديث فقط عند تغير السيارات فعلياً)
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    const map = mapRef.current;

    if (!window.carMarkers) window.carMarkers = new Map();
    if (!window.clusterMarkers) window.clusterMarkers = new Set();

    const markers = window.carMarkers;
    const currentIds = memoizedCars.map((c) => c.id);
    const existingIds = Array.from(markers.keys());

    memoizedCars.forEach((car) => {
      const color =
        car.speed > 5 ? "#1dbf73" : car.speed === 0 ? "#e53935" : "#1e88e5";
      const rotation = car.bearing || 0;

      let marker = markers.get(car.id);
      if (!marker) {
        marker = createRotatedMarker(car, map, showDeviceName);
        markers.set(car.id, marker);
      } else {
        marker.setPosition(car.position);
        const icon = marker.getIcon();
        marker.setIcon({ ...icon, fillColor: color, rotation });
        if (showDeviceName) {
          marker.setLabel({
            text: car.name || "بدون اسم",
            color: "#212121",
            fontWeight: "bold",
            fontSize: "12px",
            className: "car-label",
          });
        } else {
          marker.setLabel(null);
        }
      }

      if (!clusters && !marker.getMap()) marker.setMap(map);
    });

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
  }, [memoizedCars, clusters, showDeviceName]);

  // ✅ تحديث المواقع والاتجاه أثناء الحركة (فقط بدون إعادة بناء)
  useEffect(() => {
    if (!window.carMarkers) return;
    memoizedCars.forEach((car) => {
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
  }, [memoizedCars]);

  // ##########################################
  // ✅ رسم الجيوفنس
  // ##########################################
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

          dispatch(
            openGeoFenceModal({ fenceData: circleData, mission: "add" })
          );
        } else if (ev.type === "polygon") {
          const path = overlay
            .getPath()
            .getArray()
            .map((p) => p.toJSON());
          const polygonData = { type: "polygon", path };

          dispatch(
            openGeoFenceModal({ fenceData: polygonData, mission: "add" })
          );
        }

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

    const handleClearShape = () => {
      if (window.currentShape) {
        window.currentShape.setMap(null);
        window.currentShape = null;
      }
    };

    const handleShowAllPolygons = (event) => {
      const { fences } = event.detail;
      if (!window.google || !mapRef.current || !fences) return;

      const map = mapRef.current;

      if (window.allShapes) {
        window.allShapes.forEach((shape) => shape.setMap(null));
      }
      window.allShapes = [];

      const bounds = new window.google.maps.LatLngBounds();

      fences.forEach((fence, index) => {
        let shape;

        if (
          fence.type === "circle" &&
          fence.latitude &&
          fence.longitude &&
          fence.radius
        ) {
          shape = new window.google.maps.Circle({
            center: {
              lat: parseFloat(fence.latitude),
              lng: parseFloat(fence.longitude),
            },
            radius: parseFloat(fence.radius),
            strokeColor: "#FF5722",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: getColorByIndex(index),
            fillOpacity: 0.35,
            map: map,
          });

          const center = shape.getCenter();
          const radius = shape.getRadius();
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
        } else if (
          fence.type === "polygon" &&
          fence.coordinates &&
          fence.coordinates.length > 0
        ) {
          const paths = fence.coordinates.map((coord) =>
            Array.isArray(coord) ? { lat: coord[0], lng: coord[1] } : coord
          );

          shape = new window.google.maps.Polygon({
            paths: paths,
            strokeColor: "#2196F3",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: getColorByIndex(index),
            fillOpacity: 0.35,
            map: map,
          });

          paths.forEach((point) => bounds.extend(point));
        }

        if (shape) window.allShapes.push(shape);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);

        if (bounds.toSpan().lat() < 0.001 || bounds.toSpan().lng() < 0.001) {
          map.setZoom(map.getZoom() - 2);
        }
      }
    };

    const getColorByIndex = (index) => {
      const colors = [
        "#FF5722",
        "#2196F3",
        "#4CAF50",
        "#FF9800",
        "#9C27B0",
        "#00BCD4",
        "#8BC34A",
        "#E91E63",
        "#3F51B5",
        "#009688",
        "#CDDC39",
        "#673AB7",
      ];
      return colors[index % colors.length];
    };

    window.addEventListener("start-drawing", handleDrawingStart);
    window.addEventListener("edit-shape", handleEditShape);
    window.addEventListener("clear-shape", handleClearShape);
    window.addEventListener("show-all-polygons", handleShowAllPolygons);
    return () => {
      window.removeEventListener("start-drawing", handleDrawingStart);
      window.removeEventListener("edit-shape", handleEditShape);
      window.removeEventListener("clear-shape", handleClearShape);
      window.removeEventListener("show-all-polygons", handleShowAllPolygons);
      if (window.allShapes) {
        window.allShapes.forEach((shape) => shape.setMap(null));
        window.allShapes = [];
      }
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
            const car = memoizedCars.find((c) => c.id === selectedCarId);
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
      </GoogleMap>
    </>
  );
};

export default GoogleMapView;
