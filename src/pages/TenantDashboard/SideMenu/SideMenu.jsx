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
  activeFilter,
  setActiveFilter,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* 🔹 زر إظهار السايدبار */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 left-4 bg-white text-mainColor p-2 rounded-r-full shadow-md shadow-mainColor z-50 
        cursor-pointer hover:brightness-90 transition-all duration-500 ease-in-out ${
          !isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <FaAngleRight size={30} />
      </button>

      {/* 🔹 السايدبار */}
      <aside
        className={`fixed top-0 h-screen w-full max-w-[450px] left-0 p-4 z-50 transition-all duration-500 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="bg-white h-full w-full rounded-2xl shadow-xl p-4 flex flex-col space-y-4 relative">
          {/* زر الإغلاق */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-fit ms-auto p-1 cursor-pointer rounded-full bg-mainColor text-white hover:brightness-90 transition"
          >
            <IoMdClose size={28} />
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
            cars={cars}
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
