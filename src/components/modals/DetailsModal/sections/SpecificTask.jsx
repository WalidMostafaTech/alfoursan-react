import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import FormBtn from "../../../../components/form/FormBtn";
import MainInput from "../../../../components/form/MainInput";
import { sendScheduledTask } from "../../../../services/monitorServices";

const SpecificTask = ({ deviceSettings, refetch, deviceID }) => {
  const scheduledTask = deviceSettings?.scheduled_task;

  const [executionType, setExecutionType] = useState("everyday");
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    is_enabled: 1,
    task_type: "cut_off_engine",
  });

  // helper: يحول "16:54:00" أو "16:54" -> "16:54"
  const formatToHourMinute = (time) => {
    if (!time && time !== "") return "";
    // لو الوقت بالفعل مثل "16:54:00" أو "16:54"
    const parts = String(time).split(":");
    if (parts.length >= 2) {
      const hh = parts[0].padStart(2, "0");
      const mm = parts[1].padStart(2, "0");
      return `${hh}:${mm}`;
    }
    return String(time);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // ناخد الجزء قبل الـ T
  };

  // ✅ تحميل البيانات الافتراضية من scheduledTask
  useEffect(() => {
    if (scheduledTask) {
      setExecutionType(scheduledTask.execution_type || "everyday");
      setFormData({
        // ✅ نحول التاريخ للصيغة اللي يقبلها input[type=date]
        start_date: formatDate(scheduledTask.start_date),
        end_date: formatDate(scheduledTask.end_date),

        // ✅ نحول الوقت لصيغة HH:mm
        start_time: formatToHourMinute(scheduledTask.start_time || ""),
        end_time: formatToHourMinute(scheduledTask.end_time || ""),

        is_enabled: scheduledTask.is_enabled ? 1 : 0,
        task_type: scheduledTask.task_type || "cut_off_engine",
      });
    }
  }, [scheduledTask]);

  // ✅ Mutation لإرسال المهمة المجدولة
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => sendScheduledTask(deviceID, data),
    onSuccess: () => {
      toast.success("تم إرسال المهمة بنجاح ✅");
      refetch?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
      console.error(error);
    },
  });

  // ✅ التعامل مع تغيّر القيم
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // ✅ التعامل مع نوع التنفيذ (يوميًا / نطاق التاريخ)
  const handleExecutionTypeChange = (type) => {
    setExecutionType(type);
    if (type === "everyday") {
      setFormData((prev) => ({ ...prev, start_date: "", end_date: "" }));
    }
  };

  // ✅ عند الإرسال
  const handleSubmit = (e) => {
    e.preventDefault();

    // تحقق بسيط: لو اختيار نطاق تاريخ لازم تواريخ موجودة
    if (executionType === "date_range") {
      if (!formData.start_date || !formData.end_date) {
        toast.warn("يرجى تحديد تاريخ البداية و تاريخ النهاية لنطاق التاريخ.");
        return;
      }
    }

    // تحقق أن الأوقات موجودة وصحيحة (اختياري، حسب متطلباتك)
    if (!formData.start_time) {
      toast.warn("يرجى تحديد وقت البداية.");
      return;
    }
    if (!formData.end_time) {
      toast.warn("يرجى تحديد وقت النهاية.");
      return;
    }

    const payload = {
      execution_type: executionType,
      task_type: formData.task_type,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      // نزيل الثواني إن وجدت، ونضمن HH:mm
      start_time: formatToHourMinute(formData.start_time),
      end_time: formatToHourMinute(formData.end_time),
      is_enabled: formData.is_enabled === 1 ? 1 : 0,
    };

    mutate(payload);
  };

  return (
    <section dir="rtl" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MainInput
          id="deviceName"
          label="اسم الجهاز"
          value={deviceSettings?.device?.name || ""}
          disabled
        />
        <MainInput id="type" label="نوع" value="إيقاف المحرك" disabled />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* ✅ نوع التنفيذ */}
          <div className="form-control w-full max-w-xs" dir="rtl">
            <label className="label">
              <span className="label-text text-sm font-semibold text-gray-700">
                نوع التنفيذ
              </span>
            </label>

            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="execution_type"
                  className="radio radio-primary radio-sm"
                  checked={executionType === "everyday"}
                  onChange={() => handleExecutionTypeChange("everyday")}
                />
                <span className="text-gray-700 font-medium text-sm">يوميًا</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="execution_type"
                  className="radio radio-primary radio-sm"
                  checked={executionType === "date_range"}
                  onChange={() => handleExecutionTypeChange("date_range")}
                />
                <span className="text-gray-700 font-medium text-sm">نطاق التاريخ</span>
              </label>
            </div>
          </div>

          {/* ✅ تفعيل المهمة */}
          <div>
            <label className="flex items-center gap-2 mt-6">
              <span className="text-gray-700 font-medium text-sm">تفعيل المهمة :</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                id="is_enabled"
                checked={formData.is_enabled === 1}
                onChange={handleChange}
              />
            </label>
          </div>

          {/* ✅ حقول التاريخ (تظهر فقط عند نطاق التاريخ) */}
          {executionType === "date_range" && (
            <>
              <MainInput
                id="start_date"
                type="date"
                label="تاريخ البداية"
                value={formData.start_date}
                onChange={handleChange}
              />
              <MainInput
                id="end_date"
                type="date"
                label="تاريخ النهاية"
                value={formData.end_date}
                onChange={handleChange}
              />
            </>
          )}

          <MainInput
            id="start_time"
            type="time"
            label="من"
            value={formData.start_time}
            onChange={handleChange}
          />
          <MainInput
            id="end_time"
            type="time"
            label="إلى"
            value={formData.end_time}
            onChange={handleChange}
          />
        </div>

        <FormBtn title={"تأكيد"} variant="success" disabled={isPending} />
      </form>
    </section>
  );
};

export default SpecificTask;
