import React, { useGlobal, setGlobal, useEffect, useDispatch, useState } from "reactn";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "../assets/styles/Header.css";

import CartModal from "./CartModal";
const cart = require("../assets/imgs/shopping-cart.png");
const logo = require("../assets/imgs/invoice-logo.png");

const Header = () => {
  const [token, setToken] = useGlobal("token");
  const [userInfo, setUserInfo] = useGlobal("userInfo");
  const [openCartModal, setOpenCartModal] = useState(false);
  const navigate = useNavigate();

  const logout = useDispatch((global, _dispatch) => ({
    ...global,
    token: "",
    userInfo: {
      id: undefined,
      business: "",
      name: "",
      street_address: "",
      city: "",
      province: "",
      postal_code: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      is_admin: false,
      created_at: undefined
    }
  }));

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  return (
    <>
      <div className="header-wrapper">
        <img className="logo" src={logo} alt="Milestone Autosupplies Inc Logo"/>
        { token 
            ? <nav>
                <ul>
                  { userInfo.is_admin && 
                    <li>
                      <Link to="/admin">
                        Admin
                      </Link>
                    </li>}
                  <li>
                    <Link to="/products">Products</Link>
                  </li>
                  <li>
                    <Link to="/account">Account</Link>
                  </li>
                </ul>
                <button className="cart-button"
                  onClick={() => {
                    setOpenCartModal(!openCartModal);
                  }}
                >
                  <img className="cart-img" src={cart}/>
                </button>
                <button className="logout-btn"
                  onClick={() => {
                    localStorage.clear();
                    logout();
                    navigate("../");
                  }}
                >
                  Log-out
                </button>
              </nav>
            : <nav>
              <ul>
                <li>
                  <Link to="/"> Login </Link>
                </li>
              </ul>
            </nav>
        }
        {
          openCartModal && 
          <CartModal
            onBlur={() => setOpenCartModal(false) }
          />
        }
      </div>
      <Outlet/>
    </>
  );
}

export default Header;