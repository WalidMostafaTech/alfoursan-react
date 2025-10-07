import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FaDrawPolygon, FaCircle } from "react-icons/fa";
import { PiPolygon } from "react-icons/pi";

const PolygonMenu = ({ onSelect }) => {
  return (
    <DropdownMenu.Root>
      {/* الزرار الرئيسي */}
      <DropdownMenu.Trigger asChild>
        <div className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100">
          <PiPolygon className="text-2xl text-gray-700" />
        </div>
      </DropdownMenu.Trigger>

      {/* المنيو */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white shadow-xl rounded-lg p-2 flex flex-col gap-2 z-50"
          side="left"
          align="start"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onSelect={() => onSelect("circle")}
            className="flex items-center gap-2 px-3 py-1 rounded cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
          >
            <FaCircle className="text-blue-600" />
            رسم دائرة
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => onSelect("polygon")}
            className="flex items-center gap-2 px-3 py-1 rounded cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
          >
            <FaDrawPolygon className="text-green-600" />
            رسم Polygon
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default PolygonMenu;
