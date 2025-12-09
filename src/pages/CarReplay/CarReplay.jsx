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
  // ✅ استخدم موقع افتراضي لو مفيش نقاط
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

    // لو bounds لسه مش جاهزة (أول ثانية بعد التحميل)
    if (!bounds) return;

    // لو العربية خرجت بره الشاشة → حرّك الخريطة
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
    // لو المكتبة لسه مش جاهزة، استخدم قيمة ثابتة
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

  if (!isLoaded) return <LoadingPage />;

  const handleDateChange = (from, to) => {
    const diffDays =
      (new Date(to).getTime() - new Date(from).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      toast.warn("⚠️ لا يمكن اختيار أكثر من 30 يومًا");
      return;
    }
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
        center={initialCenter} // ثابت ولن يتغير
        zoom={points.length > 0 ? 16 : 6}
        mapTypeId={mapType}
      >
        {/* المسار الكامل */}
        {points.length > 0 && (
          <>
            {points.slice(1).map((point, index) => {
              const prev = points[index];
              const curr = point;

              let color = "#1dbf73"; // أخضر

              const carSpeed = curr.speed;

              if (carSpeed > speedLimits.p1 && carSpeed <= speedLimits.p2) {
                color = "#FFD700"; // أصفر
              } else if (carSpeed > speedLimits.p2) {
                color = "#FF0000"; // أحمر
              }

              return (
                <Polyline
                  key={index}
                  path={[
                    { lat: prev.latitude, lng: prev.longitude },
                    { lat: curr.latitude, lng: curr.longitude },
                  ]}
                  options={{
                    strokeColor: color,
                    strokeWeight: 5,
                    strokeOpacity: 0.9,
                  }}
                />
              );
            })}

            {/* بداية */}
            <Marker
              position={{ lat: points[0].latitude, lng: points[0].longitude }}
              label={{
                text: "B",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#1dbf73",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#fff",
              }}
            />

            {/* نهاية */}
            <Marker
              position={{
                lat: points[points.length - 1].latitude,
                lng: points[points.length - 1].longitude,
              }}
              label={{
                text: "E",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#ff4b4b",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#fff",
              }}
            />

            {points.map(
              (point, index) =>
                point.speed === 0 && (
                  <Marker
                    key={index}
                    position={{
                      lat: point.latitude,
                      lng: point.longitude,
                    }}
                    label={{
                      text: "P",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 12,
                      fillColor: "#0f0f84",
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: "#fff",
                    }}
                  />
                )
            )}
          </>
        )}

        {/* العربية (حتى لو مفيش نقاط) */}
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
            onClick={() => setShowInfo(true)} // لما تضغط على العربية
          >
            {showInfo && (
              <InfoWindow onCloseClick={() => setShowInfo(false)}>
                <div className="p-2 w-[400px]">
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

      {/* فلتر التاريخ */}
      <ReplayFilter onDateChange={handleDateChange} />

      <div className="absolute top-[15%] right-3 z-20 space-y-2 flex flex-col items-center">
        <MapTypes onChange={setMapType} />
      </div>

      {/* الكنترولز */}
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
