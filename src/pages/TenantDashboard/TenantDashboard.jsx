import { useState, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import "mapbox-gl/dist/mapbox-gl.css";
import MapSwitcher from "../../components/common/MapSwitcher";
import SideMenu from "./SideMenu/SideMenu";
import GoogleMapView from "./Maps/GoogleMapView";
import MapboxMapView from "./Maps/MapboxMapView";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useCarSocket from "../../hooks/useCarSocket";

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

// مصفوفة العربيات
const carsArray = [
  {
    id: 1,
    name: "Car 1",
    image: "/car.png",
    position: { lat: 30.0444, lng: 31.2357 },
    bearing: 0,
    speed: 0,
    address: "جارٍ التحديد...",
    lastUpdate: Date.now(),
  },
  {
    id: 2,
    name: "Car 2",
    image: "/car.png",
    position: { lat: 30.045, lng: 31.2365 },
    bearing: 90,
    speed: 0,
    address: "جارٍ التحديد...",
    lastUpdate: Date.now(),
  },
];

const TenantDashboard = () => {
  const fetchDevices = async () => {
    const { data } = await axios.get(
      "https://alfursantracking.com/api/v1/tenant/get-devices"
    );
    return data.data;
  };

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
  });

  const [cars, setCars] = useState([]);
  const [isInit, setIsInit] = useState(false);

  // أول ما الأجهزة تتجاب من الـ API نحطها في state
  useEffect(() => {
    if (devices) {
      setCars(
        devices.map((d) => ({
          ...d,
          position: {
            lat: parseFloat(d.latitude),
            lng: parseFloat(d.longitude),
          },
          bearing: 0,
          speed: 0,
          address: d.address || "جارٍ التحديد...",
          lastUpdate: Date.now(),
        }))
      );
      setIsInit(true);
    }
  }, [devices]);

  // 🔌 WebSocket hook
  useCarSocket(cars, setCars, isInit);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBuFc-F9K_-1QkQnLoTIecBlNz6LfCS1wg",
  });

  const [center, setCenter] = useState({ lat: 30.0444, lng: 31.2357 });
  const [zoom, setZoom] = useState(16);
  const [selectedCarId, setSelectedCarId] = useState(null);

  const [mapProvider, setMapProvider] = useState("google"); // google | mapbox

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYWJkZWxyaG1hbm10MSIsImEiOiJja3kycjZwMjEwb2FzMnVwbjE4Mjdrb3V3In0.YE8v8xOauf5v6k1KqDHHFQ";

  // State للتحكم في Mapbox view
  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: zoom,
  });

  // Geocoder Google
  const getGoogleAddress = (lat, lng, cb) => {
    if (!window.google) {
      cb("عنوان غير متاح");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        cb(results[0].formatted_address);
      } else {
        cb("لم يتم العثور على عنوان");
      }
    });
  };

  // Geocoder Mapbox
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

  // حركة السيارات
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCars((prevCars) =>
  //       prevCars.map((car) => {
  //         const speedFactor = 0.0001;
  //         const rad = (car.bearing * Math.PI) / 180;

  //         const newLat = car.position.lat + Math.cos(rad) * speedFactor;
  //         const newLng = car.position.lng + Math.sin(rad) * speedFactor;

  //         const now = Date.now();
  //         const timeDiff = (now - car.lastUpdate) / 1000;
  //         const distance = haversineDistance(
  //           car.position.lat,
  //           car.position.lng,
  //           newLat,
  //           newLng
  //         );
  //         const speed = (distance / (timeDiff / 3600)).toFixed(2);

  //         // تحديث العنوان حسب الـ Provider
  //         if (mapProvider === "google") {
  //           getGoogleAddress(newLat, newLng, (addr) => {
  //             setCars((prev) =>
  //               prev.map((c) => (c.id === car.id ? { ...c, address: addr } : c))
  //             );
  //           });
  //         } else if (mapProvider === "mapbox") {
  //           getMapboxAddress(newLat, newLng, (addr) => {
  //             setCars((prev) =>
  //               prev.map((c) => (c.id === car.id ? { ...c, address: addr } : c))
  //             );
  //           });
  //         }

  //         return {
  //           ...car,
  //           position: { lat: newLat, lng: newLng },
  //           speed: Number(speed),
  //           lastUpdate: now,
  //         };
  //       })
  //     );
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [mapProvider]);

  const focusCar = (car) => {
    setCenter(car.position);
    setZoom(18);
    setSelectedCarId(car.id);

    if (mapProvider === "mapbox") {
      setViewState({
        longitude: car.position.lng,
        latitude: car.position.lat,
        zoom: 18,
      });
    }
  };

  if (loadError) return <div>Failed to load map</div>;
  if (!isLoaded && mapProvider === "google") return <div>Loading Map...</div>;

  return (
    <section className="w-screen h-screen relative">
      <SideMenu cars={cars} focusCar={focusCar} />
      <MapSwitcher setMapProvider={setMapProvider} mapProvider={mapProvider} />

      {mapProvider === "google" ? (
        <GoogleMapView
          cars={cars}
          center={center}
          zoom={zoom}
          selectedCarId={selectedCarId}
          setSelectedCarId={setSelectedCarId}
        />
      ) : (
        <MapboxMapView
          cars={cars}
          viewState={viewState}
          setViewState={setViewState}
          MAPBOX_TOKEN={MAPBOX_TOKEN}
          selectedCarId={selectedCarId}
          setSelectedCarId={setSelectedCarId}
          focusCar={focusCar}
        />
      )}
    </section>
  );
};

export default TenantDashboard;
