import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Requires an authenticated user whose `role` is one of `roles`.
 * Otherwise redirects home (or to login if not authenticated).
 */
export function RequireRole({ roles, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const allowed = Array.isArray(roles) ? roles : [roles];

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user?.role || !allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
