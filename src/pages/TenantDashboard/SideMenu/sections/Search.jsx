import { useState, useMemo } from "react";
import { IoSearchOutline } from "react-icons/io5";

const Search = ({ cars, handleSelectCar }) => {
  const [searchKey, setSearchKey] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // const searchTypes = ["device", "driver", "group"];
  // const [searchType, setSearchType] = useState("device");

  // فلترة العربيات حسب الاسم أو رقم الشريحة
  const filteredCars = useMemo(() => {
    if (!searchKey.trim()) return [];
    return cars.filter(
      (car) =>
        car.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
        car.sim_number?.toLowerCase().includes(searchKey.toLowerCase())
    );
  }, [cars, searchKey]);

  return (
    <div className="relative w-full max-w-md">
      {/* مربع البحث */}
      <div className="flex items-center rounded-xl bg-mainColor/10 p-1">
        {/* <DropdownMenu.Root>
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
        </DropdownMenu.Root> */}

        <input
          type="text"
          placeholder="Search ..."
          value={searchKey}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // تأخير بسيط علشان يقدر يضغط على النتيجة
          onChange={(e) => setSearchKey(e.target.value)}
          className="flex-1 px-2 py-1 border-none outline-none bg-transparent placeholder:text-gray-400 text-sm"
        />
        <span className="text-xl text-mainColor p-2 cursor-pointer">
          <IoSearchOutline />
        </span>
      </div>

      {/* قائمة النتائج */}
      {isFocused && filteredCars.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              onClick={() => handleSelectCar(car, true)}
              className="p-2 hover:bg-mainColor/10 cursor-pointer flex justify-between items-center gap-2 text-xs"
            >
              <span className="text-gray-700 font-medium">{car.name}</span>
              <span className="text-gray-500">{car.sim_number}</span>
            </div>
          ))}
        </div>
      )}

      {/* في حالة مفيش نتائج */}
      {isFocused && searchKey && filteredCars.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-center text-sm text-gray-500 z-50">
          No results found
        </div>
      )}
    </div>
  );
};

export default Search;
