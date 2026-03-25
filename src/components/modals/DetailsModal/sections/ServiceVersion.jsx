import MainInput from "../../../../components/form/MainInput";
import { useTranslation } from "react-i18next";

const ServiceVersion = ({ deviceSettings }) => {
  const { t } = useTranslation();
  const subscription = deviceSettings?.subscription;

  return (
    <section>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput
            id="version"
            label={t("serviceVersion.versionName")}
            value={subscription?.package_name_ar || ""}
            disabled
          />
          <MainInput
            id="serviceStatus"
            label={t("serviceVersion.serviceStatus")}
            value={subscription?.status || ""}
            disabled
          />
          <MainInput
            id="serviceVersion"
            label={t("serviceVersion.serviceVersion")}
            value={subscription?.version || ""}
            disabled
          />
        </div>

        <div className="divider my-6">{t("serviceVersion.simCardService")}</div>

        {/* رقم السيارة واستهلاك الوقود */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainInput
            id="iccid"
            label={t("serviceVersion.iccid")}
            value={deviceSettings?.device.iccid}
            disabled
          />
          <MainInput id="status" label={t("serviceVersion.status")} disabled />
        </div>

        <p className="text-xs text-gray-600">
          {t("serviceVersion.expiryDate")} {subscription?.expiry_date}
        </p>

        {/* <FormBtn title="تحديث البيانات" /> */}
      </form>
    </section>
  );
};

export default ServiceVersion;
