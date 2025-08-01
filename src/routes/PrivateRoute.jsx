import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
