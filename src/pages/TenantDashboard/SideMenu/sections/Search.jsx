import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";

const Search = ({ onSearch }) => {
  const searchTypes = ["device", "driver", "group"];
  const [searchType, setSearchType] = useState("device");
  const [searchKey, setSearchKey] = useState("");

  const handleSearch = () => {
    if (searchKey.trim() !== "") {
      onSearch(searchType, searchKey); // 🟢 نبعت القيم للـ Dashboard
    } else {
      onSearch("", ""); // ترجع كل العربيات
    }
  };

  return (
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
  );
};

export default Search;
