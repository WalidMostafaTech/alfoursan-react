import { useState, useEffect, useRef, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { GiPathDistance } from "react-icons/gi";
import { IoMdSpeedometer } from "react-icons/io";
import { IoCalendarSharp } from "react-icons/io5";
import { IoMdLocate } from "react-icons/io";

import { carPath } from "../../services/carPath";
import ReplayControls from "./ReplayControls/ReplayControls";
import ReplayFilter from "./ReplayFilter/ReplayFilter";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getReplay } from "../../services/monitorServices";
import { toast } from "react-toastify";
import Loader from "../../components/Loading/Loader";
import LoadingPage from "../../components/Loading/LoadingPage";
import MapTypes from "../../components/common/MapTypes";
import TraceColor from "./TraceColor/TraceColor";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const CarReplay = () => {
  const { serial_number } = useParams();
  const [showInfo, setShowInfo] = useState(false);

  const [mapType, setMapType] = useState("roadmap");

  const defaultSpeedLimit = {
    p1: 100,
    p2: 120,
    max: 180,
  };

  const [speedLimits, setSpeedLimits] = useState({
    p1: defaultSpeedLimit.p1,
    p2: defaultSpeedLimit.p2,
    max: defaultSpeedLimit.max,
  });

  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  });

  const {
    data: { data: points = [], meta } = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["points", serial_number, dateRange],
    queryFn: () =>
      getReplay({
        serial_number,
        from_time: dateRange.from,
        to_time: dateRange.to,
      }),
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBuFc-F9K_-1QkQnLoTIecBlNz6LfCS1wg",
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);
  const defaultPosition = { lat: 23.8859, lng: 45.0792 };

  const [mapRef, setMapRef] = useState(null);
  const [initialCenter, setInitialCenter] = useState(defaultPosition);

  // تحديد نقطة البداية أول مرة فقط
  useEffect(() => {
    if (points.length > 0) {
      setInitialCenter({ lat: points[0].latitude, lng: points[0].longitude });
    }
  }, [points]);

  useEffect(() => {
    if (!mapRef || points.length === 0) return;

    const carLatLng = new window.google.maps.LatLng(
      currentPoint.latitude,
      currentPoint.longitude
    );

    const bounds = mapRef.getBounds();

    if (!bounds) return;

    if (!bounds.contains(carLatLng)) {
      mapRef.panTo(carLatLng);
    }
  }, [currentIndex, mapRef, points]);

  useEffect(() => {
    if (isPlaying && points.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < points.length - 1) return prev + 1;
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return prev;
        });
      }, 1000 / speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, points]);

  const handleTogglePlay = () => {
    if (points.length > 0 && currentIndex === points.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const carIcon = useMemo(() => {
    const google = window.google;
    if (!isLoaded || !google) {
      return {
        path: "",
        scale: 0,
      };
    }

    return {
      path: carPath,
      fillColor: "#1dbf73",
      fillOpacity: 1,
      strokeColor: "#000",
      strokeWeight: 0.7,
      scale: 0.05,
      anchor: new google.maps.Point(150, 40),
    };
  }, [isLoaded]);

  // ✅ تحسين: دمج الـ Polylines حسب اللون
  const polylineSegments = useMemo(() => {
    if (points.length === 0) return { green: [], yellow: [], red: [] };

    const segments = {
      green: [],
      yellow: [],
      red: [],
    };

    let currentColor = null;
    let currentPath = [];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const speed = point.speed;

      let color = "green";
      if (speed > speedLimits.p1 && speed <= speedLimits.p2) {
        color = "yellow";
      } else if (speed > speedLimits.p2) {
        color = "red";
      }

      const latLng = { lat: point.latitude, lng: point.longitude };

      if (currentColor === null) {
        currentColor = color;
        currentPath = [latLng];
      } else if (currentColor === color) {
        currentPath.push(latLng);
      } else {
        // تغير اللون، احفظ المسار القديم وابدأ واحد جديد
        if (currentPath.length > 0) {
          segments[currentColor].push([...currentPath]);
        }
        currentColor = color;
        currentPath = [currentPath[currentPath.length - 1], latLng];
      }
    }

    // احفظ آخر مسار
    if (currentPath.length > 0) {
      segments[currentColor].push(currentPath);
    }

    return segments;
  }, [points, speedLimits]);

  // ✅ تحسين: حفظ نقاط الوقوف في useMemo
  const parkingMarkers = useMemo(() => {
    if (points.length === 0) return [];

    return points
      .map((point, index) => ({ ...point, originalIndex: index }))
      .filter(
        (point, index) =>
          point.speed === 0 && index !== 0 && index !== points.length - 1
      );
  }, [points]);

  // ✅ تحسين: حفظ نقاط البداية والنهاية
  const startEndMarkers = useMemo(() => {
    if (points.length === 0) return null;

    return {
      start: { lat: points[0].latitude, lng: points[0].longitude },
      end: {
        lat: points[points.length - 1].latitude,
        lng: points[points.length - 1].longitude,
      },
    };
  }, [points]);

  if (!isLoaded) return <LoadingPage />;

  const handleDateChange = (from, to) => {
    const diffDays =
      (new Date(to).getTime() - new Date(from).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      toast.warn("⚠️ لا يمكن اختيار أكثر من 30 يومًا");
      return;
    }

    setIsPlaying(false);
    setCurrentIndex(0);

    setDateRange({ from, to });
    refetch();
  };

  const currentPoint = points[currentIndex] || {
    latitude: 23.8859,
    longitude: 45.0792,
    direction: 0,
  };

  const formatDate = (dateString) => {
    const formattedDate = new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return formattedDate;
  };

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={(map) => setMapRef(map)}
        center={initialCenter}
        zoom={points.length > 0 ? 16 : 6}
        mapTypeId={mapType}
      >
        {/* ✅ المسار الكامل - محسّن */}
        {points.length > 0 && (
          <>
            {/* رسم المسارات الخضراء */}
            {polylineSegments.green.map((path, index) => (
              <Polyline
                key={`green-${index}`}
                path={path}
                options={{
                  strokeColor: "#1dbf73",
                  strokeWeight: 5,
                  strokeOpacity: 0.9,
                }}
              />
            ))}

            {/* رسم المسارات الصفراء */}
            {polylineSegments.yellow.map((path, index) => (
              <Polyline
                key={`yellow-${index}`}
                path={path}
                options={{
                  strokeColor: "#FFD700",
                  strokeWeight: 5,
                  strokeOpacity: 0.9,
                }}
              />
            ))}

            {/* رسم المسارات الحمراء */}
            {polylineSegments.red.map((path, index) => (
              <Polyline
                key={`red-${index}`}
                path={path}
                options={{
                  strokeColor: "#FF0000",
                  strokeWeight: 5,
                  strokeOpacity: 0.9,
                }}
              />
            ))}

            {/* ✅ نقطة البداية */}
            {startEndMarkers && (
              <>
                <Marker
                  position={startEndMarkers.start}
                  label={{
                    text: "B",
                    color: "#1dbf73",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 14,
                    fillColor: "white",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#1dbf73",
                  }}
                />

                {/* ✅ نقطة النهاية */}
                <Marker
                  position={startEndMarkers.end}
                  label={{
                    text: "E",
                    color: "#ff4b4b",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 14,
                    fillColor: "white",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ff4b4b",
                  }}
                />
              </>
            )}

            {/* ✅ نقاط الوقوف - محسّنة */}
            {parkingMarkers.map((point) => (
              <Marker
                key={point.originalIndex}
                position={{
                  lat: point.latitude,
                  lng: point.longitude,
                }}
                label={{
                  text: "P",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#0f0f84",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#fff",
                }}
              />
            ))}
          </>
        )}

        {/* العربية */}
        {carIcon && (
          <Marker
            position={{
              lat: currentPoint.latitude,
              lng: currentPoint.longitude,
            }}
            icon={{
              ...carIcon,
              rotation: currentPoint.direction,
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            onClick={() => setShowInfo(true)}
          >
            {showInfo && (
              <InfoWindow onCloseClick={() => setShowInfo(false)}>
                <div className="p-2 pb-4 w-[400px]">
                  <h3 className="text-lg font-bold text-mainColor mb-4">
                    {meta?.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <p className="flex items-center gap-1 font-medium">
                      <IoMdSpeedometer size={16} />
                      {currentPoint.speed} km/h
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      <IoCalendarSharp size={16} />
                      {formatDate(currentPoint.date)}
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      <GiPathDistance size={16} />
                      {currentPoint.distance.toFixed(6)} km
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      <IoMdLocate size={16} />
                      {currentPoint.latitude.toFixed(6)},
                      {currentPoint.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>

      <TraceColor
        speedLimits={speedLimits}
        setSpeedLimits={setSpeedLimits}
        defaultSpeedLimit={defaultSpeedLimit}
      />

      <ReplayFilter onDateChange={handleDateChange} />

      <div className="absolute top-[15%] right-3 z-20 space-y-2 flex flex-col items-center">
        <MapTypes onChange={setMapType} />
      </div>

      {isLoading ? (
        <div className="absolute w-full max-w-4xl bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-full px-8 py-6 flex items-center justify-center">
          <Loader />
        </div>
      ) : points.length === 0 ? (
        <div className="absolute w-full max-w-4xl bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-full px-8 py-6 flex items-center justify-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700">
            لا يوجد بيانات لعرضها في هذه الفترة
          </h2>
        </div>
      ) : (
        <ReplayControls
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          pointsLength={points.length}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      )}
    </div>
  );
};

export default CarReplay;
