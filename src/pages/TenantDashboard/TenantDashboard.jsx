import { useState, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import "mapbox-gl/dist/mapbox-gl.css";
import MapSwitcher from "../../components/common/MapSwitcher";
import SideMenu from "./SideMenu/SideMenu";
import GoogleMapView from "./Maps/GoogleMapView";
import MapboxMapView from "./Maps/MapboxMapView";
import { useQuery } from "@tanstack/react-query";
import useCarSocket from "../../hooks/useCarSocket";
import { fetchDevices } from "../../services/api";

// دالة حساب المسافة
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const TenantDashboard = () => {
  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
  });

  const [cars, setCars] = useState([]);
  const [isInit, setIsInit] = useState(false);

  // أول ما الأجهزة تتجاب من الـ API نحطها في state
  useEffect(() => {
    if (devices) {
      const mappedCars = devices.map((d) => ({
        ...d,
        position: {
          lat: parseFloat(d.latitude),
          lng: parseFloat(d.longitude),
        },
        bearing: 0,
        speed: 0,
        address: d.address || "جارٍ التحديد...",
        lastUpdate: Date.now(),
      }));
      setCars(mappedCars);
      setIsInit(true);

      // ✅ بعد تحميل العربيات نركز على أول عربية
      if (mappedCars.length > 0) {
        const firstCar = mappedCars[0];
        handleSelectCar(firstCar, true);
      }
    }
  }, [devices]);

  // تحميل سكريبت Google Maps مع اللغة العربية
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBuFc-F9K_-1QkQnLoTIecBlNz6LfCS1wg",
    language: "ar", // ✅ تحديد اللغة العربية
  });

  const [center, setCenter] = useState({ lat: 24.7136, lng: 46.6753 });
  const [zoom, setZoom] = useState(16);
  const [selectedCarId, setSelectedCarId] = useState(null);

  const [mapProvider, setMapProvider] = useState(
    localStorage.getItem("mapProvider") || "google"
  );

  // ✅ حفظ نوع الخريطة
  const handleMapProviderChange = (provider) => {
    setMapProvider(provider);
    localStorage.setItem("mapProvider", provider);
  };

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYWJkZWxyaG1hbm10MSIsImEiOiJja3kycjZwMjEwb2FzMnVwbjE4Mjdrb3V3In0.YE8v8xOauf5v6k1KqDHHFQ";

  // State للتحكم في Mapbox view
  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: zoom,
  });

  // 🔍 دالة جلب العنوان من Google بالعربية
  const getGoogleAddress = (lat, lng, cb) => {
    if (!window.google) {
      cb("عنوان غير متاح");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        cb(results[0].formatted_address); // ✅ هيطلع بالعربي
      } else {
        cb("لم يتم العثور على عنوان");
      }
    });
  };

  // 🔍 دالة جلب العنوان من Mapbox بالعربية
  const getMapboxAddress = async (lat, lng, cb) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=ar`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        cb(data.features[0].place_name);
      } else {
        cb("لم يتم العثور على عنوان");
      }
    } catch (err) {
      console.log(err);
      cb("خطأ في جلب العنوان");
    }
  };

  // WebSocket hook
  useCarSocket(
    cars,
    setCars,
    isInit,
    getGoogleAddress,
    getMapboxAddress,
    mapProvider,
    selectedCarId
  );

  // 🧭 تحديث العنوان كل ما تتحرك العربية
  useEffect(() => {
    if (!selectedCarId) return;

    const car = cars.find((c) => c.id === selectedCarId);
    if (!car) return;

    const { lat, lng } = car.position;

    if (
      !car.lastAddressPos ||
      haversineDistance(
        car.lastAddressPos.lat,
        car.lastAddressPos.lng,
        lat,
        lng
      ) > 0.05
    ) {
      if (mapProvider === "google") {
        getGoogleAddress(lat, lng, (addr) => {
          setCars((prev) =>
            prev.map((c) =>
              c.id === car.id
                ? { ...c, address: addr, lastAddressPos: { lat, lng } }
                : c
            )
          );
        });
      } else {
        getMapboxAddress(lat, lng, (addr) => {
          setCars((prev) =>
            prev.map((c) =>
              c.id === car.id
                ? { ...c, address: addr, lastAddressPos: { lat, lng } }
                : c
            )
          );
        });
      }
    }
  }, [cars, mapProvider, selectedCarId]);

  // دالة اختيار عربية
  const handleSelectCar = (car, zoom = false) => {
    if (!car) {
      setSelectedCarId(null);
      return;
    }

    const { position } = car || {};
    const { lat, lng } = position || {};

    // ✅ تأكد إن الإحداثيات أرقام
    if (
      !position ||
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      console.warn("❌ Invalid car position:", car);
      setSelectedCarId(null);
      return;
    }

    if (zoom) {
      setCenter(position);
      setZoom(18);

      if (mapProvider === "mapbox") {
        setViewState({
          longitude: lng,
          latitude: lat,
          zoom: 18,
        });
      }
    }

    if (mapProvider === "google") {
      setViewState({
        longitude: lng,
        latitude: lat,
      });
    }

    if (car.id !== selectedCarId) {
      setSelectedCarId(car.id);
    } else {
      setSelectedCarId(null);
    }
  };

  if (loadError) return <div>فشل تحميل الخريطة</div>;
  if (!isLoaded && mapProvider === "google")
    return <div>جاري تحميل الخريطة...</div>;

  return (
    <section className="w-screen h-screen relative">
      <SideMenu
        cars={cars}
        handleSelectCar={handleSelectCar}
        selectedCarId={selectedCarId}
      />
      <MapSwitcher
        setMapProvider={handleMapProviderChange}
        mapProvider={mapProvider}
      />

      {mapProvider === "google" ? (
        <GoogleMapView
          cars={cars}
          center={center}
          zoom={zoom}
          selectedCarId={selectedCarId}
          handleSelectCar={handleSelectCar}
        />
      ) : (
        <MapboxMapView
          cars={cars}
          viewState={viewState}
          setViewState={setViewState}
          MAPBOX_TOKEN={MAPBOX_TOKEN}
          selectedCarId={selectedCarId}
          handleSelectCar={handleSelectCar}
        />
      )}
    </section>
  );
};

export default TenantDashboard;
