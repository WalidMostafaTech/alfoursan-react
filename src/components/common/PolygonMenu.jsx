import { useState } from "react";
import { FaDrawPolygon, FaCircle, FaSearch } from "react-icons/fa";
import { PiPolygon } from "react-icons/pi";
import { MdDelete, MdContentCopy, MdEdit } from "react-icons/md";
import MainInput from "../form/MainInput";

const PolygonMenu = () => {
  const [drawType, setDrawType] = useState("");
  const fences = [
    { id: 1, name: "test (1)" },
    { id: 2, name: "bateekh (1)" },
    { id: 3, name: "test (1)" },
    { id: 4, name: "منطقة العمل (3)" },
  ];

  const handleSelect = (type) => {
    setDrawType(type);

    // نرسل حدث للعالم الخارجي
    const event = new CustomEvent("start-drawing", { detail: { type } });
    window.dispatchEvent(event);
  };

  return (
    <div className="dropdown dropdown-left">
      <div
        tabIndex={0}
        role="button"
        className="bg-white shadow rounded p-2 cursor-pointer hover:bg-gray-100"
      >
        <PiPolygon className="text-2xl text-gray-700" />
      </div>

      <div
        tabIndex={0}
        className="dropdown-content bg-white shadow-xl rounded-xl w-[330px] p-4 z-[50] space-y-4"
      >
        <h3 className="font-semibold text-lg">Geo-Fence Management</h3>

        {/* Draw Fence */}
        <div className="flex items-center gap-2">
          <label className="font-medium">Draw Fence:</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelect("circle")}
              className={`btn btn-sm ${
                drawType === "circle" ? "btn-primary text-white" : "btn-outline"
              }`}
            >
              <FaCircle className="text-xl" />
            </button>
            <button
              onClick={() => handleSelect("polygon")}
              className={`btn btn-sm ${
                drawType === "polygon"
                  ? "btn-primary text-white"
                  : "btn-outline"
              }`}
            >
              <FaDrawPolygon className="text-xl" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-1">
          <div className="flex-1">
            <MainInput placeholder="Search by name" />
          </div>
          <span className="bg-mainColor text-white p-3 rounded-md cursor-pointer hover:bg-mainColor/80 content-center">
            <FaSearch />
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between text-sm text-mainColor mb-2">
          <button className="hover:underline">Show All</button>
          <div className="flex gap-3">
            <button className="hover:underline">Batch Delete</button>
            <button className="hover:underline">Bulk Copy</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-60rounded-md">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" className="checkbox checkbox-sm" />
                </th>
                <th>Name</th>
                <th>Operate</th>
              </tr>
            </thead>
            <tbody>
              {fences.map((fence) => (
                <tr key={fence.id}>
                  <td>
                    <input type="checkbox" className="checkbox checkbox-sm" />
                  </td>
                  <td>{fence.name}</td>
                  <td className="flex gap-2">
                    <MdEdit className="text-lg cursor-pointer text-mainColor hover:text-mainColor" />
                    <MdContentCopy className="text-lg cursor-pointer text-gray-500 hover:text-gray-700" />
                    <MdDelete className="text-lg cursor-pointer text-red-500 hover:text-red-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PolygonMenu;
