const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-white p-4">
      <div className="flex gap-2">
        <span className="w-3 h-3 bg-mainColor rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3 h-3 bg-mainColor rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3 h-3 bg-mainColor rounded-full animate-bounce"></span>
      </div>

      <h2 className="font-semibold text-mainColor tracking-wide animate-pulse">
        Loading...
      </h2>
    </div>
  );
};

export default Loader;
