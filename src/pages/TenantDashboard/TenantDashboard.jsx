import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import "mapbox-gl/dist/mapbox-gl.css";
import SideMenu from "./SideMenu/SideMenu";
import GoogleMapView from "./Maps/GoogleMapView";
import MapboxMapView from "./Maps/MapboxMapView";
import { useQuery } from "@tanstack/react-query";
import useCarSocket from "../../hooks/useCarSocket";
import LoadingPage from "../../components/Loading/LoadingPage";
import MapActions from "./MapActions/MapActions";
import { useDispatch, useSelector } from "react-redux";
import { getDevices } from "../../services/monitorServices";
import { toast } from "react-toastify";
import DetailsModal from "../../components/modals/DetailsModal/DetailsModal";
import ShareModal from "../../components/modals/ShareModal";
import GeoFenceModal from "../../components/modals/GeoFenceModal";
import AssociateDevice from "../../components/modals/AssociateDevice";
import SupportModal from "../../components/modals/SupportModal";
import { changeZoom } from "../../store/mapSlice";

// ✅ ثابت خارج الـ component لمنع إعادة تحميل Google Maps
const libraries = ["drawing", "geometry", "marker"];
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWJkZWxyaG1hbm10MSIsImEiOiJja3kycjZwMjEwb2FzMnVwbjE4Mjdrb3V3In0.YE8v8xOauf5v6k1KqDHHFQ";

// 🧮 دالة حساب المسافة بين نقطتين (كم)
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
  const { data: devices, isFetching } = useQuery({
    queryKey: ["devices", { full: false }],
    queryFn: getDevices,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // 🔁 استعلام تاني بدون loading (silent update)
  const { refetch: refetchFullDevices } = useQuery({
    queryKey: ["devices", { full: true }],
    queryFn: getDevices,
    enabled: false, // مش هيشتغل إلا لما نطلبه
  });

  const {
    detailsModal,
    shareModal,
    geoFenceModal,
    associateDeviceModal,
    supportModal,
  } = useSelector((state) => state.modals);
  const { provider: mapProvider, zoom } = useSelector((state) => state.map);

  const [cars, setCars] = useState([]);
  const [isInit, setIsInit] = useState(false);
  const [center, setCenter] = useState({ lat: 23.8859, lng: 45.0792 });
  // const [zoom, setZoom] = useState(6);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const dispatch = useDispatch();
  const lastGeocodeAtRef = useRef(new Map());

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "online") return !car.isOffline;
      if (activeFilter === "offline") return car.isOffline;
      if (activeFilter === "moving") {
        return !car.isOffline && Number(car.speed) > 0;
      }
      return true;
    });
  }, [cars, activeFilter]);

  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: zoom,
  });

  // ✅ مزامنة zoom القادم من Redux مع Mapbox viewState
  useEffect(() => {
    if (mapProvider !== "mapbox") return;
    setViewState((v) => (v.zoom === zoom ? v : { ...v, zoom }));
  }, [mapProvider, zoom]);

  // ✅ تحميل سكريبت Google Maps مرة واحدة فقط
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBuFc-F9K_-1QkQnLoTIecBlNz6LfCS1wg",
    language: "ar",
    libraries,
  });

  // 🧩 عند تحميل الأجهزة
  useEffect(() => {
    if (devices) {
      const mappedCars = devices?.devices.map((d) => ({
        ...d,
        position: {
          lat: parseFloat(d.latitude),
          lng: parseFloat(d.longitude),
        },
        address: d.address || "جارٍ التحديد...",
        lastUpdate: Date.now(),
      }));
      setCars(mappedCars);
      setIsInit(true);

      // 🔁 بعدها اضرب API تانية بـ full=1 (بدون لودينج)
      refetchFullDevices().then((res) => {
        const fullDevices = res.data?.devices;
        if (fullDevices) {
          const updatedCars = fullDevices.map((d) => ({
            ...d,
            position: {
              lat: parseFloat(d.latitude),
              lng: parseFloat(d.longitude),
            },
            address: d.address || "جارٍ التحديد...",
            lastUpdate: Date.now(),
          }));
          setCars(updatedCars);
        }
      });
    }
  }, [devices, refetchFullDevices]);

  // 🔍 دوال العنوان (Google / Mapbox)
  const getGoogleAddress = (lat, lng, cb) => {
    if (!window.google) return cb("عنوان غير متاح");
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) cb(results[0].formatted_address);
      else cb("لم يتم العثور على عنوان");
    });
  };

  const getMapboxAddress = async (lat, lng, cb) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=ar`
      );
      const data = await res.json();
      if (data.features?.length) cb(data.features[0].place_name);
      else cb("لم يتم العثور على عنوان");
    } catch (err) {
      console.error(err);
      cb("خطأ في جلب العنوان");
    }
  };

  // 🔌 WebSocket hook لتحديث العربيات
  useCarSocket(cars, setCars, isInit);

  // 🧭 تحديث العنوان عند تحرك العربية
  const selectedCar = useMemo(
    () => cars.find((c) => c.id === selectedCarId) || null,
    [cars, selectedCarId]
  );

  useEffect(() => {
    if (!selectedCarId || !selectedCar?.position) return;
    const { lat, lng } = selectedCar.position;

    if (
      !selectedCar.lastAddressPos ||
      haversineDistance(
        selectedCar.lastAddressPos.lat,
        selectedCar.lastAddressPos.lng,
        lat,
        lng
      ) > 0.05
    ) {
      // ✅ تهدئة طلبات العنوان (reverse geocoding) عشان ما تأثرش على سلاسة الصفحة
      const now = Date.now();
      const last = lastGeocodeAtRef.current.get(selectedCarId) || 0;
      if (now - last < 5000) return;
      lastGeocodeAtRef.current.set(selectedCarId, now);

      const updateAddress = (addr) => {
        setCars((prev) =>
          prev.map((c) =>
            c.id === selectedCarId
              ? { ...c, address: addr, lastAddressPos: { lat, lng } }
              : c
          )
        );
      };
      if (mapProvider === "google") getGoogleAddress(lat, lng, updateAddress);
      else getMapboxAddress(lat, lng, updateAddress);
    }
  }, [
    mapProvider,
    selectedCarId,
    selectedCar?.position?.lat,
    selectedCar?.position?.lng,
    selectedCar?.lastAddressPos?.lat,
    selectedCar?.lastAddressPos?.lng,
  ]);

  // 🚗 اختيار عربية من القائمة
  const handleSelectCar = useCallback(
    (car, shouldZoom = false) => {
      if (!car) return setSelectedCarId(null);

      const { position } = car;
      const { lat, lng } = position || {};

      if (
        !position ||
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        isNaN(lat) ||
        isNaN(lng)
      ) {
        toast.warning(" لا يمكن تحديد موقع هذه السيارة حاليًا");
        return setSelectedCarId(null);
      }

      if (shouldZoom) {
        setCenter(position);
        dispatch(changeZoom(18));
        if (mapProvider === "mapbox") {
          setViewState({
            longitude: lng,
            latitude: lat,
            zoom: 18,
          });
        }
      }

      setSelectedCarId(car.id);
    },
    [dispatch, mapProvider]
  );

  if (loadError) return <div>فشل تحميل الخريطة</div>;
  if (!isLoaded && mapProvider === "google") return <LoadingPage />;

  return (
    <section className="w-screen h-screen relative">
      <SideMenu
        cars={cars}
        filteredCars={filteredCars}
        isFetching={isFetching}
        handleSelectCar={handleSelectCar}
        selectedCarId={selectedCarId}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <MapActions setViewState={setViewState} />

      {mapProvider === "google" ? (
        <GoogleMapView
          cars={filteredCars}
          center={center}
          zoom={zoom}
          selectedCarId={selectedCarId}
          handleSelectCar={handleSelectCar}
        />
      ) : (
        <MapboxMapView
          cars={filteredCars}
          viewState={viewState}
          setViewState={setViewState}
          MAPBOX_TOKEN={MAPBOX_TOKEN}
          selectedCarId={selectedCarId}
          handleSelectCar={handleSelectCar}
        />
      )}

      {/* 🔹 Modals */}
      {detailsModal.show && <DetailsModal />}

      {shareModal.show && <ShareModal />}

      {geoFenceModal.show && <GeoFenceModal />}

      {associateDeviceModal.show && <AssociateDevice />}

      {supportModal.show && <SupportModal />}
    </section>
  );
};

export default TenantDashboard;
