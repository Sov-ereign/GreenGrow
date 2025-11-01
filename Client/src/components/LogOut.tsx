import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors block text-center"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
