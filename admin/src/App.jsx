import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import CommentsPage from "./pages/CommentsPage.jsx";

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#171522] text-[#A7A0B8]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="text-xs">Authenticating Staff Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#22202E",
            color: "#F3F0FA",
            border: "1px solid #393347",
            fontSize: "12px",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route
          path="/"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="comments" element={<CommentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
