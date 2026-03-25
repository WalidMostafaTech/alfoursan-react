import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { deleteCommand } from "../../../../services/monitorServices";

const PreviousCommands = ({ deviceSettings, refetch }) => {
  const { t } = useTranslation();
  const commands = deviceSettings?.commands || [];

  // ✅ دالة تنسيق التاريخ
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ mutation للحذف
  const { mutate: removeCommand, isPending } = useMutation({
    mutationFn: deleteCommand,
    onSuccess: () => {
      toast.success(t("previousCommands.deleteSuccess"));
      refetch(); // 🔄 تحديث البيانات لو متوفر refetch
    },
    onError: (error) => {
      console.error(error);
      toast.error(error?.response?.data?.message);
    },
  });

  // ✅ تنفيذ الحذف مع تأكيد
  const handleDelete = (id) => {
    if (!id) return;
    if (window.confirm(t("previousCommands.confirmDelete"))) {
      removeCommand(id);
    }
  };

  return (
    <section className="overflow-x-auto p-2 md:p-3">
      <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm text-xs">
        <thead className="bg-mainColor/10 text-mainColor">
          <tr>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.number")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.commandName")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.commandContent")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.status")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.sendTime")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.replyContent")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.responseTime")}</th>
            <th className="py-2 px-2 text-left">{t("previousCommands.tableHeaders.operate")}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {commands.map((cmd, index) => (
            <tr
              key={cmd.id || index}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-2 px-2">{cmd.imei || ""}</td>
              <td className="py-2 px-2 font-medium text-gray-700">
                {cmd.command_name || ""}
              </td>
              <td className="py-2 px-2 text-gray-600">
                {cmd.command_content || ""}
              </td>
              <td
                className={`py-2 px-2 font-semibold ${
                  cmd.status === "Success"
                    ? "text-green-600"
                    : cmd.status === "Failed"
                    ? "text-red-600"
                    : "text-yellow-500"
                }`}
              >
                {cmd.status || ""}
              </td>
              <td className="py-2 px-2 text-gray-600">
                {formatDateTime(cmd.send_time)}
              </td>
              <td className="py-2 px-2 text-gray-600">
                {cmd.replay_content || ""}
              </td>
              <td className="py-2 px-2 text-gray-600">
                {cmd.response_time || ""}
              </td>
              <td className="py-2 px-2">
                <button
                  onClick={() => handleDelete(cmd.id)}
                  disabled={isPending}
                  className={`btn btn-xs text-white rounded-md px-3 py-1 ${
                    isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isPending ? t("previousCommands.deleting") : t("previousCommands.deleteSuccess")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default PreviousCommands;
