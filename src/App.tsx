import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { DashboardLayout } from "./layouts/DashBoardLayout";
import DashboardHome from "./components/dashboard/Home";
import DashboardUser from "./components/dashboard/Users";
import DashboardQuestions from "./components/dashboard/Questions";
import { HomeGame } from "./pages/HomeGame";
import GameLayout from "./layouts/GameLayout";
import DashboardGroups from "./components/dashboard/Groups";
import ProfileLayout from "./layouts/ProfileLayout";
import Profile from "./pages/Profile";
import { GameGroupAccess } from "./pages/GameGroupAccess";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      {/* 2. Ruta del Layout del Dashboard (Ruta Padre) */}
      {/* La ruta del Layout se define con la URL base, pero el elemento NO tiene el path completo. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "dev", "superadmin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* Rutas Hijas (Se renderizan dentro del <Outlet> de DashboardLayout) */}

        {/* Ruta Índice del Dashboard: Se renderiza en /  */}
        <Route index element={<DashboardHome />} />

        {/* Ruta principal del Dashboard: Se renderiza en /dashboard */}
        <Route path="home" element={<DashboardHome />} />
        <Route path="home/:groupId" element={<DashboardHome />} />
        <Route path="users" element={<DashboardUser />} />
        <Route path="questions" element={<DashboardQuestions />} />
        <Route path="groups" element={<DashboardGroups />} />


        {/* se puede añadir más rutas de dashboard aquí */}
      </Route>
      <Route
        path="/access"
        element={
          <ProtectedRoute>
            <GameLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GameGroupAccess />} />

      </Route>
      <Route
        path="/game/:gameId"
        element={
          <ProtectedRoute>
            <GameLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeGame />} />

      </Route>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}


export default App
