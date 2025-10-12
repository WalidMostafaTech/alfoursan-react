import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FiMap } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { switchMap } from "../../store/mapSlice";

const MapSwitcher = () => {
  const dispatch = useDispatch();
  const { provider: mapProvider } = useSelector((state) => state.map);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100">
          <FiMap className="text-2xl text-gray-700" />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white shadow-xl rounded-lg p-2 flex flex-col gap-2 z-50"
          side="left"
          align="start"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className={`px-3 py-1 rounded cursor-pointer ${
              mapProvider === "google"
                ? "bg-mainColor text-white"
                : "hover:bg-mainColor/10 hover:text-mainColor"
            }`}
            onSelect={() => dispatch(switchMap("google"))}
          >
            Google Maps
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={`px-3 py-1 rounded cursor-pointer ${
              mapProvider === "mapbox"
                ? "bg-mainColor text-white"
                : "hover:bg-mainColor/10 hover:text-mainColor"
            }`}
            onSelect={() => dispatch(switchMap("mapbox"))}
          >
            Mapbox
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default MapSwitcher;
