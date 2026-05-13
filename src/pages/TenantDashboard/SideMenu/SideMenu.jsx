import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa";
import Search from "./sections/Search";
import Filters from "./sections/Filters";
import CarsList from "./sections/CarsList";
import Actions from "./sections/Actions";
import { useTranslation } from "react-i18next";

const SideMenu = ({
  cars,
  carsByBranch,
  filteredCars,
  handleSelectCar,
  selectedCarId,
  selectionTrigger,
  isFetching,
  activeFilter,
  setActiveFilter,
  branches,
  activeBranchId,
  setActiveBranchId,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* 🔹 زر إظهار السايدبار */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 left-4 bg-white text-mainColor p-1 rounded-r-full shadow-md shadow-mainColor z-50 
        cursor-pointer hover:brightness-90 transition-all duration-500 ease-in-out ${
          !isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <FaAngleRight size={25} />
      </button>

      {/* 🔹 السايدبار */}
      <aside
        className={`fixed top-0 h-screen w-full max-w-[400px] left-0 p-3 z-50 transition-all duration-500 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="bg-white h-full w-full rounded-2xl shadow-xl p-4 flex flex-col space-y-3 relative overflow-hidden">
          {/* زر الإغلاق */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-fit ms-auto p-1 cursor-pointer rounded-full bg-mainColor text-white hover:brightness-90 transition"
          >
            <IoMdClose size={22} />
          </button>

          <Search
            cars={carsByBranch ?? cars}
            handleSelectCar={handleSelectCar}
          />

          {/* الفروع */}
          <div className="w-full">
            <select
              className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-mainColor"
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
            >
              <option value="">{t("sideMenu.allBranches")}</option>
              {(branches || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* الفلاتر */}
          <Filters
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            cars={carsByBranch ?? cars}
          />

          <Actions />

          {/* 🟢 عرض النتائج */}
          <CarsList
            cars={filteredCars}
            handleSelectCar={handleSelectCar}
            selectedCarId={selectedCarId}
            selectionTrigger={selectionTrigger}
            isFetching={isFetching}
          />
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
