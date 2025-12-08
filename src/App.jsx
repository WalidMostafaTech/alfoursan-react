import { Outlet } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function App() {
  return (
    <main>
      <Outlet />

      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
    </main>
  );
}

export default App;
