import React, { useState } from "reactn";
import axios from "axios";

import "../../assets/styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState<string>("");
  const [showInfo, setShowInfo] = useState<boolean>(false);

  return (
    <div className="login-wrapper">
      <div className="login-modal">
        <div className="login-title">Password Reset</div>
        <div className="login-description">Enter the username associated with your account</div>
        <div className="login-inputs">
          <div>Username</div>
          <input
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        { showInfo && <div className="submit-info"> If the username exists in our database, we will send an email with a link to reset your password. It will expire in 10 minutes.</div>}
        <button
          className="login-button forgot-password"
          onClick={async () => {
            if (username === "") 
              return;
          
            setShowInfo(true);
          
            const endpoint = `${process.env.REACT_APP_API}/users/password/forgot`;
            await axios.post(endpoint, { username });
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;