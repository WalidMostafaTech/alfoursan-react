import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  getMaintenances,
  createMaintenances,
  deleteMaintenances,
} from "../../../../services/monitorServices";
import Loader from "../../../Loading/Loader";
import MainInput from "../../../form/MainInput";
import FormBtn from "../../../form/FormBtn";

const Maintenance = ({ deviceID }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "mileage",
    planning_time: "",
    planned_miles: "",
    notification: 1,
    end_user: 1,
  });

  // ✅ جلب بيانات الصيانة
  const {
    data: maintenances = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["maintenances", deviceID],
    queryFn: () => getMaintenances(deviceID),
    enabled: !!deviceID,
  });

  // ✅ Mutation لإضافة صيانة جديدة
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => createMaintenances(data),
    onSuccess: () => {
      toast.success("تمت إضافة الصيانة بنجاح ✅");
      setIsOpen(false);
      refetch();
      setFormData({
        type: "mileage",
        planning_time: "",
        planned_miles: "",
        notification: 1,
        end_user: 1,
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ device_id: deviceID, ...formData });
  };

  // ✅ Mutation لحذف صيانة
  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteMaintenances(id),
    onSuccess: () => {
      toast.success("تم حذف الصيانة بنجاح 🗑️");
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
      console.error(error);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      deleteMutation(id);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <article>
      <h2 className="font-semibold tracking-wide mb-4">
        الصيانة بالأميال{" "}
        <span className="bg-sky-600 text-white py-1 px-2 rounded text-sm">
          {5370.11} km
        </span>
      </h2>

      {/* ✅ زر فتح الفورم */}
      <button
        className="btn btn-primary btn-sm my-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "إغلاق النموذج" : "إضافة جديد"}
      </button>

      {/* ✅ Accordion من DaisyUI */}
      <div
        className={`collapse collapse-arrow bg-base-200 mb-4 ${
          isOpen ? "collapse-open" : "collapse-close"
        }`}
      >
        <input type="checkbox" checked={isOpen} readOnly hidden />

        <div className="collapse-content">
          <form
            onSubmit={handleSubmit}
            className="border border-gray-300 p-4 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MainInput
                id="deviceName"
                label="اسم الجهاز"
                value="R12L-F-424279"
                disabled
              />

              <MainInput
                id="planning_time"
                type="date"
                label="الوقت المخطط له"
                value={formData.planning_time}
                onChange={handleChange}
              />

              <MainInput
                id="type"
                type="select"
                label="النوع"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: "comprehensive", label: "الصيانة الشاملة" },
                  { value: "mileage", label: "الصيانة بالأميال" },
                  { value: "date", label: "الصيانة بالموعد" },
                ]}
              />

              <MainInput
                id="planned_miles"
                label="الأميال المخطط له"
                value={formData.planned_miles}
                onChange={handleChange}
              />

              {/* ✅ إشعارات */}
              <div className="form-control w-full max-w-xs" dir="rtl">
                <label className="label">
                  <span className="label-text text-sm font-bold text-gray-700">
                    الإشعارات
                  </span>
                </label>

                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-gray-700 font-medium text-xs">
                      تذكير بالصيانة
                    </span>
                    <input
                      id="notification"
                      type="checkbox"
                      checked={formData.notification === 1}
                      onChange={handleChange}
                      className="toggle toggle-primary toggle-sm"
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-gray-700 font-medium text-xs">
                      تذكير المستخدم النهائي
                    </span>
                    <input
                      id="end_user"
                      type="checkbox"
                      checked={formData.end_user === 1}
                      onChange={handleChange}
                      className="toggle toggle-primary toggle-sm"
                    />
                  </label>
                </div>
              </div>
            </div>

            <FormBtn
              title={isPending ? "جاري الحفظ..." : "حفظ"}
              variant="success"
              disabled={isPending}
            />
          </form>
        </div>
      </div>

      {/* ✅ جدول الصيانة */}
      <section className="overflow-x-auto p-4">
        <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm text-xs">
          <thead className="bg-mainColor/10 text-mainColor">
            <tr>
              <th className="py-3 px-4 text-right">#</th>
              <th className="py-3 px-4 text-right">النوع</th>
              <th className="py-3 px-4 text-right">وقت المخطط لها</th>
              <th className="py-3 px-4 text-right">الأميال المخطط لها</th>
              <th className="py-3 px-4 text-right">الحالة</th>
              <th className="py-3 px-4 text-right">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {maintenances.length > 0 ? (
              maintenances.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{item.type || "-"}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {item.planning_time || "-"}
                  </td>
                  <td className="py-3 px-4">{item.planned_miles || "-"}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      item.status === "completed"
                        ? "text-green-600"
                        : item.status === "pending"
                        ? "text-yellow-500"
                        : "text-gray-600"
                    }`}
                  >
                    {item.status || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "جارٍ الحذف..." : "حذف"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  لا توجد سجلات صيانة متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </article>
  );
};

export default Maintenance;
