import MainInput from "../../../../components/form/MainInput";
import { useTranslation } from "react-i18next";

const Reminders = () => {
  const { t } = useTranslation();
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MainInput id="itemName" label={t("reminders.itemName")} />
        <MainInput id="reminderTime" label={t("reminders.reminderTime")} />
        <MainInput id="remarks" label={t("reminders.remarks")} />
        <MainInput id="email" label={t("reminders.email")} />
      </div>
    </section>
  );
};

export default Reminders;
