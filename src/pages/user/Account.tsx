import React, { useState, useGlobal } from "reactn";
import axios, { AxiosError } from "axios";

import "../../assets/styles/Account.css";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { UserInfo } from "../../types";

const Account = () => {
  const [userInfo, setUserInfo] = useGlobal("userInfo");
  const [loading, setLoading] = useGlobal("loading");
  const [openPasswordModal, setOpenPasswordModal] = useState<boolean>(false);
  const [showInvalidText, setShowInvalidText] = useState<boolean>(false);
  const [invalidText, setInvalidText] = useState<string>("");

  type UserInfoKeys = Exclude<keyof UserInfo, 'id' | 'created_at' | 'iat' | 'exp' | 'is_admin'>;

  const fields: Array<{ key: UserInfoKeys, text: string, required: boolean}> = [
    { key: "name", text: "Contact Name", required: true },
    { key: "email", text: "Email", required: true },
    { key: "phone", text: "Phone Number", required: true},
    { key: "business", text: "Business Name", required: true },
    { key: "street_address", text: "Street Address", required: true },
    { key: "city", text: "City", required: false },
    { key: "province", text: "Province", required: false },
    { key: "postal_code", text: "Postal Code", required: false  },
    { key: "username", text: "Username", required: true },
  ];

  return (
    <div className="account-wrapper">
      {openPasswordModal && 
        <ChangePasswordModal 
          closeModal={() => setOpenPasswordModal(false)}
        />
      }
      {
        fields.map((field: {key: UserInfoKeys, text: string, required: boolean }) => {
          if (field.key === "province") {
            return (
              <div className="account-field-wrapper">
                <div className="account-field">
                  <span>{field.text}</span>
                  <select 
                    value={userInfo[field.key]}
                    onChange={e => {
                      setUserInfo({
                        ...userInfo, 
                        province: e.target.value
                      });
                    }}
                  >
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="YT">Yukon Territory</option>
                  </select>
                </div>
              </div>
            )
          }
          return (
            <div key={field.key} className="account-field-wrapper">
              <div className="account-field">
                <span>{field.text}</span>
                <input 
                  id={field.key}
                  value={userInfo[field.key]} 
                  type="text"
                  onChange={e => {
                    if (field.required && e.target.value !== "" && e.target.style.borderColor === "red") {
                      e.target.style.borderColor = "gray";
                      setShowInvalidText(false);
                    } else if (field.key === "username" && e.target.style.borderColor === "red") {
                      setShowInvalidText(false);
                    }

                    setUserInfo({
                      ...userInfo,
                      [field.key]: e.target.value
                    });
                  }}
                />
              
              </div>
              { field.key === "username" && 
                <button 
                  className="change-password"
                  onClick={() => setOpenPasswordModal(!openPasswordModal)}
                >
                  Change Password
                </button>
              }
            </div>
          );
        })
      }
      { showInvalidText && <div style={{color: "red"}}> {invalidText} </div>}
      <button
        onClick={async () => {
          setLoading(true);
          const validSubmit = fields.reduce((acc: boolean, curr: {key: UserInfoKeys, text: string, required: boolean}): boolean => {
            if (!curr.required) {
              return acc && true;
            }

            return acc && userInfo[curr.key] !== "";
          }, true);

          if (!validSubmit) {
            fields.forEach((field: {key: UserInfoKeys, text: string, required: boolean}) => {
              if (field.required && userInfo[field.key] === "") {
                const fieldElement = document.getElementById(field.key);
                if (fieldElement) {
                  fieldElement.style.borderColor = "red";
                }
              }
            });

            setLoading(false);
            setInvalidText("Please fill in the missing fields!");
            setShowInvalidText(true);
            return;
          }

          const endpoint = `${process.env.REACT_APP_API}/users/update`;
          const token = localStorage.getItem("token");
          try {
            const res = await axios.post(endpoint, { userInfo }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
          } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
              setInvalidText(error?.response?.data?.message);
              const fieldElement = document.getElementById("username");
                if (fieldElement) {
                  fieldElement.style.borderColor = "red";
                }
            } else {
              setInvalidText("An unexpected error occurred.");
            }
            setShowInvalidText(true);
            setLoading(false);
            return;
          }

          const fieldElement = document.getElementById("username");
          if (fieldElement) {
            fieldElement.style.borderColor = "gray";
          }

          setShowInvalidText(false);
          setLoading(false);
        }}
      > 
        Save Changes 
      </button>
    </div>
  );
};

export default Account;