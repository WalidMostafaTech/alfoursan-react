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
import { carPath } from "../../services/carPath";

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

// ✅ haversine distance in meters (lightweight, for spike filtering)
const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  const pointsRaw = replayData?.data || [];
  const meta = replayData?.meta;

  // ✅ إزالة القفزات غير المنطقية (GPS spikes) + تنظيف البيانات
  const points = useMemo(() => {
    if (!pointsRaw?.length) return [];

    const MAX_SPEED_KMH = 250; // سقف منطقي للفصل بين النقاط
    const MIN_DT_SEC = 5; // أقل زمن نعتمد عليه لحساب سرعة بين نقطتين
    const MAX_JUMP_METERS_NO_TIME = 10000; // لو مفيش وقت: تجاهل قفزة > 10km

    const out = [];
    let prev = null;

    const parseMs = (v) => {
      const ms = Date.parse(v);
      return Number.isFinite(ms) ? ms : null;
    };

    for (let i = 0; i < pointsRaw.length; i++) {
      const p = pointsRaw[i];
      const lat = Number(p?.latitude);
      const lng = Number(p?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      // (0,0) غالبًا نقطة خاطئة
      if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) continue;

      const normalized = { ...p, latitude: lat, longitude: lng };

      if (!prev) {
        out.push(normalized);
        prev = normalized;
        continue;
      }

      const distM = haversineMeters(prev.latitude, prev.longitude, lat, lng);
      const t0 = prev?.date ? parseMs(prev.date) : null;
      const t1 = p?.date ? parseMs(p.date) : null;
      const dtSec = t0 != null && t1 != null ? (t1 - t0) / 1000 : null;

      // لو نفس النقطة تقريبًا: احفظها (مهمة للثبات/الوقوف)
      if (distM < 2) {
        out.push(normalized);
        prev = normalized;
        continue;
      }

      // Spike detection
      if (dtSec != null && dtSec > 0) {
        if (dtSec < MIN_DT_SEC && distM > 1000) {
          // قفزة كبيرة في زمن صغير جدًا
          continue;
        }
        const impliedSpeed = (distM / dtSec) * 3.6;
        if (impliedSpeed > MAX_SPEED_KMH && distM > 2000) {
          continue;
        }
      } else {
        // no valid timestamps
        if (distM > MAX_JUMP_METERS_NO_TIME) continue;
      }

      out.push(normalized);
      prev = normalized;
    }

    return out;
  }, [pointsRaw]);

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
  const lastPanToRef = useRef(0);

  // ✅ حركة ناعمة بين النقاط
  const [renderPosition, setRenderPosition] = useState(null);
  const [renderDirection, setRenderDirection] = useState(0);
  const animRef = useRef({ raf: 0, start: null, end: null, t0: 0, dur: 0 });

  // تحديد نقطة البداية أول مرة فقط
  useEffect(() => {
    if (points.length > 0) {
      setInitialCenter({ lat: points[0].latitude, lng: points[0].longitude });
    }
  }, [points]);

  // ✅ لو تم تنظيف نقاط كثيرة، حافظ على index داخل الحدود
  useEffect(() => {
    if (points.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }
    if (currentIndex > points.length - 1) setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);

  const currentPoint = points[currentIndex] || {
    latitude: 23.8859,
    longitude: 45.0792,
    direction: 0,
    speed: 0,
    distance: 0,
  };

  const nextPoint = points[currentIndex + 1] || null;
  const targetPosition = {
    lat: currentPoint.latitude,
    lng: currentPoint.longitude,
  };
  const targetDirection = Number(currentPoint.direction) || 0;

  // ✅ حركة ناعمة بين النقاط (interpolation)
  useEffect(() => {
    if (points.length === 0) {
      setRenderPosition(null);
      return;
    }

    if (!renderPosition) {
      setRenderPosition(targetPosition);
      setRenderDirection(targetDirection);
      return;
    }

    const start = renderPosition;
    const end = targetPosition;
    const startDir = renderDirection;
    const endDir = targetDirection;

    // لو نفس النقطة: لا حاجة لـ animation
    if (start.lat === end.lat && start.lng === end.lng && startDir === endDir) {
      return;
    }

    // حساب المسافة والمدة
    const distM = haversineMeters(start.lat, start.lng, end.lat, end.lng);
    // مدة الـ animation حسب المسافة (clamp بين 200ms و 800ms)
    const dur = Math.max(200, Math.min(800, distM * 2));

    if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);

    animRef.current = {
      raf: 0,
      start,
      end,
      startDir,
      endDir,
      t0: performance.now(),
      dur,
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const lerpAngle = (a, b, t) => {
      const diff = ((b - a + 540) % 360) - 180;
      return a + diff * t;
    };

    const tick = (now) => {
      const { start, end, startDir, endDir, t0, dur } = animRef.current;
      const t = Math.min(1, (now - t0) / dur);

      const nextPos = {
        lat: lerp(start.lat, end.lat, t),
        lng: lerp(start.lng, end.lng, t),
      };
      const nextDir = lerpAngle(startDir, endDir, t);

      setRenderPosition(nextPos);
      setRenderDirection(nextDir);

      if (t < 1) {
        animRef.current.raf = requestAnimationFrame(tick);
      } else {
        animRef.current.raf = 0;
      }
    };

    animRef.current.raf = requestAnimationFrame(tick);

    return () => {
      if (animRef.current.raf) {
        cancelAnimationFrame(animRef.current.raf);
        animRef.current.raf = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, points.length]);

  useEffect(() => {
    if (!mapRef || !renderPosition) return;

    const carLatLng = new window.google.maps.LatLng(
      renderPosition.lat,
      renderPosition.lng
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
  }, [mapRef, renderPosition]);

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

  const getReplayCarColor = useCallback((speedValue) => {
    const s = Number(speedValue) || 0;
    return s > 1 ? "#22c55e" : "#3b82f6";
  }, []);

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
        {points.length > 0 && renderPosition && (
          <Marker
            position={renderPosition}
            icon={{
              path: carPath,
              fillColor: getReplayCarColor(currentPoint.speed),
              fillOpacity: 1,
              strokeColor: "#000",
              strokeWeight: 0.7,
              scale: 0.05,
              rotation: renderDirection,
              anchor: new window.google.maps.Point(156, 256),
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
