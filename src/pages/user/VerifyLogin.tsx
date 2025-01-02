import React, { useEffect, useState, useDispatch, useGlobal } from "reactn";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import "../../assets/styles/VerifyLogin.css";

const VerifyLogin = () => {
  const [code, setCode] = useState<Array<string>>([]);
  const [infoText, setInfoText] = useState<string>("");
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [phone, setPhone] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useGlobal("loading");

  const setUserAccess = useDispatch((global, _dispatch, userAccessInfo) => {
    localStorage.setItem("token", userAccessInfo.token);

    return {
      ...global,
      userInfo: userAccessInfo.userInfo,
      token: userAccessInfo.token
    };
  });

  useEffect(() => {
    const validate = async () => {
      const endpoint = `${process.env.REACT_APP_API}/users/validate`;
      const token = localStorage.getItem("unverifiedToken");
      try {
        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log(res);
        setPhone(res.data.userInfo.phone.substring(6));
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
        localStorage.clear();
      }
    }

    validate();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const endpoint = `${process.env.REACT_APP_API}/users/login/verify`;
    const token = localStorage.getItem("unverifiedToken");
    const clientIP = localStorage.getItem("newIP");
    try {
      const res = await axios.post(endpoint, {
        clientIP: clientIP,
        code: code.join("")
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.status === "approved" && token) {
        localStorage.removeItem("unverifiedToken");
        localStorage.removeItem("newIP");
        localStorage.setItem("token", token);

        setUserAccess({
          userInfo: res.data.userInfo,
          token: token
        });

        navigate("/products");
      } else {
        setInfoText("The code you entered is incorrect. Please try again.");
        setShowInfo(true);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error);
        setInfoText(error?.response?.data?.message);
        setShowInfo(true);
      } else {
        setInfoText("An error occurred while verifying your code");
        setShowInfo(true);
      }
    }

    setLoading(false);
  
  }

  if (isAuthenticated === null) {
    return <div> Loading... </div>;
  }

  if (isAuthenticated == false) {
    navigate("/");
  }

  return (
    <div className="verification-wrapper">
      <div className="verification-box">
        <p>It seems like you are loggin in from a new location. Please enter the 6 digit code sent to your phone ending in {phone} to verify the login...</p>
        <div>Verification code</div>
        <div className="verification-input">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              className="code-input-box"
              id={`input-box-${index}`}
              key={index}
              type="text"
              maxLength={1}
              value={code[index]}
              onChange={e => {
                const updatedCode = [...code];
                updatedCode[index] = e.target.value;

                if (e.target.value !== "") {
                  const nextInput = document.getElementById(`input-box-${index+1}`);
                  nextInput?.focus();  
                }
           
                setCode(updatedCode);
              }}
              onKeyDown={async e => {
                if (e.key === "Backspace") {
                  const nextInput = document.getElementById(`input-box-${index-1}`);
                  nextInput?.focus();
                }

                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          ))}
        </div>
        {showInfo && <div style={{ color: "red" }}> {infoText} </div>}
        <button
          className="verify-button cart-action gen"
          onClick={handleSubmit}
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default VerifyLogin;