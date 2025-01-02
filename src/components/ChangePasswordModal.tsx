import React, { useState, useGlobal } from "reactn";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ChangePasswordModalProps } from "../types";
import "../assets/styles/ChangePasswordModal.css";
const close = require('../assets/imgs/close_icon.png');

const ChangePasswordModal = ({ closeModal }: ChangePasswordModalProps ) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [userInfo, setUserInfo] = useGlobal("userInfo");
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="password-modal-wrapper">
      <div className="password-modal">
        <div className="password-modal-heading">
          <h3>Change Password</h3>
          { closeModal && 
            <img 
              className="close-icon" 
              src={close} 
              alt="close modal" 
              onClick={() => closeModal()}
            />
          }
        </div>
        <div className="password-field">
          <span>New Password</span>
          <input 
            type="password"
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>
        <div className="password-field">
          <span>Confirm Password</span>
          <input 
            id="confirm-password"
            type="password"
            onChange={e => {
              setConfirmPassword(e.target.value);
              let confirmPasswordElement = document.getElementById("confirm-password");
              
              if (confirmPasswordElement){
                confirmPasswordElement.style.borderColor = 'gray';
              }

              if (e.target.value.length === newPassword.length && e.target.value !== newPassword) {
                confirmPasswordElement = document.getElementById("confirm-password");
                if (confirmPasswordElement) {
                  confirmPasswordElement.style.borderColor = 'red';
                }
              }
            }}
          />
        </div>
        { showInfo && !closeModal && <div style={{color: "green"}}>Password reset successful! You will now be redirected to the login page...</div>}
        <button
          disabled={newPassword !== confirmPassword}
          onClick={async () => {
            const endpoint = `${process.env.REACT_APP_API}/users/password/change`;
            const token = localStorage.getItem(closeModal ? "token" : "resetToken");
            const userData = !closeModal
              ? { }
              : userInfo;

            const res = await axios.post(endpoint, { userInfo: userData , password: newPassword }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            setUserInfo(res.data.userInfo);
            if (closeModal)
              closeModal();
            else {
              setShowInfo(true);
              setTimeout(() => {
                navigate("/");
              }, 5000);
            }
          }}
        >
          {closeModal ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;