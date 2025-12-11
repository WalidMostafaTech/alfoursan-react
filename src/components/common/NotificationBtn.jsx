import { useDispatch, useSelector } from "react-redux";
import { toggleNotificationSound } from "../../store/mapSlice";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

const NotificationBtn = () => {
  const { notificationSound } = useSelector((state) => state.map);
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => dispatch(toggleNotificationSound())}
      className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100"
    >
      {notificationSound ? (
        <HiVolumeUp className="text-xl text-green-600" />
      ) : (
        <HiVolumeOff className="text-xl text-red-600" />
      )}
    </div>
  );
};

export default NotificationBtn;
