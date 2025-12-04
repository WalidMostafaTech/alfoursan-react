import { useState, useEffect, useRef, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import { carPath } from "../../services/carPath";
import ReplayControls from "./ReplayControls/ReplayControls";
import ReplayFilter from "./ReplayFilter/ReplayFilter";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getReplay } from "../../services/monitorServices";
import { toast } from "react-toastify";
import Loader from "../../components/Loading/Loader";
import LoadingPage from "../../components/Loading/LoadingPage";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const CarReplay = () => {
  const { serial_number } = useParams();

  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  });

  const {
    data: points = [],
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

  // ✅ استخدم موقع افتراضي لو مفيش نقاط
  const defaultPosition = { lat: 23.8859, lng: 45.0792 };
  const currentPoint = points[currentIndex] || {
    latitude: 23.8859,
    longitude: 45.0792,
    direction: 0,
  };

  const fullPath =
    points.length > 0
      ? points.map((p) => ({ lat: p.latitude, lng: p.longitude }))
      : [];
  const traveledPath = fullPath.slice(0, currentIndex + 1);

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={
          points.length > 0
            ? { lat: points[0].latitude, lng: points[0].longitude }
            : defaultPosition
        }
        zoom={points.length > 0 ? 16 : 6}
      >
        {/* المسار الكامل */}
        {points.length > 0 && (
          <>
            {/* <Polyline
              path={fullPath}
              options={{
                strokeColor: "#a10a29",
                strokeWeight: 5,
                strokeOpacity: 0.6,
              }}
            /> */}

            {points.slice(1).map((point, index) => {
              const prev = points[index];
              const curr = point;

              const speed = curr.speed;
              let color = "#1dbf73"; // أخضر افتراضي
              if (speed > 100 && speed <= 120) color = "#FFD700"; // أصفر
              else if (speed > 120) color = "#FF0000"; // أحمر

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

            {/* <Polyline
              path={traveledPath}
              options={{ strokeColor: "#1dbf73", strokeWeight: 5 }}
            /> */}

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
          />
        )}
      </GoogleMap>

      {/* فلتر التاريخ */}
      <ReplayFilter onDateChange={handleDateChange} />

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
