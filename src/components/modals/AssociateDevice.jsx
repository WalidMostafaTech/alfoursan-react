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
import { useTranslation } from "react-i18next";

const AssociateDevice = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { associateDeviceModal } = useSelector((state) => state.modals);

  // ✅ قيم الـ inputs (بتتغير مع كل كتابة أو تغيير select)
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ القيم اللي بتتبعت للـ API بس لما تضغط زرار البحث
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    q: "",
  });

  const [selectedDevices, setSelectedDevices] = useState([]);
  const [page, setPage] = useState(1);

  // ✅ امسح الـ selectedDevices لما تتغير الصفحة
  useEffect(() => {
    setSelectedDevices([]);
  }, [page]);

  const {
    data: fenceDevices = {},
    isLoading,
    refetch,
  } = useQuery({
    // ✅ الـ queryKey بيتبع appliedFilters بس - مش بيتغير إلا لما تضغط البحث
    queryKey: ["fenceDevices", associateDeviceModal.id, appliedFilters, page],
    queryFn: () =>
      getFenceDevices(
        associateDeviceModal.id,
        appliedFilters.status,
        appliedFilters.q,
        page,
      ),
    enabled: !!associateDeviceModal.id,
  });

  const devices = fenceDevices?.items || [];
  const pagination = fenceDevices?.pagination || {};

  const { mutate: addDevices, isPending: isAdding } = useMutation({
    mutationFn: () =>
      addDeviceToFence(associateDeviceModal.id, selectedDevices),
    onSuccess: () => {
      toast.success(t("associateDevice.attachSuccess"));
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
      toast.success(t("associateDevice.deleteSuccess"));
      refetch();
      setSelectedDevices([]);
    },
    onError: (error) => {
      console.error("خطاء في حذف الأجهزة:", error);
      toast.error(error?.response?.data?.message);
    },
  });

  // ✅ بيتحقق من الـ membership ويعمل attach أو detach بناءً عليه
  const handleToggleDevice = async (device) => {
    try {
      if (device.membership === "attached") {
        await removeDeviceFromFence(associateDeviceModal.id, [device.id]);
        toast.success(t("associateDevice.deleteSuccess"));
      } else {
        await addDeviceToFence(associateDeviceModal.id, [device.id]);
        toast.success(t("associateDevice.attachDeviceSuccess"));
      }
      refetch();
    } catch (error) {
      console.error("Error toggling device:", error);
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
        : [...prev, deviceId],
    );
  };

  // ✅ مش بيتحدد لو devices فاضي
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDevices(devices.map((d) => d.id));
    } else {
      setSelectedDevices([]);
    }
  };

  // ✅ زرار البحث هو اللي بيطبق الفلتر بس
  const handleApplyFilters = () => {
    setAppliedFilters({ status, q: searchQuery });
    setPage(1);
  };

  const getPages = () => {
    if (!pagination?.last_page) return [];

    const current = page;
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
      <div className="modal-box max-w-5xl p-0 mt-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
          <h3 className="text-lg font-semibold">
            {t("associateDevice.title")}
          </h3>
          <button
            onClick={closeModal}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <IoCloseOutline size={28} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">
                {t("associateDevice.client")}:
              </label>
              <div className="flex-1">
                <MainInput
                  type="select"
                  options={[{ label: t("associateDevice.all"), value: "all" }]}
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">
                {t("associateDevice.device")}:
              </label>
              <div className="flex-1">
                <MainInput
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  placeholder="IMEI"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">
                {t("associateDevice.status")}:
              </label>
              <div className="flex-1">
                <MainInput
                  type="select"
                  options={[
                    { label: t("associateDevice.all"), value: "all" },
                    { label: t("associateDevice.attached"), value: "attached" },
                    {
                      label: t("associateDevice.notAttached"),
                      value: "not_attached",
                    },
                  ]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </div>
            </div>

            {/* ✅ بس الزرار ده اللي بيبعت للـ API */}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleApplyFilters}
            >
              {t("associateDevice.filter")}
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
                  {isAdding
                    ? t("associateDevice.attaching")
                    : t("associateDevice.attachGroup")}
                </button>

                <button
                  onClick={() => removeDevices()}
                  className={`btn btn-error btn-sm text-white bg-red-800 border-red-800 ${
                    selectedDevices.length === 0 || isRemoving
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={selectedDevices.length === 0 || isRemoving}
                >
                  {isRemoving
                    ? t("associateDevice.deleting")
                    : t("associateDevice.deleteGroup")}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[40vh]">
              <table className="table text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-12">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={
                          devices.length > 0 &&
                          selectedDevices.length === devices.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>{t("associateDevice.deviceName")}</th>
                    <th>IMEI</th>
                    <th>{t("associateDevice.model")}</th>
                    <th>{t("associateDevice.status")}</th>
                    <th>{t("associateDevice.membership")}</th>
                    <th>{t("associateDevice.operations")}</th>
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
                            className={`font-bold hover:underline cursor-pointer ${
                              device.membership === "attached"
                                ? "text-red-600"
                                : "text-mainColor"
                            }`}
                            onClick={() => handleToggleDevice(device)}
                          >
                            {device.membership === "attached"
                              ? t("associateDevice.detach")
                              : t("associateDevice.attach")}
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
                        {t("associateDevice.noDevices")}
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
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <MdNavigateBefore size={20} />
                </button>

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
                  ),
                )}

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
                {t("associateDevice.total")} :{" "}
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
