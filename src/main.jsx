import { createRoot } from "react-dom/client";
import AppRouter from "./routes/AppRouter.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store/store.js";
import { Provider } from "react-redux";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </QueryClientProvider>
);
