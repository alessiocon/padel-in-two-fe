
import { Navigate, Outlet } from "react-router";
import { useContext } from "react";
import { AuthContext } from "./../../store/context";

export default function GuestOnlyLayout() {
  const [auth] = useContext(AuthContext);


  if (auth.auth) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
