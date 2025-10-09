import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { getCarStatus } from "../../../utils/getCarStatus";
import Loader from "../../../components/Loading/Loader";
import { openDetailsModal } from "../../../store/detailsModalSlice";
import { useDispatch } from "react-redux";

const SideMenu = ({
  cars,
  handleSelectCar,
  selectedCarId,
  onSearch,
  isFetching,
}) => {
  const searchTypes = ["device", "driver", "group"];
  const [searchType, setSearchType] = useState("device");
  const [searchKey, setSearchKey] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch();

  const handleSearch = () => {
    if (searchKey.trim() !== "") {
      onSearch(searchType, searchKey); // 🟢 نبعت القيم للـ Dashboard
    } else {
      onSearch("", ""); // ترجع كل العربيات
    }
  };

  const filteredCars = cars.filter((car) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "online") return !car.isOffline;
    if (activeFilter === "offline") return car.isOffline;
    return true;
  });

  const filterTypes = [
    { label: "all", value: cars?.length || 0 },
    { label: "online", value: cars?.filter((c) => !c.isOffline).length || 0 },
    { label: "offline", value: cars?.filter((c) => c.isOffline).length || 0 },
  ];

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

          {/* 🔽 اختيار نوع السيرش */}
          <div className="flex items-center rounded-xl bg-mainColor/10 p-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <p className="flex items-center gap-1 text-lg cursor-pointer text-mainColor capitalize">
                  {searchType} <MdKeyboardArrowDown />
                </p>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-white shadow-lg rounded-lg p-2 flex flex-col gap-1 z-50"
                  side="bottom"
                  align="start"
                  sideOffset={5}
                >
                  {searchTypes.map((type) => (
                    <DropdownMenu.Item
                      key={type}
                      className={`cursor-pointer text-lg rounded px-2 py-1 ${
                        searchType === type
                          ? "bg-mainColor text-white"
                          : "text-gray-600 hover:text-mainColor hover:bg-mainColor/10"
                      }`}
                      onSelect={() => setSearchType(type)}
                    >
                      {type}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* 🟢 input */}
            <input
              type="text"
              placeholder="name/IMEI"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="flex-1 px-2 py-1 border-none outline-none text-lg bg-transparent placeholder:text-gray-400"
            />

            {/* زر السيرش */}
            <span
              className="text-2xl text-mainColor p-2 cursor-pointer"
              onClick={handleSearch}
            >
              <IoSearchOutline />
            </span>
          </div>

          {/* الفلاتر */}
          <div className="bg-mainColor/10 p-2 rounded-xl flex gap-2">
            {filterTypes.map((type, index) => (
              <button
                key={index}
                onClick={() => setActiveFilter(type.label)}
                className={`p-2 flex-1 text-lg rounded-lg capitalize cursor-pointer ${
                  activeFilter === type.label
                    ? "bg-mainColor text-white"
                    : "text-gray-600 hover:bg-mainColor/10 hover:text-mainColor"
                }`}
              >
                {type.label} ({type.value})
              </button>
            ))}
          </div>

          {/* 🟢 عرض النتائج */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1">
            {isFetching && <Loader />}

            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="relative flex items-center gap-2 p-2 hover:bg-gray-400/10 rounded-lg"
                style={{
                  color:
                    car.speed > 5 ? "green" : car.speed === 0 ? "red" : "blue",
                  backgroundColor:
                    car.id === selectedCarId && "rgba(0, 0, 255, 0.1)",
                }}
              >
                <div
                  onClick={() => handleSelectCar(car, true)}
                  className="flex items-center justify-between gap-2 flex-1"
                >
                  <span className="cursor-pointer flex-1 text-sm line-clamp-1">
                    {car.name}
                  </span>
                  <span className="cursor-pointer text-sm">
                    {getCarStatus(car)}
                  </span>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <span className="cursor-pointer text-gray-600 hover:text-mainColor">
                      <BsThreeDotsVertical />
                    </span>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="bg-white shadow-xl rounded-lg p-2 flex flex-col z-50"
                      sideOffset={5}
                      align="start"
                    >
                      <DropdownMenu.Item
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        onSelect={() =>
                          dispatch(
                            openDetailsModal({ section: "", id: car.id })
                          )
                        }
                      >
                        Details
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <a
                          href={car.tracking_url}
                          target="_blank"
                          className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        >
                          Tracking
                        </a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <a
                          href={car.replay_url}
                          target="_blank"
                          className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        >
                          Playback
                        </a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        onSelect={() =>
                          dispatch(
                            openDetailsModal({ section: "command", id: car.id })
                          )
                        }
                      >
                        Command
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        onSelect={() => window.showFenceModal()}
                      >
                        Fence
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
                          target="_blank"
                          className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        >
                          Street View
                        </a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <a
                          href={car.report_url}
                          target="_blank"
                          className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        >
                          Reports
                        </a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        onSelect={() =>
                          window.openShareModal(car.id, car.serial_number)
                        }
                      >
                        Share
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
