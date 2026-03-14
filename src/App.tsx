import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.tsx";
import PublicLayout from "./layouts/PublicLayout.tsx";
import AdminDocumentPage from "./pages/admin/AdminDocumentPage.tsx";
import PublicDocumentPage from "./pages/public/PublicDocumentPage.tsx";
import AdminProjectHome from "./pages/admin/AdminProjectHome";
import PublicProjectHome from "./pages/public/PublicProjectHome";

function App() {
  return (
    <div className="h-screen">
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminProjectHome />} />
          <Route path="projects/:projectId" element={<AdminProjectHome />} />
          <Route
            path="projects/:projectId/documents/:documentId"
            element={<AdminDocumentPage />}
          />
        </Route>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicProjectHome />} />
          <Route path="projects/:projectId" element={<PublicProjectHome />} />
          <Route
            path="projects/:projectId/documents/:documentId"
            element={<PublicDocumentPage />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;