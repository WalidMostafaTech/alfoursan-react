const Filters = ({ cars, activeFilter, setActiveFilter }) => {
  const filterTypes = [
    { label: "all", value: cars?.length || 0 },
    { label: "online", value: cars?.filter((c) => !c.isOffline).length || 0 },
    { label: "offline", value: cars?.filter((c) => c.isOffline).length || 0 },
  ];

  return (
    <div className="bg-mainColor/10 p-2 rounded-xl flex gap-2">
      {filterTypes.map((type, index) => (
        <button
          key={index}
          onClick={() => setActiveFilter(type.label)}
          className={`p-1 flex-1 text-base rounded-lg capitalize cursor-pointer ${
            activeFilter === type.label
              ? "bg-mainColor text-white"
              : "text-gray-600 hover:bg-mainColor/10 hover:text-mainColor"
          }`}
        >
          {type.label} ({type.value})
        </button>
      ))}
    </div>
  );
};

export default Filters;
