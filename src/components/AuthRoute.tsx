import React, { useEffect, useState, useDispatch } from "reactn";
import axios from "axios";
import { Navigate, Route } from "react-router-dom";

import { AuthRouteProps } from "../types";

const AuthRoute = ({ children, isAdmin }: AuthRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const ep = `${process.env.REACT_APP_API}/users/validate${isAdmin ? '/admin' : ""}`;
      console.log("EP", ep);
      try {
        const res = await axios.get(ep, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserAccess({ token: token, userInfo: res.data.userInfo });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        if (!isAdmin) {
          localStorage.removeItem("token");
          setUserAccess({
            token: "",
            userInfo: {
              id: undefined,
              business: "",
              name: "",
              address: "",
              email: "",
              phone: "",
              username: "",
              password: "",
              created_at: undefined
            }
          });
        }
      }
    }

    validate();
  }, []);

  useEffect(() => {
    console.log("AUTH", isAuthenticated);
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return <div> LOADING... </div>
  }

  const token = localStorage.getItem("token");
  if (!isAuthenticated && !token) {
    return <Navigate to="/" replace/>;
  } else if (!isAuthenticated && isAdmin) {
    return <Navigate to="/products" replace/>;
  }

  return <>{ children }</>;
}

export default AuthRoute;