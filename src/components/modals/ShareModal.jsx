import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { closeShareModal } from "../../store/modalsSlice";
import { createShareLink } from "../../services/monitorServices";
import MainInput from "../form/MainInput";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-toastify";

// ✅ Schema التحقق
const shareSchema = z.object({
  unit: z.enum(["hours", "minutes", "days"], {
    required_error: "اختار نوع المدة",
  }),
  duration: z
    .string()
    .min(1, "أدخل رقم")
    .refine((val) => Number(val) > 0, "القيمة يجب أن تكون أكبر من صفر"),
  selectedCommands: z.array(z.string()).min(1, "يجب اختيار أمر واحد على الأقل"),
});

const ShareModal = () => {
  const dispatch = useDispatch();
  const { shareModal } = useSelector((state) => state.modals);
  const { imei } = shareModal || null;
  const [shareLink, setShareLink] = useState("");

  // 🧠 أوامر متاحة
  const commands = [
    { label: "استعلام الموقع", value: "WHERE#" },
    { label: "قطع الزيت والكهرباء", value: "RELAY,1#" },
    { label: "إعادة الزيت والكهرباء", value: "RELAY,0#" },
    { label: "استعلام الحالة", value: "STATUS#" },
    { label: "فتح الباب", value: "CTRDOOR,1#" },
    { label: "إغلاق الباب", value: "CTRDOOR,0#" },
  ];

  // 🧠 أنواع المدة
  const unitTypes = [
    { value: "hours", label: "ساعات" },
    { value: "minutes", label: "دقايق" },
    { value: "days", label: "أيام" },
  ];

  // 🎯 React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      unit: "hours",
      duration: "",
      selectedCommands: [],
    },
  });

  const selectedCommands = watch("selectedCommands");

  // 📡 React Query Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createShareLink,
    onSuccess: (data) => {
      setShareLink(data?.link);
      toast.success("✅ تم إنشاء الرابط بنجاح!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  // 📤 عند الإرسال
  const onSubmit = (values) => {
    if (!imei) return toast.error("لا يوجد IMEI محدد");

    const payload = {
      imei,
      duration: values.duration,
      unit: values.unit,
    };

    // ✅ بناء الـ commands بالشكل المطلوب
    values.selectedCommands.forEach((cmd, index) => {
      payload[`commands[${index}]`] = cmd;
    });

    console.log("🚀 payload:", payload);
    mutate(payload);
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  const closeModal = () => dispatch(closeShareModal());

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* مدة صلاحية الرابط */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">مدة صلاحية الرابط</span>
            </label>
            <div className="flex gap-2">
              <MainInput
                type="select"
                {...register("unit")}
                options={unitTypes}
              />

              <div className="flex-1">
                <MainInput type="number" {...register("duration")} />
              </div>
            </div>
            {errors.duration && (
              <p className="text-error text-sm mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* الأوامر */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium mb-1">الأوامر</span>
            </label>
            <div className="border border-base-300 rounded-lg p-3 bg-base-100 flex flex-col gap-2 max-h-40 overflow-y-auto">
              {commands.map((command, index) => (
                <label key={index} className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={selectedCommands.includes(command.value)}
                    onChange={(e) => {
                      const newCommands = e.target.checked
                        ? [...selectedCommands, command.value]
                        : selectedCommands.filter((c) => c !== command.value);
                      setValue("selectedCommands", newCommands);
                    }}
                  />
                  <span className="text-gray-700">{command.label}</span>
                </label>
              ))}
            </div>
            {errors.selectedCommands && (
              <p className="text-error text-sm mt-1">
                {errors.selectedCommands.message}
              </p>
            )}
          </div>

          {/* الرابط بعد النجاح */}
          {shareLink && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium mb-1">الرابط</span>
              </label>
              <div className="join w-full">
                <div className="flex-1">
                  <MainInput type="text" value={shareLink} readOnly />
                </div>
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  type="button"
                  className="btn join-item"
                >
                  نسخ
                </button>
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary join-item"
                >
                  فتح
                </a>
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="modal-action justify-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-outline px-8"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary px-8"
              disabled={isPending}
            >
              {isPending ? "جاري الإرسال..." : "إرسال"}
            </button>
          </div>
        </form>
      </div>

      <label className="modal-backdrop" onClick={closeModal}></label>
    </dialog>
  );
};

export default ShareModal;
