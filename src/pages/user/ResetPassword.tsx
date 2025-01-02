import React, { useEffect, useState } from "reactn";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ChangePasswordModal from "../../components/ChangePasswordModal";

const ResetPassword = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const validateToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      const endpoint = `${process.env.REACT_APP_API}/users/validate/resetToken`;
      try {
        const user = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        localStorage.setItem("resetToken", token || "");
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    }

    validateToken();

    return () => {
      localStorage.removeItem("resetToken");
    }
  }, []);

  if (!isAuthenticated) {
    return <div> Your password reset token seems to be invalid, please check your email for a newer link! </div>
  }

  return (
    <div className="reset-password-wrapper">
      <ChangePasswordModal/>
    </div>
  );
};

export default ResetPassword;