import React, { useEffect, useGlobal } from "reactn";
import axios from "axios";

import { AddItemButtonProps } from "../types";
import "../assets/styles/AddItemButton.css";

const AddItemButton = ({ product,cart, setCart }: AddItemButtonProps) => {
  return (
    <div className="button-wrapper">
      <button
        className="amount-button left"
        onClick={async () => {
          const msaID = product.msa_id;
          const token = localStorage.getItem("token");
          if (cart[msaID]) {
            const item = cart[msaID];
            if (item.amount - 1 === 0) {
              const updatedCart = { ...cart };
              await axios.delete(`${process.env.REACT_APP_API}/cart/item/remove/${item.product.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              delete updatedCart[msaID];
              setCart(updatedCart);
            } else {
              const updatedItem = {
                ...cart[msaID],
                amount: item.amount - 1
              };
              
              await axios.put(`${process.env.REACT_APP_API}/cart/item/update`, { item: updatedItem }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              setCart({
                ...cart, 
                [msaID]: updatedItem
              });
            }
          }
        }}
      >
        -
      </button>
      <input 
        type="number" 
        value={String(cart[product.msa_id]?.amount || 0)}
        onChange={async e => {
          const msaID = product.msa_id;
          if (parseInt(e.target.value) < 0)
            return;

          const token = localStorage.getItem("token");

          if ((!e.target.value || parseInt(e.target.value) === 0) && cart[msaID]) {
            const updatedCart = { ...cart };
            await axios.delete(`${process.env.REACT_APP_API}/cart/item/remove/${cart[msaID].product.id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            delete updatedCart[msaID]
            setCart(updatedCart);
          } else if (cart[msaID]) {
            const updatedItem = {
              ...cart[msaID],
              amount: parseInt(e.target.value)
            };
            console.log("updated item", updatedItem);
            await axios.put(`${process.env.REACT_APP_API}/cart/item/update`, { item: updatedItem }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setCart({ 
              ...cart, 
              [msaID]: updatedItem
            });
          } else {
            const updatedItem = {
              product,
              package_type: "individual",
              amount: parseInt(e.target.value)
            };

            await axios.put(`${process.env.REACT_APP_API}/cart/item/update`, { item: updatedItem }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            setCart({
              ...cart,
              [msaID]: updatedItem
            });
          }
        }}
      />
      <button
        className="amount-button right"
        onClick={async () => {
          const msaID = product.msa_id;
          let updatedCart;
          if (cart[msaID]) {
            updatedCart = {
              ...cart[msaID],
              amount: cart[msaID].amount + 1
            };

            setCart({
              ...cart,
              [msaID]: updatedCart
            });
          } else {
            updatedCart = {
              product,
              amount: 1,
              package_type: "individual"
            };

            setCart({
              ...cart,
              [msaID]: updatedCart
            });
          }

          const token = localStorage.getItem("token");
          console.log("cart", updatedCart);
          await axios.put(`${process.env.REACT_APP_API}/cart/item/update`, { item: updatedCart }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }}
      >
        +
      </button>
    </div>
  );
};

export default AddItemButton;