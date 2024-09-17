import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import auth from "../../Services/Auth";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
