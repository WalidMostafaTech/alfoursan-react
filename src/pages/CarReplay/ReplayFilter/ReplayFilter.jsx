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

    // استدعاء الدالة القادمة من CarReplay
    onDateChange(from, to);
  };

  return (
    <header className="absolute w-screen top-0 left-0 bg-white shadow-lg rounded-b-4xl p-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <div className="flex items-center gap-1">
          <label className="text-sm" htmlFor="from">From:</label>
          <MainInput
            id="from"
            type="date"
            value={from}
            max={today}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          <label className="text-sm" htmlFor="to">To:</label>
          <MainInput
            id="to"
            type="date"
            value={to}
            max={today}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

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
