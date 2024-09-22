import { useNavigate } from "react-router-dom";
import auth from "../../Services/Auth";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
