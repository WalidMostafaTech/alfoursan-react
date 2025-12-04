import { useState } from "react";

const ChangeSpeedLimitModal = ({ closeModal, speedLimits, setSpeedLimits }) => {
  const [mode, setMode] = useState("custom"); // default | custom
  const [localLimits, setLocalLimits] = useState(speedLimits);

  const handleSliderChange = (key, value) => {
    setLocalLimits((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleConfirm = () => {
    setSpeedLimits(localLimits);
    closeModal();
  };

  return (
    <dialog open className="modal detailsModal" dir="rtl">
      <div className="modal-box max-w-2xl max-h-[90%]">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-200">
          <button
            className="btn btn-md btn-circle btn-ghost"
            onClick={closeModal}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg text-mainColor">Speed Settings</h3>
        </div>

        {/* Mode Selector */}
        <div className="mt-4">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="mode"
              checked={mode === "default"}
              onChange={() => setMode("default")}
            />
            <span>Default</span>
          </label>

          <label className="flex items-center gap-3 mt-2">
            <input
              type="radio"
              name="mode"
              checked={mode === "custom"}
              onChange={() => setMode("custom")}
            />
            <span>Customized</span>
          </label>
        </div>

        {/* Slider */}
        {mode === "custom" && (
          <div className="mt-6">
            <p className="font-semibold mb-2">Trace Color:</p>

            <div className="w-full relative pt-4">
              {/* خط الألوان */}
              <div className="h-3 rounded-full bg-linear-to-r from-green-500 via-yellow-400 to-red-600" />

              {/* النقطة الأولى */}
              <input
                type="range"
                min="0"
                max="180"
                value={localLimits.p1}
                onChange={(e) => handleSliderChange("p1", e.target.value)}
                className="range range-sm absolute top-0 w-full"
              />

              {/* النقطة الثانية */}
              <input
                type="range"
                min="0"
                max="180"
                value={localLimits.p2}
                onChange={(e) => handleSliderChange("p2", e.target.value)}
                className="range range-sm absolute top-0 w-full"
              />

              <div className="flex justify-between text-xs mt-3">
                <span>0 km/h</span>
                <span>{localLimits.p1}</span>
                <span>{localLimits.p2}</span>
                <span className="text-green-700 font-bold">180</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>

      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default ChangeSpeedLimitModal;
