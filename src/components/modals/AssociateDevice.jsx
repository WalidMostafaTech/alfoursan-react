import { useState } from "react";
import { useDispatch } from "react-redux";
import { closeAssociateDeviceModal } from "../../store/modalsSlice";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import MainInput from "../form/MainInput";

const AssociateDevice = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevices, setSelectedDevices] = useState([]);

  const devices = [
    {
      id: 1,
      device: "R12L-F-755318",
      imei: "353994714755318",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
    {
      id: 2,
      device: "R12L-F-755292",
      imei: "353994714755292",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
    {
      id: 3,
      device: "R12L-F-754907",
      imei: "353994714754907",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
    {
      id: 4,
      device: "R12L-F-753727",
      imei: "353994714753727",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
    {
      id: 5,
      device: "R12L-F-753370",
      imei: "353994714753370",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
    {
      id: 6,
      device: "R12L-F-753354",
      imei: "353994714753354",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
    {
      id: 7,
      device: "R12L-F-753644",
      imei: "353994714753644",
      model: "R12L-F",
      status: "غير مرتبط",
      membership: "الفرسان",
    },
  ];

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
    <dialog open className="modal detailsModal">
      <div className="modal-box max-w-5xl p-0" dir="rtl">
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
            <div className="flex items-center gap-2">
              <label className="font-medium">العميل:</label>

              <div className="w-40">
                <MainInput
                  type="select"
                  options={[{ label: "الكل", value: "all" }]}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">الجهاز:</label>

              <div className="w-40">
                <MainInput
                  type="select"
                  options={[{ label: "IMEI", value: "IMEI" }]}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">الحالة:</label>

              <div className="w-40">
                <MainInput
                  type="select"
                  options={[{ label: "الكل", value: "all" }]}
                />
              </div>
            </div>

            <button className="btn btn-primary mr-auto">
              <IoSearchOutline size={18} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-gray-300 bg-white">
          <div className="flex gap-2">
            <button className="btn btn-primary">ربط مجموعة</button>
            <button className="btn btn-outline">إلغاء مجموعة</button>
          </div>
          <div className="text-gray-600">
            الأجهزة: <span className="font-semibold">1203</span> مرتبط بالفعل:
            {" "}
            <span className="font-semibold">0</span> غير مرتبط:{""}
            <span className="font-semibold">1203</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
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
                      className="checkbox checkbox-sm"
                      checked={selectedDevices.includes(device.id)}
                      onChange={() => handleSelectDevice(device.id)}
                    />
                  </td>
                  <td className="text-blue-600">{device.device}</td>
                  <td>{device.imei}</td>
                  <td>{device.model}</td>
                  <td>
                    <span className="badge badge-sm badge-ghost">
                      {device.status}
                    </span>
                  </td>
                  <td>{device.membership}</td>
                  <td>
                    <button className="text-blue-600 hover:underline ">
                      ربط
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-300 flex items-center justify-between">
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
        </div>
      </div>
      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default AssociateDevice;
