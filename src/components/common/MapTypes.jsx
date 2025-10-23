import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MdLayers } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setMapType } from "../../store/mapSlice";

const MapTypes = () => {
  const dispatch = useDispatch();
  const { mapType } = useSelector((state) => state.map);

  const mapTypes = [
    { label: "خريطة عادية", value: "roadmap" },
    { label: "قمر صناعي", value: "satellite" },
    { label: "تضاريس", value: "terrain" },
    { label: "هجين", value: "hybrid" },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100">
          <MdLayers className="text-2xl text-gray-700" />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white shadow-xl rounded-lg p-2 flex flex-col gap-2 z-50"
          side="left"
          align="start"
          sideOffset={5}
        >
          {mapTypes.map((type) => (
            <DropdownMenu.Item
              key={type.value}
              className={`px-3 py-1 rounded cursor-pointer ${
                mapType === type.value
                  ? "bg-mainColor text-white"
                  : "hover:bg-mainColor/10 hover:text-mainColor"
              }`}
              onSelect={() => dispatch(setMapType(type.value))}
            >
              {type.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default MapTypes;
