import React from "reactn";
import "../assets/styles/Footer.css";

const Footer = () => {
  return (
    <div className="footer-wrapper">
      <div className="footer-section">
        <h3 className="footer-section-title">Don't have an Account?</h3>
        <p style={{whiteSpace: "wrap"}}>Accounts are only available to authorized customers of Milestones Autosupplies Inc. Accounts are created for each authorized customer which gives access to our selection of products</p>
      </div>
      <div className="footer-section">
        <h3 className="footer-section-title">How to be an authorized customer?</h3>
        <ul>
          <li>Be an auto repair business operating in Ontario</li>
          <li>Be an existing cliet of Milestone Autosupplies Inc.</li>
        </ul>
      </div>
    </div>
  )
}

export default Footer;