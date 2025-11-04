import { useState, useEffect, useRef, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import { points } from "../../services/pointsData";
import { carPath } from "../../services/carPath";
import ReplayControls from "./ReplayControls/ReplayControls";
import ReplayFilter from "./ReplayFilter/ReplayFilter";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const CarReplay = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBuFc-F9K_-1QkQnLoTIecBlNz6LfCS1wg",
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  // ⏩ التحريك التلقائي
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < points.length - 1) {
            return prev + 1;
          } else {
            // ✅ لما يوصل للنهاية يوقف التحريك ويعيد الزرار لـ Play
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000 / speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed]);

  // ✅ لما المستخدم يضغط Play بعد ما الحركة خلصت
  const handleTogglePlay = () => {
    if (currentIndex === points.length - 1) {
      setCurrentIndex(0); // رجّع البداية
    }
    setIsPlaying((prev) => !prev);
  };

  const carIcon = useMemo(() => {
    if (!isLoaded || !window.google) return null;
    return {
      // url: "/car-green.png",
      path: carPath,
      fillColor: "#1dbf73",
      fillOpacity: 1,
      strokeColor: "#000",
      strokeWeight: 0.7,
      scale: 0.07,
      anchor: new window.google.maps.Point(150, 40),
    };
  }, [isLoaded]);

  if (!isLoaded) return <div>Loading...</div>;

  const currentPoint = points[currentIndex];
  const fullPath = points.map((p) => ({ lat: p.latitude, lng: p.longitude }));
  const traveledPath = fullPath.slice(0, currentIndex + 1);

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: points[0].latitude, lng: points[0].longitude }}
        zoom={17}
      >
        {/* الخط الكامل */}
        <Polyline
          path={fullPath}
          options={{
            strokeColor: "#cfcfcf",
            strokeWeight: 6,
            strokeOpacity: 0.6,
          }}
        />

        {/* الخط اللي العربية مشت عليه */}
        <Polyline
          path={traveledPath}
          options={{ strokeColor: "#1dbf73", strokeWeight: 6 }}
        />

        {/* ✅ ماركر البداية (B) */}
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
            scale: 16,
            fillColor: "#1dbf73",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#fff",
          }}
        />

        {/* ✅ ماركر النهاية (E) */}
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
            scale: 16,
            fillColor: "#ff4b4b",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#fff",
          }}
        />

        {/* ✅ العربية نفسها */}
        {currentPoint && carIcon && (
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

      {/* الفلتر */}
      <ReplayFilter />

      {/* الكنترولز */}
      <ReplayControls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        pointsLength={points.length}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
};

export default CarReplay;
