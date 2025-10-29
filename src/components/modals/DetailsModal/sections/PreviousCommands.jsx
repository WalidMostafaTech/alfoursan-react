const PreviousCommands = () => {
  const commands = [
    {
      no: 1,
      name: "Restart Device",
      content: "CMD_RESTART",
      status: "Success",
      sendTime: "2025-10-08 14:30",
      reply: "Device restarted successfully",
      responseTime: "1.2s",
    },
    {
      no: 2,
      name: "Get Location",
      content: "CMD_LOCATE",
      status: "Pending",
      sendTime: "2025-10-08 14:35",
      reply: "-",
      responseTime: "-",
    },
  ];

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
              key={index}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-3 px-4">{cmd.no}</td>
              <td className="py-3 px-4 font-medium text-gray-700">
                {cmd.name}
              </td>
              <td className="py-3 px-4 text-gray-600">{cmd.content}</td>
              <td
                className={`py-3 px-4 font-semibold ${
                  cmd.status === "Success"
                    ? "text-green-600"
                    : cmd.status === "Failed"
                    ? "text-red-600"
                    : "text-yellow-500"
                }`}
              >
                {cmd.status}
              </td>
              <td className="py-3 px-4 text-gray-600">{cmd.sendTime}</td>
              <td className="py-3 px-4 text-gray-600">{cmd.reply}</td>
              <td className="py-3 px-4 text-gray-600">{cmd.responseTime}</td>
              <td className="py-3 px-4">
                <button className="btn btn-sm btn-error bg-red-600 text-white">
                  Delete
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
