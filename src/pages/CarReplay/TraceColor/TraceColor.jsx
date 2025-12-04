import { useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import ChangeSpeedLimitModal from "../../../components/modals/ChangeSpeedLimitModal";

const TraceColor = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [speedLimits, setSpeedLimits] = useState({
    p1: 57, // الفاصل بين الأخضر والأصفر
    p2: 121, // الفاصل بين الأصفر والأحمر
    max: 180, // أقصى سرعة
  });

  return (
    <>
      <aside
        className={`fixed top-1/2 -translate-y-1/2 w-full max-w-[300px] left-0 p-3 pr-0 z-50 transition-all duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white h-full w-full rounded-2xl shadow-xl flex flex-col relative">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="absolute top-4 left-full bg-white text-mainColor p-1 rounded-r-full shadow-md shadow-mainColor"
          >
            <FaAngleRight
              size={25}
              className={`${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center justify-between p-4">
            <h3 className="text-lg font-semibold">Trace Color</h3>

            <p
              onClick={() => setOpenModal(true)}
              className="text-mainColor font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <CiEdit className="text-xl" />
              Customize
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 p-4 border-t border-gray-200">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: "#1dbf73" }}
              />
              <p>
                {0} - {speedLimits.p1} km/h
              </p>
            </div>
            <div className="flex items-center gap-2 p-4 border-t border-gray-200">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: "#FFD700" }}
              />
              <p>
                {speedLimits.p1} - {speedLimits.p2} km/h
              </p>
            </div>
            <div className="flex items-center gap-2 p-4 border-t border-gray-200">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: "#FF0000" }}
              />
              <p>
                {speedLimits.p2} - {speedLimits.max} km/h
              </p>
            </div>
          </div>
        </div>
      </aside>

      {openModal && (
        <ChangeSpeedLimitModal
          closeModal={() => setOpenModal(false)}
          speedLimits={speedLimits}
          setSpeedLimits={setSpeedLimits}
        />
      )}
    </>
  );
};

export default TraceColor;
