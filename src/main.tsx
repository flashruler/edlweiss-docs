import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AdminAccessProvider } from "./contexts/AdminAccessContext";
import { PublicSidebarProvider } from "./contexts/PublicSidebarContext";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <AdminAccessProvider>
        <PublicSidebarProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PublicSidebarProvider>
      </AdminAccessProvider>
    </ConvexProvider>
  </React.StrictMode>
);