import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import FormBtn from "../../../../components/form/FormBtn";
import { updateDialogAlert } from "../../../../services/monitorServices";
import { useTranslation } from "react-i18next";

const Alerts = ({ deviceSettings, refetch }) => {
  const { t } = useTranslation();

  const alerts = deviceSettings?.device;
  const deviceId = deviceSettings?.device?.id;

  if (!alerts || !deviceId)
    return (
      <p className="text-center py-2 px-4 my-20 w-fit mx-auto rounded-lg bg-primary text-white">
        {t("somethingWentWrong")}
      </p>
    );

  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({
      alert_speed_limit: alerts?.alert_speed_limit || 0,
      alert_speed_limit_value: alerts?.alert_speed_limit_value || "",
      alert_offline: alerts?.alert_offline || 0,
      alert_restricted_driving: alerts?.alert_restricted_driving || 0,
      alert_low_voltage: alerts?.alert_low_voltage || 0,
      alert_rest_threshold: alerts?.alert_rest_threshold || 0,
      alert_idle_speed: alerts?.alert_idle_speed || 0,
      alert_fatigue_driving: alerts?.alert_fatigue_driving || 0,
      alert_acc_off: alerts?.alert_acc_off || 0,
      alert_acc_on: alerts?.alert_acc_on || 0,
      alert_offline_judgment: alerts?.alert_offline_judgment || 0,
    });
  }, [alerts]);

  const alertsList = [
    { label: t("alerts.speedLimit"), key: "alert_speed_limit" },
    { label: t("alerts.offline"), key: "alert_offline" },
    { label: t("alerts.restrictedDriving"), key: "alert_restricted_driving" },
    { label: t("alerts.lowVoltage"), key: "alert_low_voltage" },
    { label: t("alerts.restThreshold"), key: "alert_rest_threshold" },
    { label: t("alerts.idleSpeed"), key: "alert_idle_speed" },
    { label: t("alerts.fatigueDriving"), key: "alert_fatigue_driving" },
    { label: t("alerts.accOff"), key: "alert_acc_off" },
    { label: t("alerts.accOn"), key: "alert_acc_on" },
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateDialogAlert(deviceId, formData),
    onSuccess: () => {
      toast.success(t("alerts.successMessage"));
      refetch?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  const handleToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    mutate();
  };

  return (
    <section>
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

            {item.key === "alert_speed_limit" &&
              formData.alert_speed_limit === 1 && (
                <input
                  type="number"
                  min="0"
                  placeholder={t("alerts.maxSpeedPlaceholder")}
                  className="input input-bordered input-sm w-full mt-1 text-xs"
                  value={formData.alert_speed_limit_value || ""}
                  onChange={(e) =>
                    handleInputChange("alert_speed_limit_value", e.target.value)
                  }
                />
              )}
          </div>
        ))}
      </div>

      <FormBtn
        title={t("alerts.updateBtn")}
        loading={isPending}
        onClick={handleSubmit}
      />
    </section>
  );
};

export default Alerts;
