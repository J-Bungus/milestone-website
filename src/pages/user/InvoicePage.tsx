import React, { useGlobal, useEffect, useState } from "reactn";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import "../../assets/styles/InvoicePage.css";
import { Invoice } from "../../types";

const logo = require("../../assets/imgs/invoice-logo.png");

const InvoicePage = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const location = useLocation();
  const [userInfo, setUserInfo] = useGlobal("userInfo");
  const [loading, setLoading] = useGlobal("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      console.log("IN USE EFFECT")
      const token = localStorage.getItem("token");
      const { invoice_id } = location.state;
      const endpoint = `${process.env.REACT_APP_API}/invoice/fetch/${invoice_id ? invoice_id : ""}`;
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setInvoice(res.data.invoice);
    };

    fetchInvoice();
  }, []);

  return (
    <div className="invoice-wrapper">
      <div id="invoice-viewer" className="invoice-viewer">
        <div id="invoice" className="invoice">
          <div className="invoice-heading">
            <img src={logo} alt="milestone autosupplies logo" />
            <div className="milestone-info">
              <div className="name-title">Milestone Autosupplies Inc.</div>
              <div className="business-address">
                596 Gordon Baker Rd. <br />
                North York, ON M2H 3B4
              </div>
              <div className="contacts">
                <span>Tel: </span>
                <span>416-496-9384</span>
              </div>
              <div className="contacts">
                <span>Fax: </span>
                <span>416-496-7844</span>
              </div>
              <div className="contacts">
                Email: milestoneautosuppliesinc@hotmail.com
              </div>
            </div>
            <div className="invoice-info">
              <div className="invoice-title"> Invoice </div>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>
                        Date
                      </th>
                      <th className="last">
                        Invoice #
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {format(new Date(), "yyyy-MM-dd")}
                      </td>
                      <td className="last">
                        {invoice && String(invoice.id).padStart(6, '0')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="invoice-to-section">
            <div className="to-section-heading"> Invoice To:</div>
            <div className="to-section-info">
              {userInfo.business}
              <br />
              {userInfo.street_address}
              <br />
              {userInfo.city}, {userInfo.province}
              <br />
              {userInfo.postal_code}
            </div>
          </div>
          <div className="invoice-content">
            <table className="invoice-items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th id="last-header">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice && invoice.items.map(item => {
                  return (
                    <tr className="non-empty-rows">
                      <td className="item">
                        {item.product.msa_id}{item.package_type === "big" && "B"}
                      </td>
                      <td className="description">
                        {item.product.description}
                        {item.package_type === "individual"
                          ? `, (1 ${item.product.unit_type})`
                          : item.package_type === "small"
                            ? `, (${item.product.package_size} ${item.product.unit_type}/pkg)`
                            : `, (${item.product.big_package_size} ${item.product.unit_type}/pkg)`
                        }
                      </td>
                      <td className="price">
                        {item.package_type === "individual"
                          ? item.product.unit_price.toFixed(2)
                          : item.package_type === "small"
                            ? item.product.package_price.toFixed(2)
                            : item.product.big_package_price.toFixed(2)
                        }
                      </td>
                      <td className="quantity">
                        {item.amount}
                      </td>
                      <td className="amount last">
                        {item.price && item.price.toFixed(2)}
                      </td>
                    </tr>
                  )
                })
                }
                <tr>
                  <td className="item"/><td className="description"/><td className="price"/><td className="quantity"/><td className="amount last"/>
                </tr>
              </tbody>
            </table>
            <div className="invoice-subtotal">
              <div>
                <span>Subtotal:</span> {
                  invoice?.total_price && Number(invoice.total_price).toLocaleString("en-US",{
                    style: "currency",
                    currency: "USD"
                  })
                }
              </div>
            </div>
            <div className="invoice-tax-summary">
              <div>
                <span>Sales Tax Summary</span> {
                  invoice?.total_price &&
                  (invoice.total_price * 0.13).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                  })
                }
              </div>
            </div>
            <div className="invoice-balance">
              <div className="invoice-msg">
                We appreciate your business and prompt payment!!
              </div>
              <div>
                <span>Balance Due:</span> {
                  invoice?.total_price &&
                  (invoice.total_price * 1.13).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                  })
                }
              </div>
            </div>
          </div>
          <div className="invoice-footer">
            <div>GST/HST No.: 820790285</div>
            <div className="special-font">B.H</div>
          </div>
        </div>
      </div>
      <button
        onClick={async () => {
          setLoading(true);
          const pdfElement = document.getElementById("invoice");
          if (!pdfElement) {
            return;
          }

          const canvas = await html2canvas(pdfElement);
          const img = await canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "letter", true);
          const height = pdf.internal.pageSize.getHeight();
          const width= (pdf.getImageProperties(img).width * height) / pdf.getImageProperties(img).height;
          pdf.addImage(img, "JPEG", 0, 0, width, height);
          const output = pdf.output('datauristring').split(',')[1];
          const token = localStorage.getItem("token");

          await axios.post(`${process.env.REACT_APP_API}/invoice/send`, {
            invoicePDF: output,
            invoice_id: invoice ? invoice.id : -1,
            email: userInfo.email
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setLoading(false);
          navigate("/products");
        }}
      >
        Send Invoice to Email
      </button>
    </div>
  );
}

export default InvoicePage;