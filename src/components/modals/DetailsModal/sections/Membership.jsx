import { useTranslation } from "react-i18next";

const Membership = ({ deviceSettings }) => {
  const { t } = useTranslation();
  const subscription = deviceSettings?.subscription;

  return (
    <section className="overflow-x-auto p-2 md:p-3">
      <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-mainColor/10 text-mainColor">
          <tr className="text-xs">
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.clientName")}</th>
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.account")}</th>
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.contact")}</th>
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.phoneNumber")}</th>
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.package")}</th>
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.subscriptionStart")}</th>
            <th className="py-3 px-4 text-right">{t("membership.tableHeaders.subscriptionEnd")}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          <tr className="hover:bg-gray-50 transition-colors duration-200 text-xs">
            <td className="py-3 px-4">{subscription.client_name || "-"}</td>
            <td className="py-3 px-4">{subscription.account || "-"}</td>
            <td className="py-3 px-4 text-mainColor font-medium">
              {subscription.contact || "-"}
            </td>
            <td className="py-3 px-4">{subscription.phone || "-"}</td>
            <td className="py-3 px-4">{subscription.package_name_ar || "-"}</td>
            <td className="py-3 px-4">{subscription.start_from || "-"}</td>
            <td className="py-3 px-4">{subscription.expiry_date || "-"}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default Membership;
