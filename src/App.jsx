import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <main>
      <Outlet />

      <ToastContainer
        position="top-right"
        theme="colored"
        autoClose={3000}
        limit={5}
      />
      {/* تنبيهات الإنذار من السوكت: مدة أطول + تكدس أكبر */}
      <ToastContainer
        containerId="alarm-stack"
        position="bottom-right"
        theme="colored"
        autoClose={15000}
        limit={12}
        newestOnTop
      />
    </main>
  );
}

export default App;
