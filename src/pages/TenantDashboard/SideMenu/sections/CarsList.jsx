import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  openDetailsModal,
  openPolygonMenu,
  openShareModal,
} from "../../../../store/modalsSlice";
import { useDispatch } from "react-redux";
import Loader from "../../../../components/Loading/Loader";
import { getCarStatus } from "../../../../utils/getCarStatus";
import { Link } from "react-router-dom";

const CarsList = ({ handleSelectCar, selectedCarId, cars, isFetching }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col gap-2 overflow-y-auto flex-1">
      {isFetching && <Loader />}

      {cars.map((car) => (
        <div
          key={car.id}
          className="relative flex items-center gap-2 hover:bg-gray-400/10 rounded-lg"
          style={{
            color: car.speed > 5 ? "green" : car.speed === 0 ? "red" : "blue",
            backgroundColor: car.id === selectedCarId && "rgba(0, 0, 255, 0.1)",
          }}
        >
          <div
            onClick={() => handleSelectCar(car, true)}
            className="flex items-center justify-between gap-4 flex-1 p-2 text-sm cursor-pointer"
          >
            <span className="flex-1 line-clamp-1">{car.name}</span>
            <span>{getCarStatus(car)}</span>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <span className="cursor-pointer text-gray-600 hover:text-mainColor p-2">
                <BsThreeDotsVertical />
              </span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white shadow-xl rounded-lg p-2 flex flex-col z-50 radix-dropdown"
                sideOffset={5}
                align="start"
              >
                <DropdownMenu.Item
                  className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                  onSelect={() =>
                    dispatch(openDetailsModal({ section: "", id: car.id }))
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
                  <Link
                    to={`/car-replay/${car.serial_number}`}
                    target="_blank"
                    className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor"
                  >
                    Playback
                  </Link>
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
                  onSelect={() => dispatch(openPolygonMenu())}
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
                  onClick={() => dispatch(openShareModal(car.serial_number))}
                >
                  Share
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      ))}
    </div>
  );
};

export default CarsList;
