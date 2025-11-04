import { useDispatch } from "react-redux";
import { toggleSupportModal } from "../../store/modalsSlice";
import { useQuery } from "@tanstack/react-query";
import { getSupport } from "../../services/monitorServices";
import Loader from "../Loading/Loader";

const SupportModal = () => {
  const dispatch = useDispatch();
  const closeModal = () => {
    dispatch(toggleSupportModal());
  };

  const { data: support, isLoading } = useQuery({
    queryKey: ["support"],
    queryFn: () => getSupport(),
  });

  return (
    <dialog open className="modal detailsModal" dir="rtl">
      <div className="modal-box max-w-2xl max-h-[90%] pt-12 mt-10 relative top-0 text-center">
        <button
          className="btn btn-md btn-circle btn-ghost absolute right-2 top-2"
          onClick={closeModal}
        >
          ✕
        </button>

        {isLoading ? (
          <Loader />
        ) : (
          <div
            className="htmlContent"
            dangerouslySetInnerHTML={{ __html: support }}
          />
        )}
      </div>

      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default SupportModal;
