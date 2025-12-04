import { useState } from "react";
import { FaPlay } from "react-icons/fa";
import MainInput from "../../../components/form/MainInput";
import { toast } from "react-toastify";

const ReplayFilter = ({ onDateChange }) => {
  const today = new Date().toISOString().split("T")[0];

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
    setFrom(y);
    setTo(y);
    onDateChange(y, y);
  };

  const setToday = () => {
    setFrom(today);
    setTo(today);
    onDateChange(today, today);
  };

  const setThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek); // بداية الأسبوع

    const weekStart = start.toISOString().split("T")[0];
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

    const lastWeekStart = start.toISOString().split("T")[0];
    const lastWeekEnd = end.toISOString().split("T")[0];

    setFrom(lastWeekStart);
    setTo(lastWeekEnd);
    onDateChange(lastWeekStart, lastWeekEnd);
  };

  return (
    <header className="absolute w-screen top-0 left-0 bg-white shadow-lg rounded-b-4xl p-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <div className="flex items-center gap-1">
          <label className="text-sm" htmlFor="from">
            From:
          </label>
          <MainInput
            id="from"
            type="date"
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
            type="date"
            value={to}
            max={today}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        {/* الاختصارات */}
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

        <button
          type="submit"
          className="btn btn-sm btn-primary bg-mainColor border-mainColor"
          title="Search"
        >
          <FaPlay />
        </button>
      </form>

      <p className="text-stone-600 mt-2 text-center text-xs">
        The maximum time range cannot exceed one month
      </p>
    </header>
  );
};

export default ReplayFilter;
