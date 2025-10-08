const Membership = () => {
  const members = [
    {
      name: "أحمد محمد",
      account: "ahmed123",
      contact: "ahmed@example.com",
      phone: "01012345678",
      plan: "باقة الذهبية",
      start: "2025-01-01",
      end: "2026-01-01",
    },
    {
      name: "سارة علي",
      account: "sara_ali",
      contact: "sara@example.com",
      phone: "01098765432",
      plan: "باقة الفضية",
      start: "2025-03-15",
      end: "2026-03-15",
    },
  ];

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
          {members.map((member, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-3 px-4">{member.name}</td>
              <td className="py-3 px-4">{member.account}</td>
              <td className="py-3 px-4 text-mainColor font-medium">
                {member.contact}
              </td>
              <td className="py-3 px-4">{member.phone}</td>
              <td className="py-3 px-4">{member.plan}</td>
              <td className="py-3 px-4">{member.start}</td>
              <td className="py-3 px-4">{member.end}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default Membership;
