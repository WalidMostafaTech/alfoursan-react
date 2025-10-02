import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const SideMenu = ({ cars, handleSelectCar, selectedCarId }) => {
  const searchTypes = ["device", "driver", "group"];

  const [searchType, setSearchType] = useState("device");
  const [searchKey, setSearchKey] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // 🟢 API
  const fetchSearch = async ({ queryKey }) => {
    const [_key, { searchType, searchKey }] = queryKey;
    const { data } = await axios.post(
      "https://alfursantracking.com/api/v1/tenant/get-devices",
      {
        search_key: searchKey,
        search_type: searchType,
      }
    );
    return data.data;
  };

  const {
    data: searchResults,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["search", { searchType, searchKey }],
    queryFn: fetchSearch,
    enabled: false,
  });

  const handleSearch = () => {
    if (searchKey.trim() !== "") {
      refetch();
    }
  };

  const displayedData = searchResults?.length > 0 ? searchResults : cars;

  const filteredCars = displayedData.filter((car) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "online") return !car.isOffline;
    if (activeFilter === "offline") return car.isOffline;
    return true;
  });

  const filterTypes = [
    { label: "all", value: displayedData?.length || 0 },
    {
      label: "online",
      value: displayedData?.filter((car) => !car.isOffline).length || 0,
    },
    {
      label: "offline",
      value: displayedData?.filter((car) => car.isOffline).length || 0,
    },
  ];

  return (
    <aside className="w-96 h-[90%] absolute top-1/2 left-8 -translate-y-1/2 z-10">
      <div className="bg-white h-full w-full rounded-2xl shadow-lg p-4 flex flex-col space-y-4">
        {/* 🔽 اختيار نوع السيرش */}
        <div className="flex items-center rounded-xl bg-mainColor/10 p-2">
          <div className="relative group">
            <p className="flex items-center gap-1 text-lg cursor-pointer text-mainColor capitalize">
              {searchType} <MdKeyboardArrowDown />
            </p>
            <div className="absolute top-[calc(100%+0px)] left-0 bg-white shadow-lg rounded-lg p-2 flex-col gap-1 hidden group-hover:flex">
              {searchTypes.map((type) => (
                <p
                  key={type}
                  className="cursor-pointer text-lg text-gray-600 hover:text-mainColor hover:bg-mainColor/10 px-2"
                  onClick={() => setSearchType(type)}
                >
                  {type}
                </p>
              ))}
            </div>
          </div>

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
          {isFetching && (
            <p className="text-gray-500 text-center">جارِ البحث...</p>
          )}

          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="relative flex items-center justify-between gap-1 p-2 hover:bg-gray-400/10 rounded-lg"
              style={{
                color:
                  car.speed > 5 ? "green" : car.speed === 0 ? "red" : "blue",
                backgroundColor:
                  car.id === selectedCarId && "rgba(0, 0, 255, 0.1)",
              }}
            >
              {/* اسم العربية */}
              <span
                onClick={() => handleSelectCar(car)}
                className="cursor-pointer flex-1"
              >
                {car.name}
              </span>

              {/* Dropdown Menu من Radix */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <span className="cursor-pointer text-gray-600 hover:text-mainColor">
                    <BsThreeDotsVertical />
                  </span>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="radix-dropdown bg-white shadow-xl rounded-lg p-2 flex flex-col z-50"
                    sideOffset={5}
                    align="start"
                  >
                    <DropdownMenu.Item
                      className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                      onSelect={() => window.getSettings(car.id)}
                    >
                      Details
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <a
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        href={car.tracking_url}
                        target="_blank"
                      >
                        Tracking
                      </a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <a
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        href={car.replay_url}
                        target="_blank"
                      >
                        Playback
                      </a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                      onSelect={() => window.getSettings(car.id, "command")}
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
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        href={`https://www.google.com/maps/search/?api=1&query=${car.position.lat},${car.position.lng}`}
                        target="_blank"
                      >
                        Street View
                      </a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <a
                        className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                        href={car.report_url}
                        target="_blank"
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
  );
};

export default SideMenu;
