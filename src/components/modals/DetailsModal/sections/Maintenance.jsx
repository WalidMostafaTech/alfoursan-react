import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  getMaintenances,
  createMaintenances,
  deleteMaintenances,
} from "../../../../services/monitorServices";
import Loader from "../../../Loading/Loader";
import MainInput from "../../../form/MainInput";
import FormBtn from "../../../form/FormBtn";

const Maintenance = ({ deviceID, deviceSettings }) => {
  const { t } = useTranslation();

  if (!deviceID || !deviceSettings)
    return (
      <p className="text-center py-2 px-4 my-20 w-fit mx-auto rounded-lg bg-primary text-white">
        {t("somethingWentWrong")}
      </p>
    );

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
      toast.success(t("maintenance.addSuccess"));
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
      toast.success(t("maintenance.deleteSuccess"));
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
      console.error(error);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm(t("maintenance.confirmDelete"))) {
      deleteMutation(id);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <article>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold tracking-wide">
          {t("maintenance.title")}{" "}
          <span className="bg-sky-600 text-white py-1 px-2 rounded text-sm">
            {/* {Number(deviceSettings?.device?.km_total).toFixed(2)} km */}
            {Number(deviceSettings?.device?.display_km_total).toFixed(2)} km
          </span>
        </h2>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`btn btn-sm ${
            isOpen ? "btn-ghost text-gray-600" : "btn-primary"
          }`}
        >
          {isOpen ? t("maintenance.cancel") : t("maintenance.addMaintenance")}
        </button>
      </div>

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
            className="border border-gray-300 p-3 rounded-lg space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MainInput
                id="deviceName"
                label={t("maintenance.deviceName")}
                value="R12L-F-424279"
                disabled
              />

              <MainInput
                id="planning_time"
                type="date"
                label={t("maintenance.plannedTime")}
                value={formData.planning_time}
                onChange={handleChange}
              />

              <MainInput
                id="type"
                type="select"
                label={t("maintenance.type")}
                value={formData.type}
                onChange={handleChange}
                options={[
                  {
                    value: "comprehensive",
                    label: t("maintenance.comprehensive"),
                  },
                  { value: "mileage", label: t("maintenance.mileage") },
                  { value: "date", label: t("maintenance.date") },
                ]}
              />

              <MainInput
                id="planned_miles"
                label={t("maintenance.plannedMiles")}
                value={formData.planned_miles}
                onChange={handleChange}
              />

              {/* ✅ إشعارات */}
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text text-sm font-bold text-gray-700">
                    {t("maintenance.notifications")}
                  </span>
                </label>

                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-gray-700 font-medium text-xs">
                      {t("maintenance.maintenanceReminder")}
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
                      {t("maintenance.endUserReminder")}
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
              title={
                isPending ? t("maintenance.saving") : t("maintenance.save")
              }
              variant="success"
              disabled={isPending}
            />
          </form>
        </div>
      </div>

      {/* ✅ جدول الصيانة */}
      <section className="overflow-x-auto p-2 md:p-3">
        <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm text-xs">
          <thead className="bg-mainColor/10 text-mainColor">
            <tr>
              <th className="py-2 px-2 text-start">
                {t("maintenance.tableHeaders.number")}
              </th>
              <th className="py-2 px-2 text-start">
                {t("maintenance.tableHeaders.type")}
              </th>
              <th className="py-2 px-2 text-start">
                {t("maintenance.tableHeaders.plannedTime")}
              </th>
              <th className="py-2 px-2 text-start">
                {t("maintenance.tableHeaders.plannedMiles")}
              </th>
              <th className="py-2 px-2 text-start">
                {t("maintenance.tableHeaders.status")}
              </th>
              <th className="py-2 px-2 text-start">
                {t("maintenance.tableHeaders.actions")}
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {maintenances.length > 0 ? (
              maintenances.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-2 px-2">{index + 1}</td>
                  <td className="py-2 px-2">{item.type || "-"}</td>
                  <td className="py-2 px-2 text-gray-700">
                    {item.planning_time || "-"}
                  </td>
                  <td className="py-2 px-2">{item.planned_miles || "-"}</td>
                  <td
                    className={`py-2 px-2 font-medium ${
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
                      {isDeleting
                        ? t("maintenance.deleting")
                        : t("maintenance.delete")}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  {t("maintenance.noRecords")}
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
