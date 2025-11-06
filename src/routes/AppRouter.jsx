import React, { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoadingPage from "../components/Loading/LoadingPage";

const Home = React.lazy(() => import("../pages/Home/Home"));
const TenantDashboard = React.lazy(() =>
  import("../pages/TenantDashboard/TenantDashboard")
);
const CarReplay = React.lazy(() =>
  import("../pages/CarReplay/CarReplay")
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "tenant-dashboard/monitoring", element: <TenantDashboard /> },
      { path: "car-replay/:serial_number", element: <CarReplay /> },
    ],
  },
]);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;
