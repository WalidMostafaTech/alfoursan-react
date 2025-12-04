import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeAssociateDeviceModal } from "../../store/modalsSlice";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import MainInput from "../form/MainInput";
import {
  addDeviceToFence,
  getFenceDevices,
  removeDeviceFromFence,
} from "../../services/fencesServices";
import Loader from "../Loading/Loader";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

const AssociateDevice = () => {
  const dispatch = useDispatch();

  const { associateDeviceModal } = useSelector((state) => state.modals);

  const [status, setStatus] = useState("all");
  const [searchStatus, setSearchStatus] = useState("all");

  // const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevices, setSelectedDevices] = useState([]);

  const {
    data: fenceDevices = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fenceDevices", associateDeviceModal.id, searchStatus],
    queryFn: () => getFenceDevices(associateDeviceModal.id, searchStatus),
    enabled: !!associateDeviceModal.id, // يشتغل بس لما الـ id يبقى موجود
  });

  const devices = fenceDevices?.data?.items;

  const { mutate: addDevices, isPending: isAdding } = useMutation({
    mutationFn: () =>
      addDeviceToFence(associateDeviceModal.id, selectedDevices),
    onSuccess: () => {
      toast.success("تم ربط الأجهزة بنجاح ✅");
      refetch();
      setSelectedDevices([]);
    },
    onError: (error) => {
      console.error("خطأ أثناء الربط:", error);
      toast.error(error?.response?.data?.message);
    },
  });

  const { mutate: removeDevices, isPending: isRemoving } = useMutation({
    mutationFn: () =>
      removeDeviceFromFence(associateDeviceModal.id, selectedDevices),
    onSuccess: () => {
      toast.success("تم حذف الأجهزة بنجاح ✅");
      refetch();
      setSelectedDevices([]);
    },
    onError: (error) => {
      console.error("خطاء في حذف الأجهزة:", error);
      toast.error(error?.response?.data?.message);
    },
  });

  const handleAttachDevice = async (deviceId) => {
    try {
      await addDeviceToFence(associateDeviceModal.id, [deviceId]);
      toast.success("تم ربط الجهاز بنجاح ✅");
      refetch();
    } catch (error) {
      console.error("Error attaching device:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const closeModal = () => {
    dispatch(closeAssociateDeviceModal());
  };

  const handleSelectDevice = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDevices(devices.map((d) => d.id));
    } else {
      setSelectedDevices([]);
    }
  };

  return (
    <dialog open className="modal items-start detailsModal">
      <div className="modal-box max-w-5xl p-0 mt-10" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold">ربط الأجهزة</h3>
          <button
            onClick={closeModal}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            <IoCloseOutline size={28} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">العميل:</label>

              <div className="w-40">
                <MainInput
                  type="select"
                  options={[{ label: "الكل", value: "all" }]}
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">الجهاز:</label>

              <div className="w-40">
                <MainInput
                  type="select"
                  options={[{ label: "IMEI", value: "IMEI" }]}
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">الحالة:</label>

              <div className="w-40">
                <MainInput
                  type="select"
                  options={[
                    { label: "الكل", value: "all" },
                    { label: "مرتبط", value: "attached" },
                    { label: "غير مرتبط", value: "not_attached" },
                  ]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm mr-auto"
              onClick={() => setSearchStatus(status)}
            >
              <IoSearchOutline size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* Action Buttons */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-gray-300 bg-white">
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={selectedDevices.length === 0 || isAdding}
                  onClick={() => addDevices()}
                >
                  {isAdding ? "جارٍ الربط..." : "ربط مجموعة"}
                </button>

                <button
                  onClick={() => removeDevices()}
                  className="btn btn-error btn-sm "
                  disabled={selectedDevices.length === 0 || isRemoving}
                >
                  {isRemoving ? "جارٍ الحذف..." : "حذف مجموعة"}
                </button>
              </div>

              {/* <div className="text-gray-600">
                الأجهزة: <span className="font-semibold">1203</span> مرتبط
                بالفعل: <span className="font-semibold">0</span> غير مرتبط:{""}
                <span className="font-semibold">1203</span>
              </div> */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-12">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={selectedDevices.length === devices.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>الجهاز</th>
                    <th>IMEI</th>
                    <th>الموديل</th>
                    <th>الحالة</th>
                    <th>العضوية</th>
                    <th>العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.id} className="hover">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => handleSelectDevice(device.id)}
                        />
                      </td>
                      <td className="text-mainColor font-bold">
                        {device.name || "-"}
                      </td>
                      <td>{device.serial_number || "-"}</td>
                      <td>{device.model || "-"}</td>
                      <td>
                        <span className="badge badge-sm badge-ghost">
                          {device.status || "-"}
                        </span>
                      </td>
                      <td>{device.membership || "-"}</td>
                      <td>
                        <button
                          className="text-mainColor font-bold hover:underline cursor-pointer"
                          onClick={() => handleAttachDevice(device.id)}
                        >
                          ربط
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {/* <div className="px-6 py-4 border-t border-gray-300 flex items-center justify-between">
              <div className="text-gray-600">
                الإجمالي 1203
                <select className="select select-sm select-bordered mx-2 w-24">
                  <option>10/صفحة</option>
                  <option>20/صفحة</option>
                  <option>50/صفحة</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button className="btn btn-sm btn-ghost">
                  <MdNavigateNext size={20} />
                </button>
                <button className="btn btn-sm btn-primary">1</button>
                <button className="btn btn-sm btn-ghost">2</button>
                <button className="btn btn-sm btn-ghost">3</button>
                <button className="btn btn-sm btn-ghost">4</button>
                <button className="btn btn-sm btn-ghost">5</button>
                <button className="btn btn-sm btn-ghost">6</button>
                <span className="px-2">...</span>
                <button className="btn btn-sm btn-ghost">121</button>
                <button className="btn btn-sm btn-ghost">
                  <MdNavigateBefore size={20} />
                </button>

                <div className="flex items-center gap-2 mr-4">
                  <span className="">الذهاب إلى</span>
                  <input
                    type="number"
                    className="input input-sm input-bordered w-16"
                    defaultValue="1"
                  />
                </div>
              </div>
            </div> */}
          </>
        )}
      </div>
      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default AssociateDevice;
