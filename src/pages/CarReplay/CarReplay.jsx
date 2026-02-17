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
import { FaCrosshairs } from "react-icons/fa";

import ReplayControls from "./ReplayControls/ReplayControls";
import ReplayFilter from "./ReplayFilter/ReplayFilter";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getReplay } from "../../services/monitorServices";
import { toast } from "react-toastify";
import Loader from "../../components/Loading/Loader";
import LoadingPage from "../../components/Loading/LoadingPage";
import MapTypes from "../../components/common/MapTypes";
import TraceColor from "./TraceColor/TraceColor";
import { carPath } from "../../services/carPath";
import { CgHomeAlt } from "react-icons/cg";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const BACK_URL = window.__BACK_URL__;

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
    const lat = Number(points[i]?.latitude ?? points[i]?.lat);
    const lng = Number(points[i]?.longitude ?? points[i]?.lng);
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

const bearingDeg = (lat1, lng1, lat2, lng2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const toDeg = (x) => (x * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
};

const lerpAngle = (a, b, t) => {
  const diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
};

// RDP simplification but return "keep mask" to preserve original point objects
const simplifyKeepMaskRdp = (pathLatLng, epsilon) => {
  if (!pathLatLng || pathLatLng.length <= 2) {
    const keep = new Uint8Array(pathLatLng?.length || 0);
    if (keep.length) {
      keep[0] = 1;
      keep[keep.length - 1] = 1;
    }
    return keep;
  }

  const epsSq = epsilon * epsilon;
  const keep = new Uint8Array(pathLatLng.length);
  keep[0] = 1;
  keep[pathLatLng.length - 1] = 1;

  const stack = [[0, pathLatLng.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let maxDistSq = 0;
    let idx = -1;
    const a = pathLatLng[start];
    const b = pathLatLng[end];

    for (let i = start + 1; i < end; i++) {
      const dSq = pointToSegmentDistanceSq(pathLatLng[i], a, b);
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

  return keep;
};

const countKept = (keepMask) => {
  let n = 0;
  for (let i = 0; i < keepMask.length; i++) if (keepMask[i]) n++;
  return n;
};

const simplifyPointsToMax = (points, maxPoints) => {
  if (!points || points.length <= maxPoints) return points || [];
  const path = points.map((p) => ({
    lat: Number(p.latitude),
    lng: Number(p.longitude),
  }));
  const diag = getBoundsDiag(path);
  if (!Number.isFinite(diag) || diag <= 0) return points;

  let low = 0;
  let high = diag;
  let bestMask = simplifyKeepMaskRdp(path, 0);
  let bestCount = countKept(bestMask);

  // binary search epsilon to reach <= maxPoints
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2;
    const mask = simplifyKeepMaskRdp(path, mid);
    const c = countKept(mask);
    if (c > maxPoints) {
      low = mid;
    } else {
      bestMask = mask;
      bestCount = c;
      high = mid;
    }
  }

  // fallback safety
  if (bestCount <= 2)
    return [points[0], points[points.length - 1]].filter(Boolean);

  const out = [];
  for (let i = 0; i < points.length; i++) {
    if (bestMask[i]) out.push(points[i]);
  }
  return out;
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
    const MAX_JUMP_METERS = 20000; // حماية إضافية لو timestamps كبيرة لكن القفزة غير منطقية

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
        // قفزة ضخمة بغض النظر عن الزمن
        if (distM > MAX_JUMP_METERS) continue;
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

  const MAX_REPLAY_POINTS = 9000;
  // ✅ نقطة واحدة "مصدر" للحركة + للرسم (لتجنب اختلاف المسار عند تبسيط polyline فقط)
  const replayPoints = useMemo(
    () => simplifyPointsToMax(points, MAX_REPLAY_POINTS),
    [points],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [followCar, setFollowCar] = useState(true);
  const defaultPosition = { lat: 23.8859, lng: 45.0792 };

  const [mapRef, setMapRef] = useState(null);
  const mapRefRef = useRef(null);
  const [initialCenter, setInitialCenter] = useState(defaultPosition);
  const lastPanToRef = useRef(0);
  const lastUserMapInteractionAtRef = useRef(0);

  // ✅ حركة ناعمة (time-based) بين النقاط
  const [renderPosition, setRenderPosition] = useState(null);
  const [renderDirection, setRenderDirection] = useState(0);
  const rafRef = useRef(0);
  const lastFrameMsRef = useRef(0);
  const indexRef = useRef(0);
  const progressRef = useRef(0);
  const speedRef = useRef(speed);
  const followRef = useRef(followCar);
  const renderDirRef = useRef(0);

  useEffect(() => {
    mapRefRef.current = mapRef;
  }, [mapRef]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    followRef.current = followCar;
  }, [followCar]);

  const segmentDurationsMs = useMemo(() => {
    if (!replayPoints || replayPoints.length < 2) return [];

    const parseMs = (v) => {
      const ms = Date.parse(v);
      return Number.isFinite(ms) ? ms : null;
    };

    const out = new Array(replayPoints.length - 1);
    for (let i = 0; i < replayPoints.length - 1; i++) {
      const a = replayPoints[i];
      const b = replayPoints[i + 1];
      const distM = haversineMeters(
        a.latitude,
        a.longitude,
        b.latitude,
        b.longitude,
      );

      const t0 = a?.date ? parseMs(a.date) : null;
      const t1 = b?.date ? parseMs(b.date) : null;
      const dtDevice = t0 != null && t1 != null ? t1 - t0 : null;

      // ✅ مدة متوقعة للحركة من المسافة والسرعة (أكثر واقعية عند وجود gaps كبيرة في البيانات)
      const vKmh = Math.max(Number(a?.speed) || Number(b?.speed) || 20, 5);
      const vMs = vKmh / 3.6;
      const travelMs = (distM / Math.max(vMs, 0.1)) * 1000;

      let dt = travelMs;
      if (dtDevice != null && Number.isFinite(dtDevice) && dtDevice > 0) {
        // لو dt من الجهاز منطقي وقريب من مدة الحركة، استخدمه
        // لكن لو dt كبير جدًا مقارنة بالحركة (مثلاً الجهاز كان ساكت/فجوة)، استخدم مدة الحركة بدل ما العربية “تزحف” أو “تقفز”
        const GAP_FACTOR = 4; // إذا الزمن أكبر من 4x زمن الحركة نعتبره gap
        dt = dtDevice > travelMs * GAP_FACTOR ? travelMs : dtDevice;
      }

      // ✅ clamp خفيف فقط لتجنب 0ms/قيم غير منطقية، بدون سقف صغير يعمل "teleport"
      out[i] = Math.max(120, Math.min(10 * 60 * 1000, dt));
    }
    return out;
  }, [replayPoints]);

  // تحديد نقطة البداية أول مرة فقط
  useEffect(() => {
    if (replayPoints.length > 0) {
      setInitialCenter({
        lat: replayPoints[0].latitude,
        lng: replayPoints[0].longitude,
      });
    }
  }, [replayPoints]);

  // ✅ لو تم تنظيف نقاط كثيرة، حافظ على index داخل الحدود
  useEffect(() => {
    if (replayPoints.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }
    if (currentIndex > replayPoints.length - 1) setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayPoints.length]);

  const currentPoint = replayPoints[currentIndex] || {
    latitude: 23.8859,
    longitude: 45.0792,
    direction: 0,
    speed: 0,
    distance: 0,
  };

  // init render state when data changes
  useEffect(() => {
    if (replayPoints.length === 0) {
      setRenderPosition(null);
      return;
    }
    const idx = 0;
    indexRef.current = idx;
    progressRef.current = 0;
    setCurrentIndex(idx);
    setRenderPosition({
      lat: replayPoints[0].latitude,
      lng: replayPoints[0].longitude,
    });

    const b = replayPoints[1]
      ? bearingDeg(
          replayPoints[0].latitude,
          replayPoints[0].longitude,
          replayPoints[1].latitude,
          replayPoints[1].longitude,
        )
      : 0;
    renderDirRef.current = b;
    setRenderDirection(b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayPoints.length]);

  // ✅ محرك التشغيل (time-based) باستخدام requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;
    if (replayPoints.length < 2) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastFrameMsRef.current = performance.now();

    const step = (now) => {
      // ✅ حماية: لو التبويب كان متوقف/lag، لا تسمح بقفزات كبيرة في فريم واحد
      const dt = Math.min(50, now - lastFrameMsRef.current);
      lastFrameMsRef.current = now;

      let idx = indexRef.current;
      let prog = progressRef.current;

      // stop at end
      if (idx >= replayPoints.length - 1) {
        setIsPlaying(false);
        return;
      }

      const baseDur = segmentDurationsMs[idx] || 500;
      const effDur = Math.max(16, baseDur / Math.max(1, speedRef.current));
      prog += dt / effDur;

      let idxChanged = false;
      let advanced = 0;
      while (prog >= 1 && idx < replayPoints.length - 1) {
        prog -= 1;
        idx += 1;
        idxChanged = true;
        advanced += 1;
        // ✅ حماية إضافية: لا تتخطى عدد كبير من القطع في فريم واحد (يسبب خلل دوران/قفزات)
        if (advanced > 20) {
          prog = 0;
          break;
        }
        if (idx >= replayPoints.length - 1) break;
      }

      indexRef.current = idx;
      progressRef.current = prog;

      if (idx >= replayPoints.length - 1) {
        setCurrentIndex(replayPoints.length - 1);
        setRenderPosition({
          lat: replayPoints[replayPoints.length - 1].latitude,
          lng: replayPoints[replayPoints.length - 1].longitude,
        });
        setIsPlaying(false);
        return;
      }

      if (idxChanged) setCurrentIndex(idx);

      const a = replayPoints[idx];
      const b = replayPoints[idx + 1];
      const t = Math.max(0, Math.min(1, prog));
      const pos = {
        lat: a.latitude + (b.latitude - a.latitude) * t,
        lng: a.longitude + (b.longitude - a.longitude) * t,
      };

      const targetBear = bearingDeg(
        a.latitude,
        a.longitude,
        b.latitude,
        b.longitude,
      );
      const nextDir = lerpAngle(renderDirRef.current, targetBear, 0.2);
      renderDirRef.current = nextDir;

      setRenderPosition(pos);
      setRenderDirection(nextDir);

      // follow logic
      const map = mapRefRef.current;
      if (map) {
        const bounds = map.getBounds?.();
        if (bounds) {
          const carLatLng = new window.google.maps.LatLng(pos.lat, pos.lng);
          if (!bounds.contains(carLatLng)) {
            const tNow = Date.now();
            const recentlyInteracted =
              tNow - lastUserMapInteractionAtRef.current < 1500;

            // ✅ شرطك: لو العربية خرجت من الشاشة -> لازم نرجّع التمركز عليها
            // نحترم تفاعل المستخدم لفترة قصيرة، وبعدها نرجع التمركز تلقائيًا.
            if (!recentlyInteracted || followRef.current) {
              if (tNow - lastPanToRef.current > 200) {
                lastPanToRef.current = tNow;
                map.panTo(carLatLng);
              }
              if (!followRef.current) {
                followRef.current = true;
                setFollowCar(true);
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isPlaying, replayPoints, segmentDurationsMs]);

  const handleTogglePlay = () => {
    if (replayPoints.length > 0 && currentIndex === replayPoints.length - 1) {
      indexRef.current = 0;
      progressRef.current = 0;
      setCurrentIndex(0);
      setRenderPosition({
        lat: replayPoints[0].latitude,
        lng: replayPoints[0].longitude,
      });
    }
    setIsPlaying((prev) => !prev);
  };

  const handleIndexChange = (idx) => {
    if (!replayPoints.length) return;
    const nextIdx = Math.max(0, Math.min(replayPoints.length - 1, idx));
    indexRef.current = nextIdx;
    progressRef.current = 0;
    setCurrentIndex(nextIdx);
    setRenderPosition({
      lat: replayPoints[nextIdx].latitude,
      lng: replayPoints[nextIdx].longitude,
    });

    const next = replayPoints[nextIdx + 1] || replayPoints[nextIdx];
    const b = bearingDeg(
      replayPoints[nextIdx].latitude,
      replayPoints[nextIdx].longitude,
      next.latitude,
      next.longitude,
    );
    renderDirRef.current = b;
    setRenderDirection(b);
  };

  const handleRecenter = () => {
    const map = mapRefRef.current;
    if (!map || !renderPosition) return;
    setFollowCar(true);
    const carLatLng = new window.google.maps.LatLng(
      renderPosition.lat,
      renderPosition.lng,
    );
    map.panTo(carLatLng);
  };

  const handleUserMapInteraction = () => {
    lastUserMapInteractionAtRef.current = Date.now();
    setFollowCar(false);
  };

  const getReplayCarColor = useCallback((speedValue) => {
    const s = Number(speedValue) || 0;
    return s > 1 ? "#22c55e" : "#3b82f6";
  }, []);

  const MAX_PARKING_MARKERS = 200;

  // ✅ Polylines حسب اللون (بنفس نقاط التشغيل) لتفادي اختلاف المسار
  const polylineSegments = useMemo(() => {
    if (replayPoints.length === 0) return { green: [], yellow: [], red: [] };
    return buildPolylineSegmentsByColor(replayPoints, speedLimits);
  }, [replayPoints, speedLimits]);

  // ✅ تحسين: نقاط الوقوف بدون نسخ كل points + مع حد أقصى
  const parkingMarkers = useMemo(() => {
    if (replayPoints.length === 0) return [];
    const markers = [];
    let inStop = false;
    let stopStartIdx = -1;

    for (let i = 1; i < replayPoints.length - 1; i++) {
      const p = replayPoints[i];
      const isStop = Number(p.speed) === 0;
      if (isStop && !inStop) {
        inStop = true;
        stopStartIdx = i;
      } else if (!isStop && inStop) {
        // نهاية الوقوف: خذ نقطة وسطية لتمثيل الوقوف
        const mid = Math.floor((stopStartIdx + i - 1) / 2);
        markers.push({
          index: mid,
          latitude: replayPoints[mid].latitude,
          longitude: replayPoints[mid].longitude,
        });
        inStop = false;
        stopStartIdx = -1;
        if (markers.length >= MAX_PARKING_MARKERS) break;
      }
    }

    return markers;
  }, [replayPoints]);

  // ✅ تحسين: حفظ نقاط البداية والنهاية
  const startEndMarkers = useMemo(() => {
    if (replayPoints.length === 0) return null;

    return {
      start: { lat: replayPoints[0].latitude, lng: replayPoints[0].longitude },
      end: {
        lat: replayPoints[replayPoints.length - 1].latitude,
        lng: replayPoints[replayPoints.length - 1].longitude,
      },
    };
  }, [replayPoints]);

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

  const speedKmh = Math.max(0, Math.round(Number(currentPoint?.speed) || 0));

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={(map) => setMapRef(map)}
        onDragStart={handleUserMapInteraction}
        onZoomChanged={handleUserMapInteraction}
        center={initialCenter}
        zoom={replayPoints.length > 0 ? 16 : 6}
        mapTypeId={mapType}
      >
        {/* ✅ المسار الكامل - محسّن */}
        {replayPoints.length > 0 && (
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
        {replayPoints.length > 0 && renderPosition && (
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
                      {(Number(currentPoint.distance) || 0).toFixed(6)} km
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

      <ReplayFilter
        onDateChange={handleDateChange}
        serial_number={serial_number}
      />

      <div className="absolute top-[15%] right-3 z-20 space-y-2 flex flex-col items-center">
        <Link
          to={BACK_URL}
          className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100"
        >
          <CgHomeAlt className="text-xl text-gray-700" />
        </Link>
        <MapTypes onChange={setMapType} />
        <button
          type="button"
          onClick={handleRecenter}
          className={`btn btn-sm btn-circle shadow bg-white border border-gray-200 hover:bg-gray-50 ${
            followCar ? "text-mainColor" : "text-gray-600"
          }`}
          title="الانتقال لمكان السيارة"
        >
          <FaCrosshairs />
        </button>
      </div>

      {/* ✅ مؤشر السرعة */}
      {replayPoints.length > 0 && (
        <div className="absolute top-32 left-4 z-20">
          <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
            <IoMdSpeedometer className="text-mainColor" size={18} />
            <span className="font-bold text-gray-800 tabular-nums">
              {speedKmh}
            </span>
            <span className="text-xs text-gray-500">km/h</span>
            <span className="text-xs text-gray-400 border-l ps-2 ms-1">
              x{speed}
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="absolute w-full max-w-4xl bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-full px-8 py-6 flex items-center justify-center">
          <Loader />
        </div>
      ) : replayPoints.length === 0 ? (
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
          onIndexChange={handleIndexChange}
          pointsLength={replayPoints.length}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      )}
    </div>
  );
};

export default CarReplay;
