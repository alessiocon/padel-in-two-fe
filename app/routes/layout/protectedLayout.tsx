import { Navigate, Outlet } from "react-router";
import { useContext} from "react";
import { AuthContext } from "./../../store/context";

export default function ProtectedLayout() {
  const [auth] = useContext(AuthContext);

  if (!auth.auth) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
