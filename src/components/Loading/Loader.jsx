const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex gap-2">
        <span className="w-4 h-4 bg-mainColor rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-4 h-4 bg-mainColor rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-4 h-4 bg-mainColor rounded-full animate-bounce"></span>
      </div>

      <h2 className="text-xl font-semibold text-mainColor mt-6 tracking-wide animate-pulse">
        Loading...
      </h2>
    </div>
  );
};

export default Loader;
