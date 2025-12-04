import { FaHeadset } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toggleSupportModal } from "../../store/modalsSlice";

const SupportBtn = () => {
  const dispatch = useDispatch();
  return (
    <div
      onClick={() => dispatch(toggleSupportModal())}
      className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100"
    >
      <FaHeadset className="text-xl text-gray-700" />
    </div>
  );
};

export default SupportBtn;
