import { FaPlay, FaPause } from "react-icons/fa";

const ReplayControls = ({
  isPlaying,
  onTogglePlay,
  currentIndex,
  onIndexChange,
  pointsLength,
  speed,
  onSpeedChange,
}) => {
  return (
    <div className="absolute w-[90%] max-w-4xl bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-full px-8 py-4 flex items-center gap-4">
      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        className="text-mainColor text-xl cursor-pointer"
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      {/* Range Slider */}
      <input
        type="range"
        min="0"
        max={pointsLength - 1}
        value={currentIndex}
        onChange={(e) => onIndexChange(Number(e.target.value))}
        className="w-full accent-mainColor"
      />

      {/* Speed Selector */}
      <select
        value={speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="border-none outline-0 p-2 cursor-pointer text-sm"
      >
        <option value={1}>x1</option>
        <option value={2}>x2</option>
        <option value={5}>x5</option>
        <option value={10}>x10</option>
      </select>
    </div>
  );
};

export default ReplayControls;
