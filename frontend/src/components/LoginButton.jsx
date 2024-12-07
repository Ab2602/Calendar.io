import React from "react";
import { FaGoogle } from "react-icons/fa";

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <button onClick={handleLogin} className="google-login-button">
      <FaGoogle className="google-icon" />
    </button>
  );
};

export default LoginButton;
