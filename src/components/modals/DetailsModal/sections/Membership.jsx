const Membership = ({ deviceSettings }) => {
  const subscription = deviceSettings?.subscription;

  return (
    <section className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-mainColor/10 text-mainColor">
          <tr>
            <th className="py-3 px-4 text-right">اسم العميل</th>
            <th className="py-3 px-4 text-right">الحساب</th>
            <th className="py-3 px-4 text-right">الاتصال</th>
            <th className="py-3 px-4 text-right">رقم الهاتف</th>
            <th className="py-3 px-4 text-right">الباقة</th>
            <th className="py-3 px-4 text-right">بداية الاشتراك</th>
            <th className="py-3 px-4 text-right">انتهاء الاشتراك</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          <tr className="hover:bg-gray-50 transition-colors duration-200">
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
