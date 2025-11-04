import { FaPlay } from "react-icons/fa";
import MainInput from "../../../components/form/MainInput";

const ReplayFilter = () => {
  return (
    <header className="absolute w-screen top-0 left-0 bg-white shadow-lg rounded-b-4xl p-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center justify-center gap-4"
      >
        <div className="flex items-center gap-1">
          <label>From :</label>
          <MainInput type="date" />
        </div>

        <div className="flex items-center gap-1">
          <label>To :</label>
          <MainInput type="date" />
        </div>

        <button
          className="btn btn-primary bg-mainColor border-mainColor text-lg"
          title="Search"
        >
          <FaPlay />
        </button>
      </form>

      <p className="text-stone-600 mt-2 text-center">
        The maximum time range cannot exceed one month
      </p>
    </header>
  );
};

export default ReplayFilter;
