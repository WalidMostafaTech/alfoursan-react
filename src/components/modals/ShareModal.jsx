import { useState } from "react";
import { useDispatch } from "react-redux";
import { closeShareModal } from "../../store/modalsSlice";
import MainInput from "../form/MainInput";

const ShareModal = () => {
  const [hours, setHours] = useState("15");
  const dispatch = useDispatch();

  const shareLink = "JQhODc4YzMxIjwidGFmnjIion0";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const closeModal = () => {
    dispatch(closeShareModal());
  };

  // قائمه الاوامر
  const commands = [
    { label: "استعلام الموقع" },
    { label: "قطع الزيت والكهرباء" },
    { label: "إعادة الزيت والكهرباء" },
    { label: "استعلام الحالة" },
    { label: "فتح الباب" },
    { label: "إغلاق الباب" },
  ];

  return (
    <dialog open className="modal detailsModal">
      <div className="modal-box max-w-md" dir="rtl">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="btn btn-sm btn-circle btn-ghost absolute left-4 top-4"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg text-center mb-6">
          مشاركة رابط التتبع
        </h3>

        <div className="space-y-6">
          {/* مدة صلاحية الرابط */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">مدة صلاحية الرابط</span>
            </label>
            <div className="flex gap-2">
              <MainInput
                type="select"
                options={[
                  { value: "hours", label: "ساعات" },
                  { value: "minutes", label: "دقايق" },
                  { value: "days", label: "أيام" },
                ]}
              />

              <div className="flex-1">
                <MainInput
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* الخواص */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium mb-1">الأوامر</span>
            </label>

            <div className="border border-base-300 rounded-lg p-3 bg-base-100 flex flex-col gap-2 max-h-40 overflow-y-auto">
              {commands.map((command, index) => (
                <label key={index} className="label">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="text-gray-700">{command.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* الرابط */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium mb-1">الرابط</span>
            </label>
            <div className="join w-full">
              <div className="flex-1">
                <MainInput type="text" value={shareLink} readOnly />
              </div>
              <button onClick={copyToClipboard} className="btn join-item">
                نسخ
              </button>
              <button className="btn btn-primary join-item">فتح</button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="modal-action justify-center gap-3">
          <button onClick={closeModal} className="btn btn-outline px-8">
            إلغاء
          </button>
          <button className="btn btn-primary px-8">إرسال</button>
        </div>
      </div>
      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default ShareModal;
