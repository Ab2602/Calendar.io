import React from "react";
import LoginButton from "../components/LoginButton";
import "../styles/login.css"; // Ensure this CSS file is imported

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-info">
        <h1>Welcome to Calender.io</h1>
        <p>Book your events and appointments with ease</p>
        <ul>
          <li>Edit events</li>
          <li>Remove events</li>
          <li>Watch events</li>
          <li>Create events</li>
        </ul>
      </div>
      <div className="login-section">
        <h2>Login</h2>
        <LoginButton />
      </div>
    </div>
  );
};

export default Login;
