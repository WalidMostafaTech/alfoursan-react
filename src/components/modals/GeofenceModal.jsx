import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeGeoFenceModal } from "../../store/modalsSlice";
import MainInput from "../form/MainInput";
import { useMutation } from "@tanstack/react-query";
import {
  addFences,
  copyFence,
  updateFence,
} from "../../services/fencesServices";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const GeoFenceModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { geoFenceModal } = useSelector((state) => state.modals);
  const { fenceData, mission } = geoFenceModal;

  const [formData, setFormData] = useState({
    name: fenceData.name || "",
    notify_on_enter: fenceData.notify_on_enter || false,
    notify_on_exit: fenceData.notify_on_exit || false,
    speed_limit_enabled: fenceData.speed_limit_enabled || false,
    speed_limit: fenceData.speed_limit || "",
    radius: fenceData.radius || "",
  });

  // ✅ Mutation ديناميكية حسب المهمة
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload) => {
      if (mission === "add") return await addFences(payload);
      if (mission === "copy") return await copyFence(fenceData.id, payload); // ✅ copy = addFence ببيانات من Fence موجود
      if (mission === "edit") return await updateFence(fenceData.id, payload);
    },
    onSuccess: () => {
      const message =
        mission === "edit"
          ? t("geofenceModal.editSuccess")
          : mission === "copy"
          ? t("geofenceModal.copySuccess")
          : t("geofenceModal.addSuccess");

      toast.success(message);
      closeModal();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error?.response?.data?.message);
    },
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ تجهيز البيانات حسب نوع السياج
  const handleConfirm = () => {
    const basePayload = {
      name: formData.name,
      type: fenceData.type,
      notify_on_enter: formData.notify_on_enter ? 1 : 0,
      notify_on_exit: formData.notify_on_exit ? 1 : 0,
      speed_limit_enabled: formData.speed_limit_enabled ? 1 : 0,
      speed_limit: formData.speed_limit || null,
    };

    let payload = {};

    if (fenceData.type === "circle") {
      payload = {
        ...basePayload,
        latitude: fenceData.center?.lat || fenceData.latitude,
        longitude: fenceData.center?.lng || fenceData.longitude,
        radius: Number(formData.radius || fenceData.radius),
      };
    } else if (fenceData.type === "polygon") {
      const coordinates =
        fenceData.path?.map((p) => [p.lat, p.lng]) || fenceData.coordinates;
      payload = {
        ...basePayload,
        coordinates,
      };
    }

    mutate(payload);
  };

  const closeModal = () => {
    window.dispatchEvent(new Event("clear-shape"));
    dispatch(closeGeoFenceModal());
  };

  return (
    <dialog open className="modal detailsModal" >
      <div className="modal-box max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {mission === "edit"
              ? t("geofenceModal.editGeofence")
              : mission === "copy"
              ? t("geofenceModal.copyGeofence")
              : t("geofenceModal.addGeofence")}
          </h2>
        </div>

        {/* اسم السياج */}
        <MainInput
          id="name"
          label={t("geofenceModal.fenceName")}
          placeholder={t("geofenceModal.fenceNamePlaceholder")}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        {fenceData.type === "circle" && (
          <label className="block text-sm">
            {t("geofenceModal.radius")}: {" "}
            <span className="text-mainColor font-bold">
              {formData.radius || fenceData.radius}
            </span>
          </label>
        )}

        {/* الدخول والخروج */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={formData.notify_on_enter}
              onChange={() =>
                handleChange("notify_on_enter", !formData.notify_on_enter)
              }
            />
            {t("geofenceModal.enter")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={formData.notify_on_exit}
              onChange={() =>
                handleChange("notify_on_exit", !formData.notify_on_exit)
              }
            />
            {t("geofenceModal.exit")}
          </label>
        </div>

        {/* تفعيل حد السرعة */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={formData.speed_limit_enabled}
            onChange={() =>
              handleChange("speed_limit_enabled", !formData.speed_limit_enabled)
            }
          />
          {t("geofenceModal.enableSpeedLimit")}
        </label>

        {/* إدخال حد السرعة */}
        {formData.speed_limit_enabled && (
          <MainInput
            type="number"
            id="speed_limit"
            label={t("geofenceModal.speedLimit")}
            placeholder={t("geofenceModal.speedLimitPlaceholder")}
            value={formData.speed_limit}
            onChange={(e) =>
              handleChange("speed_limit", Number(e.target.value))
            }
          />
        )}

        {/* الأزرار */}
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={closeModal}>
            {t("geofenceModal.cancel")}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? t("geofenceModal.saving") : t("geofenceModal.confirm")}
          </button>
        </div>
      </div>

      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default GeoFenceModal;
