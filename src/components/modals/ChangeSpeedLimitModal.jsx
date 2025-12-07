import { useState } from "react";

const ChangeSpeedLimitModal = ({ closeModal, speedLimits, setSpeedLimits }) => {
  const [mode, setMode] = useState("custom"); // default | custom

  const list = [
    { color: "var(--color-mainGreen)", min: 0, max: speedLimits.p1 },
    {
      color: "var(--color-mainYellow)",
      min: speedLimits.p1,
      max: speedLimits.p2,
    },
    { color: "var(--color-mainRed)", min: speedLimits.p2, max: 180 },
  ];

  return (
    <dialog open className="modal detailsModal">
      <div className="modal-box max-w-2xl max-h-[90%] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-200">
          <h3 className="font-bold text-lg text-mainColor">Speed Settings</h3>
          <button
            className="btn btn-md btn-circle btn-ghost"
            onClick={closeModal}
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-4">
          <p className="font-semibold">Trace Color:</p>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "default"}
                onChange={() => setMode("default")}
              />
              <span>Default</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
              />
              <span>Customized</span>
            </label>
          </div>
        </div>

        {/* Slider */}
        <div className="flex gap-4">
          <p className="font-semibold">Trace Color:</p>

          <div className="flex-1">
            {mode === "custom" ? (
              <div className="w-full px-4">
                <div className="w-full p-2 rounded-lg bg-gray-100 relative">
                  {/* Gradient Bar */}
                  <div
                    className="relative w-full h-3 rounded-full"
                    style={{
                      background: `linear-gradient(to right,
                      #1dbf73 0% ${(speedLimits.p1 / speedLimits.max) * 100}%,
                      #ffd700 ${(speedLimits.p1 / speedLimits.max) * 100}% ${
                        (speedLimits.p2 / speedLimits.max) * 100
                      }%,
                      #ff0000 ${
                        (speedLimits.p2 / speedLimits.max) * 100
                      }% 100%)`,
                    }}
                  ></div>

                  {/* P1 (الصغير) */}
                  <input
                    type="range"
                    min="0"
                    max={speedLimits.max}
                    value={speedLimits.p1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < speedLimits.p2)
                        setSpeedLimits((prev) => ({ ...prev, p1: val }));
                    }}
                    className="dual-range thumb-green top-1"
                    style={{ zIndex: 20 }}
                  />

                  {/* P2 (الكبير) */}
                  <input
                    type="range"
                    min="0"
                    max={speedLimits.max}
                    value={speedLimits.p2}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > speedLimits.p1)
                        setSpeedLimits((prev) => ({ ...prev, p2: val }));
                    }}
                    className="dual-range thumb-yellow top-1"
                    style={{ zIndex: 30 }}
                  />

                  {/* Labels */}
                  <div className="flex justify-between mt-2 text-sm px-2">
                    <span>0 km/h</span>
                    <span>{speedLimits.p1} km/h</span>
                    <span>{speedLimits.p2} km/h</span>
                    <span>{speedLimits.max} km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex gap-4">
                {list.map((speed) => (
                  <div className="flex-1 text-center flex flex-col gap-2 bg-gray-100 p-2 rounded-lg">
                    <span
                      style={{ backgroundColor: speed.color }}
                      className="h-2 w-full rounded"
                    />
                    <p className="font-semibold text-sm items-center">{`${speed.min} - ${speed.max} km/h`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={closeModal}>
            Confirm
          </button>
        </div>
      </div>

      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default ChangeSpeedLimitModal;
