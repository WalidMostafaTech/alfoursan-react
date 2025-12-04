
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
          rotation: car.direction || 0,
          anchor: new window.google.maps.Point(156, 256),
          labelOrigin: new window.google.maps.Point(156, 700), // ⬅️ نزّل اللابل لتحت شوية
        },
        label: showDeviceName
          ? {
              text: car.name || "بدون اسم",
              color: "#212121",
              fontWeight: "bold",
              fontSize: "12px",
              className: `car-label`,
            }
          : null,
      });
      marker.addListener("click", () => handleSelectCar(car));
      window.carMarkers.set(car.id, marker);
    });

    console.log("✅ Google Maps reloaded");
  }, [mapRef.current]);



  

  // ✅ تحديث ظهور أو إخفاء أسماء الأجهزة بدون إعادة بناء الماركرات
  useEffect(() => {
    if (!window.carMarkers) return;

    window.carMarkers.forEach((marker, id) => {
      const car = cars.find((c) => c.id === id);
      if (!car) return;

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
    });

    console.log("✅ Gooccccced");
  }, [showDeviceName, cars]);

  // ✅ بناء الماركرات والتجميع
  useEffect(() => {
    console.log("✅ eee");

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
      const rotation = car.direction || 0;

      let marker = markers.get(car.id);
      if (!marker) {
        marker = createRotatedMarker(car, map);
        markers.set(car.id, marker);
      } else {
        marker.setPosition(car.position);
        if (showDeviceName) {
          marker.setLabel({
            text: car.name || "بدون اسم",
            color: "#212121",
            fontWeight: "bold",
            fontSize: "12px",
            className: `car-label`,
          });
        } else {
          marker.setLabel(null);
        }
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
  }, [cars, clusters, showDeviceName]);

  // ✅ تحديث المواقع والاتجاه أثناء الحركة
  useEffect(() => {
    console.log("✅ eeeeeewwwee");

    if (!window.carMarkers) return;

    cars.forEach((car) => {
      const marker = window.carMarkers.get(car.id);
      if (marker) {
        marker.setPosition(car.position);
        const rotation = car.direction || 0;
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