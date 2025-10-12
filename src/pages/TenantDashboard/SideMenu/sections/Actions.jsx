import { useDispatch, useSelector } from "react-redux";
import { toggleClusters } from "../../../../store/mapSlice";
import { TbSteeringWheel } from "react-icons/tb";
import { MdOutlineTitle } from "react-icons/md";

const Actions = () => {
  const { clusters } = useSelector((state) => state.map);
  const dispatch = useDispatch();

  return (
    <div className="flex justify-end gap-2">
      <span
        title="Device Name"
        onClick={() => dispatch(toggleClusters())}
        className={`cursor-pointer text-2xl transition w-8 h-8 rounded-full flex items-center justify-center ${
          clusters ? "bg-mainColor text-white" : "bg-mainColor/10"
        } `}
      >
        <MdOutlineTitle />
      </span>

      <span
        title="Cluster"
        onClick={() => dispatch(toggleClusters())}
        className={`cursor-pointer text-2xl transition w-8 h-8 rounded-full flex items-center justify-center ${
          clusters ? "bg-mainColor text-white" : "bg-mainColor/10"
        } `}
      >
        <TbSteeringWheel />
      </span>
    </div>
  );
};

export default Actions;
