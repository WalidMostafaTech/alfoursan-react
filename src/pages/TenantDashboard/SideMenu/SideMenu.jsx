import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa";
import Search from "./sections/Search";
import Filters from "./sections/Filters";
import CarsList from "./sections/CarsList";
import Actions from "./sections/Actions";

const SideMenu = ({
  cars,
  handleSelectCar,
  selectedCarId,
  onSearch,
  isFetching,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(true);

  const filteredCars = cars.filter((car) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "online") return !car.isOffline;
    if (activeFilter === "offline") return car.isOffline;
    return true;
  });

  return (
    <>
      {/* 🔹 زر إظهار السايدبار */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute top-32 left-4 -translate-y-1/2 bg-mainColor text-white p-2 rounded-r-lg shadow-md z-50 
        cursor-pointer hover:bg-mainColor/90 transition-all duration-500 ease-in-out ${
          !isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <FaAngleRight size={20} />
      </button>

      {/* 🔹 السايدبار */}
      <aside
        className={`fixed top-24 left-4 z-10 transition-all duration-500 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="bg-white h-[90vh] w-96 rounded-2xl shadow-lg p-4 flex flex-col space-y-4 relative">
          {/* زر الإغلاق */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-fit ms-auto p-1 cursor-pointer rounded-lg bg-mainColor text-white hover:bg-mainColor/90 transition"
          >
            <IoMdClose size={22} />
          </button>

          <Search onSearch={onSearch} />

          {/* الفلاتر */}
          <Filters
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            cars={cars}
          />

          <Actions />

          {/* 🟢 عرض النتائج */}
          <CarsList
            filteredCars={filteredCars}
            handleSelectCar={handleSelectCar}
            selectedCarId={selectedCarId}
            isFetching={isFetching}
          />
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
