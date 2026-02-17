import { useState } from "react";
import MainInput from "../../../components/form/MainInput";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDevicesForCarReplay } from "../../../services/monitorServices";
import { IoChevronDown } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";

const ReplayFilter = ({ onDateChange, serial_number }) => {
  const now = new Date();
  const today = now.toISOString().slice(0, 16);

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const handleSubmit = (e) => {
    e.preventDefault();

    const diffDays =
      (new Date(to).getTime() - new Date(from).getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      toast.warning(" يجب أن يكون تاريخ النهاية بعد تاريخ البداية");
      return;
    }

    if (diffDays > 30) {
      toast.warning(" لا يمكن اختيار أكثر من 30 يومًا");
      return;
    }

    onDateChange(from, to);
  };

  // دوال اختصارات التواريخ
  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().split("T")[0];
    const from = `${y}T00:00`;
    const to = `${y}T23:59`;
    setFrom(from);
    setTo(to);
    onDateChange(from, to);
  };

  const setToday = () => {
    const t = new Date().toISOString().split("T")[0];
    const from = `${t}T00:00`;
    const to = today; // اللي عرّفته فوق بالـ slice(0, 16)
    setFrom(from);
    setTo(to);
    onDateChange(from, to);
  };

  const setThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);

    const weekStart = `${start.toISOString().split("T")[0]}T00:00`;
    const weekEnd = today;

    setFrom(weekStart);
    setTo(weekEnd);
    onDateChange(weekStart, weekEnd);
  };

  const setLastWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();

    const end = new Date(now);
    end.setDate(now.getDate() - dayOfWeek - 1);

    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const lastWeekStart = `${start.toISOString().split("T")[0]}T00:00`;
    const lastWeekEnd = `${end.toISOString().split("T")[0]}T23:59`;

    setFrom(lastWeekStart);
    setTo(lastWeekEnd);
    onDateChange(lastWeekStart, lastWeekEnd);
  };

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices-for-car-replay"],
    queryFn: getDevicesForCarReplay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredDevices =
    devices?.filter((device) =>
      device.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const navigate = useNavigate();

  return (
    <header className="absolute w-screen top-0 left-0 bg-white shadow-lg rounded-b-4xl p-3 space-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <div className="flex items-center gap-1 relative">
          <label className="text-sm">Device:</label>

          <div className={`dropdown ${isOpen ? "dropdown-open" : ""}`}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm bg-white border border-gray-300 min-w-[180px] justify-between flex items-center"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>
                {devices?.find((d) => d.serial_number === serial_number)
                  ?.name || "Select Device"}
              </span>

              <IoChevronDown
                className={`transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            <div
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-64"
            >
              {/* Search Input */}
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search device..."
                  className="input input-sm input-primary input-bordered w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Devices List */}
              <ul className="max-h-60 overflow-y-auto">
                {isLoading && (
                  <li className="px-3 py-2 text-sm text-gray-400">
                    جاري التحميل...
                  </li>
                )}

                {!isLoading && filteredDevices.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-400">
                    لا يوجد نتائج
                  </li>
                )}

                {filteredDevices.map((device) => (
                  <li key={device.serial_number}>
                    <button
                      className="text-left w-full"
                      onClick={() => {
                        navigate(`/car-replay/${device.serial_number}`);
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      {device.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <label className="text-sm" htmlFor="from">
            From:
          </label>

          <MainInput
            id="from"
            type="datetime-local"
            value={from}
            max={today}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          <label className="text-sm" htmlFor="to">
            To:
          </label>

          <MainInput
            id="to"
            type="datetime-local"
            value={to}
            max={today}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-circle btn-md btn-primary bg-mainColor border-mainColor"
          title="Search"
        >
          <IoMdSearch className="text-2xl" />
        </button>
      </form>

      {/* الاختصارات */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={setYesterday}
          className="text-mainColor cursor-pointer hover:underline"
        >
          Yesterday
        </button>

        <button
          type="button"
          onClick={setToday}
          className="text-mainColor cursor-pointer hover:underline"
        >
          Today
        </button>

        <button
          type="button"
          onClick={setThisWeek}
          className="text-mainColor cursor-pointer hover:underline"
        >
          This Week
        </button>

        <button
          type="button"
          onClick={setLastWeek}
          className="text-mainColor cursor-pointer hover:underline"
        >
          Last Week
        </button>

        <p className="text-stone-600 text-center text-xs">
          The maximum time range cannot exceed one month
        </p>
      </div>
    </header>
  );
};

export default ReplayFilter;
