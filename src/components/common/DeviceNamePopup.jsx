const DeviceNamePopup = ({ car, showDeviceName }) => {
  return (
    <div
      className={`bg-white text-black text-sm py-1 px-2 rounded-lg shadow-lg w-max 
      absolute top-[calc(100%+5px)] left-1/2 translate-x-[-50%] whitespace-nowrap ${
        showDeviceName ? "scale-100 opacity-100" : "scale-0 opacity-0"
      } transition-all duration-500 ease-in-out origin-top`}
      onClick={(e) => e.stopPropagation()}
    >
      {car.name || "بدون اسم"}

      <span className="absolute bg-white w-2 h-2 rotate-45 -top-1 left-1/2 translate-x-[-50%]" />
    </div>
  );
};

export default DeviceNamePopup;
