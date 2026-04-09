import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";

function App() {
  return (
    <main>
      <Outlet />

      {/* <ToastContainer
        position="top-right"
        theme="colored"
        autoClose={3000}
        // limit={5}
        limit={3}
      /> */}
      {/* تنبيهات الإنذار من السوكت: مدة أطول + تكدس أكبر */}
       <ToastContainer
        containerId="alarm-stack"
        position="bottom-right"
        theme="colored"
        autoClose={15000}
        // limit={12}
        limit={3}
        newestOnTop
      /> 

      <Toaster
        position="bottom-right"
        expand={false} // ← collapsed stack بشكل افتراضي، يتفتح بالـ hover
        visibleToasts={4} // ← أقصى 4 إشعارات ظاهرة
        richColors
        dir="rtl"
      />
    </main>
  );
}

export default App;
