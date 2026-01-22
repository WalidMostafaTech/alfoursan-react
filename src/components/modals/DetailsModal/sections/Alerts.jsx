import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import FormBtn from "../../../../components/form/FormBtn";
import { updateDialogAlert } from "../../../../services/monitorServices";

const Alerts = ({ deviceSettings, refetch }) => {
  const alerts = deviceSettings?.device;
  const deviceId = deviceSettings?.device?.id;

  const [formData, setFormData] = useState({});

  useEffect(() => {
    // نحفظ القيم الحالية في الـ state عند تحميل البيانات
    setFormData({
      alert_speed_limit: alerts.alert_speed_limit || 0,
      alert_speed_limit_value: alerts.alert_speed_limit_value || "",
      alert_offline: alerts.alert_offline || 0,
      alert_restricted_driving: alerts.alert_restricted_driving || 0,
      alert_low_voltage: alerts.alert_low_voltage || 0,
      alert_rest_threshold: alerts.alert_rest_threshold || 0,
      alert_idle_speed: alerts.alert_idle_speed || 0,
      alert_fatigue_driving: alerts.alert_fatigue_driving || 0,
      alert_acc_off: alerts.alert_acc_off || 0,
      alert_acc_on: alerts.alert_acc_on || 0,
      alert_offline_judgment: alerts.alert_offline_judgment || 0,
    });
  }, [alerts]);

  const alertsList = [
    { label: "تنبيه حد السرعة", key: "alert_speed_limit" },
    { label: "تنبيه انقطاع الاتصال", key: "alert_offline" },
    { label: "تحذير القيادة المتهورة", key: "alert_restricted_driving" },
    { label: "تنبيه الجهد المنخفض", key: "alert_low_voltage" },
    { label: "عتبة الراحة", key: "alert_rest_threshold" },
    { label: "Idle Speed alert", key: "alert_idle_speed" },
    { label: "تنبيه القيادة بسبب التعب", key: "alert_fatigue_driving" },
    { label: "ACC OFF", key: "alert_acc_off" },
    { label: "ACC ON", key: "alert_acc_on" },
    // { label: "حكم غير متصل بالإنترنت", key: "alert_offline_judgment" },
  ];

  // ✅ Mutation للتحديث
  const { mutate, isPending } = useMutation({
    mutationFn: () => updateDialogAlert(deviceId, formData),
    onSuccess: () => {
      toast.success("تم تحديث إعدادات التنبيهات بنجاح ✅");
      refetch?.(); // لإعادة تحميل البيانات بعد التحديث
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  // ✅ لما المستخدم يغيّر checkbox
  const handleToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  // ✅ لما المستخدم يغيّر قيمة input
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ عند الضغط على زر التحديث
  const handleSubmit = () => {
    mutate();
  };

  return (
    <section dir="rtl">
      {/* ✅ السويتشات */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4">
        {alertsList.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={formData[item.key] === 1}
                onChange={() => handleToggle(item.key)}
              />
              <span className="text-gray-700 text-xs font-medium">
                {item.label}
              </span>
            </label>

            {/* ✅ input الحد الأقصى للسرعة يظهر فقط عند تفعيل alert_speed_limit */}
            {item.key === "alert_speed_limit" && formData.alert_speed_limit === 1 && (
              <input
                type="number"
                min="0"
                placeholder="الحد الأقصى (كم/س)"
                className="input input-bordered input-sm w-full mt-1 text-xs"
                value={formData.alert_speed_limit_value || ""}
                onChange={(e) => handleInputChange("alert_speed_limit_value", e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <FormBtn
        title="تحديث اعدادات التنبيهات"
        loading={isPending}
        onClick={handleSubmit}
      />
    </section>
  );
};

export default Alerts;
