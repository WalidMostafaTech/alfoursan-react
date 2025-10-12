import { useState } from "react";
import MainInput from "../../../components/form/MainInput";

export default function GeofenceModal({ isOpen, onClose, onConfirm }) {
  const radius = 100;
  const [enter, setEnter] = useState(true);
  const [exit, setExit] = useState(true);
  const [speedLimitEnabled, setSpeedLimitEnabled] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(100);

  const handleConfirm = () => {
    onConfirm({ name, radius, enter, exit, speedLimitEnabled, speedLimit });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">إعدادات السياج الجغرافي</h2>
          <button className="text-gray-500" onClick={onClose}>
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
          <button className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
