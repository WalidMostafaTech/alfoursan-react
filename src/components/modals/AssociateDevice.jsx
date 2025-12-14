import { useEffect, useState } from "react";
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

  const [selectedDevices, setSelectedDevices] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchStatus(searchQuery); // هعمل trigger للـ useQuery
      setPage(1); // رجع الصفحة لـ 1 كل مرة فيه بحث جديد
    }, 500); // بعد 500ms من آخر كتابة

    return () => clearTimeout(delay); // تنظيف الـ timeout لو المستخدم كتب تاني
  }, [searchQuery]);

  const {
    data: fenceDevices = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fenceDevices", associateDeviceModal.id, searchStatus, page],
    queryFn: () =>
      getFenceDevices(associateDeviceModal.id, status, searchStatus, page),
    enabled: !!associateDeviceModal.id,
  });

  const devices = fenceDevices?.items || [];
  const pagination = fenceDevices?.pagination || {};

  const { mutate: addDevices, isPending: isAdding } = useMutation({
    mutationFn: () =>
      addDeviceToFence(associateDeviceModal.id, selectedDevices),
    onSuccess: () => {
      toast.success("تم ربط الأجهزة بنجاح");
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
      toast.success("تم حذف الأجهزة بنجاح");
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
      toast.success("تم ربط الجهاز بنجاح");
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

  const getPages = () => {
    if (!pagination?.last_page) return [];

    const current = page; // ✅ بدل pagination.current_page
    const last = pagination.last_page;
    const pages = [];

    if (last <= 7) {
      for (let i = 1; i <= last; i++) pages.push(i);
      return pages;
    }

    const start = Math.max(2, current - 2);
    const end = Math.min(last - 1, current + 2);

    pages.push(1);

    if (start > 2) pages.push("left-dots");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < last - 1) pages.push("right-dots");

    pages.push(last);

    return pages;
  };

  return (
    <dialog open className="modal items-start detailsModal">
      <div className="modal-box max-w-5xl p-0 mt-10" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold">ربط الأجهزة</h3>
          <button
            onClick={closeModal}
            className="btn btn-sm btn-circle btn-ghost"
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
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="IMEI"
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
          <div className="w-full h-[400px] flex items-center justify-center">
            <Loader />
          </div>
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
                  {devices.length > 0 ? (
                    devices.map((device) => (
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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center text-lg font-medium bg-mainColor/20"
                      >
                        لا يوجد اجهزة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="px-6 py-4 border-t border-gray-300 flex items-center justify-center gap-4"
              dir="ltr"
            >
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <MdNavigateBefore size={20} />
                </button>

                {/* Page Numbers */}
                {getPages().map((p) =>
                  typeof p === "string" ? (
                    <span key={p} className="px-2 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`btn btn-sm ${
                        p === page ? "btn-primary" : "btn-ghost"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={page === pagination.last_page}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.last_page, p + 1))
                  }
                >
                  <MdNavigateNext size={20} />
                </button>
              </div>

              <div className="text-black">
                الكل :{" "}
                <span className="font-bold text-mainColor">
                  {pagination?.total}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default AssociateDevice;
