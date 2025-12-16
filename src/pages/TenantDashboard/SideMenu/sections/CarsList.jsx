import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  openDetailsModal,
  openPolygonMenu,
  openShareModal,
} from "../../../../store/modalsSlice";
import { memo, useMemo } from "react";
import { useDispatch } from "react-redux";
import Loader from "../../../../components/Loading/Loader";
import { getCarStatus } from "../../../../utils/getCarStatus";
import { Link } from "react-router-dom";

const CarRow = memo(function CarRow({ car, isSelected, handleSelectCar }) {
  const dispatch = useDispatch();
  const { status, color } = useMemo(() => getCarStatus(car), [car]);

  const lat = car?.position?.lat;
  const lng = car?.position?.lng;

  return (
    <div
      className="relative flex items-center gap-1 hover:bg-gray-400/10 rounded-lg"
      style={{
        color,
        backgroundColor: isSelected && "rgba(0, 0, 255, 0.1)",
      }}
    >
      <div
        onClick={() => handleSelectCar(car, true)}
        className="flex items-center justify-between gap-4 flex-1 p-2 text-xs cursor-pointer"
      >
        <span className="flex-1 line-clamp-1">{car.name}</span>
        <span>{status}</span>
      </div>

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
              className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
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
                rel="noreferrer"
                className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
              >
                Tracking
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                to={`/car-replay/${car.serial_number}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
              >
                Playback
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
              onSelect={() =>
                dispatch(openDetailsModal({ section: "command", id: car.id }))
              }
            >
              Command
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
              onSelect={() => dispatch(openPolygonMenu())}
            >
              Fence
            </DropdownMenu.Item>
            {typeof lat === "number" && typeof lng === "number" && (
              <DropdownMenu.Item asChild>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
                >
                  Street View
                </a>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item asChild>
              <a
                href={car.report_url}
                target="_blank"
                rel="noreferrer"
                className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
              >
                Reports
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="p-1 cursor-pointer hover:bg-mainColor/10 hover:text-mainColor text-sm"
              onClick={() => dispatch(openShareModal(car.serial_number))}
            >
              Share
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
});

const CarsList = ({ handleSelectCar, selectedCarId, cars, isFetching }) => {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto flex-1">
      {isFetching && <Loader />}

      {cars.map((car) => (
        <CarRow
          key={car.id}
          car={car}
          isSelected={car.id === selectedCarId}
          handleSelectCar={handleSelectCar}
        />
      ))}
    </div>
  );
};

export default CarsList;
