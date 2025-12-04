import { useDispatch, useSelector } from "react-redux";
import { toggleClusters, toggleDeviceName } from "../../../../store/mapSlice";
import { MdOutlineTitle } from "react-icons/md";
import { PiCirclesThreeFill } from "react-icons/pi";

const Actions = () => {
  const { clusters, showDeviceName } = useSelector((state) => state.map);
  const dispatch = useDispatch();

  return (
    <div className="flex justify-end gap-2">
      <span
        title="Device Name"
        onClick={() => dispatch(toggleDeviceName())}
        className={`cursor-pointer text-xl transition w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
          showDeviceName
            ? "bg-mainColor text-white"
            : "bg-mainColor/10 text-gray-600"
        } `}
      >
        <MdOutlineTitle />
      </span>

      <span
        title="Cluster"
        onClick={() => dispatch(toggleClusters())}
        className={`cursor-pointer text-xl transition w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
          clusters ? "bg-mainColor text-white" : "bg-mainColor/10 text-gray-600"
        } `}
      >
        <PiCirclesThreeFill />
      </span>
    </div>
  );
};

export default Actions;
