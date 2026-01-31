import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Roles permitidos para esta ruta
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  // Verificar si el usuario está autenticado
  const authUserStr = localStorage.getItem("auth_user");

  // Si no hay usuario autenticado, redirigir a login
  if (!authUserStr) {
    return <Navigate to="/login" replace />;
  }

  // Parsear el usuario fuera del JSX
  let authUser;
  try {
    authUser = JSON.parse(authUserStr);
  } catch {
    localStorage.removeItem("auth_user");
    return <Navigate to="/login" replace />;
  }

  const userRole = authUser.rol || "";

  // Si se especificaron roles permitidos, verificar si el usuario tiene uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      if (userRole === "participant") {
        return <Navigate to="/access" replace />;
      }
      // Para otros roles sin acceso, redirigir a login
      return <Navigate to="/login" replace />;
    }
  }

  // Si está autenticado y tiene el rol adecuado, renderizar el componente
  return <>{children}</>;
};

// Componente para proteger las rutas de login/register cuando ya está autenticado
export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const authUserStr = localStorage.getItem("auth_user");

  if (authUserStr) {
    let authUser;
    try {
      authUser = JSON.parse(authUserStr);
    } catch {
      localStorage.removeItem("auth_user");
      return <>{children}</>;
    }

    const userRole = authUser.rol || "";

    // Si es participant, redirigir a access
    if (userRole === "participant") {
      return <Navigate to="/access" replace />;
    }

    // Para otros roles (admin, etc.), redirigir a dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, mostrar la página pública
  return <>{children}</>;
};
