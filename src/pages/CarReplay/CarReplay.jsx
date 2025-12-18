import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

const getPointColor = (speed, speedLimits) => {
  const s = Number(speed) || 0;
  if (s > speedLimits.p1 && s <= speedLimits.p2) return "yellow";
  if (s > speedLimits.p2) return "red";
  return "green";
};

// مسافة تقريبية (بالدرجات) من نقطة إلى خط (A-B) باستخدام equirectangular approximation
const pointToSegmentDistanceSq = (p, a, b) => {
  const latRad = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(latRad) || 1;

  const ax = a.lng * cosLat;
  const ay = a.lat;
  const bx = b.lng * cosLat;
  const by = b.lat;
  const px = p.lng * cosLat;
  const py = p.lat;

  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;

  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) {
    const dx = px - ax;
    const dy = py - ay;
    return dx * dx + dy * dy;
  }

  let t = (apx * abx + apy * aby) / abLenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;

  const cx = ax + t * abx;
  const cy = ay + t * aby;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
};

// Ramer–Douglas–Peucker simplification (iterative) to avoid call-stack issues
const simplifyPathRdp = (path, epsilon) => {
  if (!path || path.length <= 2) return path;
  const epsSq = epsilon * epsilon;

  const keep = new Uint8Array(path.length);
  keep[0] = 1;
  keep[path.length - 1] = 1;

  const stack = [[0, path.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let maxDistSq = 0;
    let idx = -1;
    const a = path[start];
    const b = path[end];

    for (let i = start + 1; i < end; i++) {
      const dSq = pointToSegmentDistanceSq(path[i], a, b);
      if (dSq > maxDistSq) {
        maxDistSq = dSq;
        idx = i;
      }
    }

    if (idx !== -1 && maxDistSq > epsSq) {
      keep[idx] = 1;
      stack.push([start, idx], [idx, end]);
    }
  }

  const out = [];
  for (let i = 0; i < path.length; i++) {
    if (keep[i]) out.push(path[i]);
  }
  return out;
};

const buildPolylineSegmentsByColor = (points, speedLimits) => {
  const segments = { green: [], yellow: [], red: [] };
  if (!points || points.length === 0) return segments;

  let currentColor = null;
  let currentPath = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const lat = Number(point.latitude);
    const lng = Number(point.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const color = getPointColor(point.speed, speedLimits);
    const latLng = { lat, lng };

    if (currentColor === null) {
      currentColor = color;
      currentPath = [latLng];
      continue;
    }

    if (currentColor === color) {
      currentPath.push(latLng);
      continue;
    }

    // اللون اتغير: احفظ المسار وابدأ جديد مع نقطة وصل
    if (currentPath.length > 0) {
      segments[currentColor].push(currentPath);
    }

    currentColor = color;
    currentPath = [currentPath[currentPath.length - 1], latLng].filter(Boolean);
  }

  if (currentColor && currentPath.length > 0) {
    segments[currentColor].push(currentPath);
  }

  return segments;
};

const countSegmentPoints = (segments) => {
  let total = 0;
  ["green", "yellow", "red"].forEach((c) => {
    segments[c].forEach((path) => {
      total += path.length;
    });
  });
  return total;
};

const getBoundsDiag = (points) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const lat = Number(points[i]?.latitude);
    const lng = Number(points[i]?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  if (!Number.isFinite(minLat) || !Number.isFinite(minLng)) return 0;
  const meanLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(meanLatRad) || 1;
  const dx = (maxLng - minLng) * cosLat;
  const dy = maxLat - minLat;
  return Math.sqrt(dx * dx + dy * dy);
};

const simplifySegmentsToMaxPoints = (rawSegments, points, maxTotalPoints) => {
  const currentTotal = countSegmentPoints(rawSegments);
  if (currentTotal <= maxTotalPoints) return rawSegments;

  const diag = getBoundsDiag(points);
  if (diag <= 0) return rawSegments;

  const applyEps = (eps) => ({
    green: rawSegments.green.map((p) => simplifyPathRdp(p, eps)),
    yellow: rawSegments.yellow.map((p) => simplifyPathRdp(p, eps)),
    red: rawSegments.red.map((p) => simplifyPathRdp(p, eps)),
  });

  // ابحث عن epsilon مناسب (binary search)
  let low = 0;
  let high = diag;
  let best = rawSegments;

  for (let i = 0; i < 10; i++) {
    const mid = (low + high) / 2;
    const simplified = applyEps(mid);
    const total = countSegmentPoints(simplified);

    if (total > maxTotalPoints) {
      low = mid;
    } else {
      best = simplified;
      high = mid;
    }
  }

  return best;
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
    data: replayData,
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
  const points = replayData?.data || [];
  const meta = replayData?.meta;

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
  const rotatedIconCacheRef = useRef(new Map());
  const lastPanToRef = useRef(0);

  // تحديد نقطة البداية أول مرة فقط
  useEffect(() => {
    if (points.length > 0) {
      setInitialCenter({ lat: points[0].latitude, lng: points[0].longitude });
    }
  }, [points]);

  const currentPoint = points[currentIndex] || {
    latitude: 23.8859,
    longitude: 45.0792,
    direction: 0,
    speed: 0,
    distance: 0,
  };

  useEffect(() => {
    if (!mapRef || points.length === 0) return;

    const carLatLng = new window.google.maps.LatLng(
      currentPoint.latitude,
      currentPoint.longitude
    );

    const bounds = mapRef.getBounds();

    if (!bounds) return;

    if (!bounds.contains(carLatLng)) {
      // تهدئة panTo عشان السلاسة (خاصة مع سرعات تشغيل عالية)
      const now = Date.now();
      if (now - lastPanToRef.current > 250) {
        lastPanToRef.current = now;
        mapRef.panTo(carLatLng);
      }
    }
  }, [currentIndex, mapRef, points.length, currentPoint.latitude, currentPoint.longitude]);

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

  const getCarBaseIconUrl = useCallback((speedValue) => {
    // نفس المنطق المستخدم سابقًا للأيقونات
    if (speedValue > 5) return "/car-green.png";
    if (speedValue === 0) return "/car-red.png";
    return "/car-blue.png";
  }, []);

  const ensureRotatedPngDataUrl = useCallback((baseIconUrl, rotationDeg) => {
    const normalizedRotation = ((rotationDeg % 360) + 360) % 360;
    const roundedRotation = Math.round(normalizedRotation);
    const key = `${baseIconUrl}|${roundedRotation}`;

    const cached = rotatedIconCacheRef.current.get(key);
    if (typeof cached === "string") return Promise.resolve(cached);
    if (cached && typeof cached.then === "function") return cached;

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = 40;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(baseIconUrl);
          return;
        }
        ctx.translate(size / 2, size / 2);
        ctx.rotate((roundedRotation * Math.PI) / 180);
        ctx.translate(-size / 2, -size / 2);
        ctx.drawImage(img, 0, 0, size, size);
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(baseIconUrl);
        }
      };
      img.onerror = () => resolve(baseIconUrl);
      img.src = baseIconUrl;
    });

    rotatedIconCacheRef.current.set(key, promise);
    promise.then((dataUrl) => rotatedIconCacheRef.current.set(key, dataUrl));
    return promise;
  }, []);

  const [carIconUrl, setCarIconUrl] = useState(null);

  useEffect(() => {
    if (!isLoaded || !window.google) return;
    const s = Number(currentPoint.speed) || 0;
    const base = getCarBaseIconUrl(s);
    const dir = Number(currentPoint.direction) || 0;
    ensureRotatedPngDataUrl(base, dir).then((url) => setCarIconUrl(url));
  }, [
    isLoaded,
    currentPoint.speed,
    currentPoint.direction,
    getCarBaseIconUrl,
    ensureRotatedPngDataUrl,
  ]);

  const MAX_POLYLINE_POINTS = 5000;
  const MAX_PARKING_MARKERS = 200;

  // ✅ Polylines حسب اللون + تبسيط ذكي (RDP) بدل downsample الساذج
  const polylineSegments = useMemo(() => {
    if (points.length === 0) return { green: [], yellow: [], red: [] };
    const raw = buildPolylineSegmentsByColor(points, speedLimits);
    return simplifySegmentsToMaxPoints(raw, points, MAX_POLYLINE_POINTS);
  }, [points, speedLimits]);

  // ✅ تحسين: نقاط الوقوف بدون نسخ كل points + مع حد أقصى
  const parkingMarkers = useMemo(() => {
    if (points.length === 0) return [];
    const markers = [];
    let inStop = false;
    let stopStartIdx = -1;

    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      const isStop = Number(p.speed) === 0;
      if (isStop && !inStop) {
        inStop = true;
        stopStartIdx = i;
      } else if (!isStop && inStop) {
        // نهاية الوقوف: خذ نقطة وسطية لتمثيل الوقوف
        const mid = Math.floor((stopStartIdx + i - 1) / 2);
        markers.push({ index: mid, latitude: points[mid].latitude, longitude: points[mid].longitude });
        inStop = false;
        stopStartIdx = -1;
        if (markers.length >= MAX_PARKING_MARKERS) break;
      }
    }

    return markers;
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
                key={point.index}
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
        {carIconUrl && (
          <Marker
            position={{
              lat: currentPoint.latitude,
              lng: currentPoint.longitude,
            }}
            icon={{
              url: carIconUrl,
              // scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
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
