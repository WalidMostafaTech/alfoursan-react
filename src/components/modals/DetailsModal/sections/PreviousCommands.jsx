import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteCommand } from "../../../../services/monitorServices";

const PreviousCommands = ({ deviceSettings, refetch }) => {
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
      toast.success("✅ Command deleted successfully");
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
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا الأمر؟")) {
      removeCommand(id);
    }
  };

  return (
    <section className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-mainColor/10 text-mainColor">
          <tr>
            <th className="py-3 px-4 text-left">No.</th>
            <th className="py-3 px-4 text-left">Command name</th>
            <th className="py-3 px-4 text-left">Command content</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Send time</th>
            <th className="py-3 px-4 text-left">Reply Content</th>
            <th className="py-3 px-4 text-left">Response Time</th>
            <th className="py-3 px-4 text-left">Operate</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {commands.map((cmd, index) => (
            <tr
              key={cmd.id || index}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-3 px-4">{cmd.imei || ""}</td>
              <td className="py-3 px-4 font-medium text-gray-700">
                {cmd.command_name || ""}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {cmd.command_content || ""}
              </td>
              <td
                className={`py-3 px-4 font-semibold ${
                  cmd.status === "Success"
                    ? "text-green-600"
                    : cmd.status === "Failed"
                    ? "text-red-600"
                    : "text-yellow-500"
                }`}
              >
                {cmd.status || ""}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {formatDateTime(cmd.send_time)}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {cmd.replay_content || ""}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {cmd.response_time || ""}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleDelete(cmd.id)}
                  disabled={isPending}
                  className={`btn btn-sm text-white rounded-md px-3 py-1 ${
                    isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isPending ? "Deleting..." : "Delete"}
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
