import { useState } from "react";
import { useDispatch } from "react-redux";
import { closeGeoFenceModal } from "../../store/modalsSlice";
import MainInput from "../form/MainInput";

const GeoFenceModal = () => {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [enter, setEnter] = useState(true);
  const [exit, setExit] = useState(true);
  const [speedLimitEnabled, setSpeedLimitEnabled] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(100);
  const radius = 100;

  const handleConfirm = () => {
    console.log({
      name,
      radius,
      enter,
      exit,
      speedLimitEnabled,
      speedLimit,
    });
    dispatch(closeGeoFenceModal());
  };

  const closeModal = () => {
    dispatch(closeGeoFenceModal());
  };

  return (
    <dialog open className="modal detailsModal" dir="rtl">
      <div className="modal-box max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">إعدادات السياج الجغرافي</h2>
          <button className="text-gray-500" onClick={closeModal}>
            ✕
          </button>
        </div>

        <MainInput id="name" label="اسم السياج" placeholder="اسم السياج" />

        <label className="block">نصف القطر: {radius} م</label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={enter}
              onChange={() => setEnter(!enter)}
            />
            الدخول
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={exit}
              onChange={() => setExit(!exit)}
            />
            الخروج
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={speedLimitEnabled}
            onChange={() => setSpeedLimitEnabled(!speedLimitEnabled)}
          />
          تفعيل حد السرعة
        </label>

        {speedLimitEnabled && (
          <MainInput type="number" id="speedLimit" placeholder={"5-1000"} />
        )}

        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={closeModal}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            تأكيد
          </button>
        </div>
      </div>
      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default GeoFenceModal;
