import React, { useState, setGlobal, useDispatch } from "reactn";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import "../../assets/styles/Login.css";
import { Link } from "react-router-dom";
import axios, {AxiosError} from "axios";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const setUserAccess = useDispatch((global, _dispatch, userAccessInfo) => {
    localStorage.setItem("token", userAccessInfo.token);

    return { 
      ...global,
      userInfo: userAccessInfo.userInfo,
      token: userAccessInfo.token
    };
  });

  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("Performing login process");
    console.log("username: ", username);
    console.log("password", password);
    console.log("remember me: ", remember);

    const endpoint = `${process.env.REACT_APP_API}/users/login`;
    try {
      console.log("HELLO?");
      const res = await axios.post(endpoint, { username, password });
      console.log(res);
      if (res.data.requireVerification) {
        localStorage.setItem("unverifiedToken", res.data.accessToken);
        localStorage.setItem("newIP", res.data.loginIP);
        navigate("/verify-login");
      } else if (res.data.user.is_admin) {
        setUserAccess({
          userInfo: res.data.user,
          token: res.data.accessToken
        });
        navigate("/admin");
      } else {
        setUserAccess({
          userInfo: res.data.user,
          token: res.data.accessToken
        });
        navigate("/products");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        setErrorMsg(error?.response?.data?.message);
      } else {
        setErrorMsg("an unexpected error occurred");
      }
    }

  }

  return (
    <>
    <div className="login-wrapper">
      <div className="login-modal">
        <div className="login-title">Customer Login</div>
        <div className="login-description">Login to view products with an existing account.</div>
        <div className="login-inputs">
          <div>Username</div>
          <input
            onChange={e => setUsername(e.target.value)}
            onKeyDown={async e => {
              if (e.key === "Enter") {
                await handleLogin();
              }
            }}
          />
        </div>
        <div className="login-inputs">
          <div>Password</div>
          <input
            type="password"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={async e => {
              if (e.key === "Enter") {
                await handleLogin();
              }
            }}
          />
          {errorMsg &&  <div className="error-msg">{errorMsg}</div>}
          <div className="login-options">
            <div>
              <span>Remember me </span>
              <input 
                type="checkbox"
                onChange={e => setRemember(e.target.checked)}
              />
            </div>
            <Link to="/forgot-password">Forgot Password</Link>
          </div>
        </div>
        <button 
          className="login-button"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
      <Footer/>
    </div>
    </>
  );
}

export default Login;