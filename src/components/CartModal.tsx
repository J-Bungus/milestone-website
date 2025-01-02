import React, { useRef, useEffect, useState, useGlobal } from "reactn";
import axios from "axios";
import { Cart, CartModalProps, Item } from "../types";
import "../assets/styles/CartModal.css";
import { useNavigate } from "react-router-dom";

const CartModal = ({ onBlur }: CartModalProps) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useGlobal("cart");
  const [loading, setLoading] = useGlobal("loading");
  const [items, setItems] = useState<Array<Item>>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log("target", target);
      if (modalRef.current && !modalRef.current.contains(target as Node) && target.className !== "cart-button" && target.className !== "cart-img") {
        onBlur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onBlur]);

  useEffect(() => {
    const fetchUserCart = async (token: string) => {
      const cartData = await axios.get(`${process.env.REACT_APP_API}/cart/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("fetched data", cartData);
      const newCart:Cart = {};
      if (cartData.data.cart) {
        setItems(cartData.data.cart.items);
        cartData.data.cart.items.map((item: Item) => {
          newCart[item.product.msa_id] = item;
        });
        setCart(newCart);
      }
    }

    const token = localStorage.getItem("token");
    if (token)
      fetchUserCart(token);
  }, []);

  const clearCart = async (msa_id?: string) => {
    const token = localStorage.getItem("token");
    if (msa_id) {
      await axios.delete(`${process.env.REACT_APP_API}/cart/item/remove/${cart[msa_id].product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const updatedCart = {...cart};
      delete updatedCart[msa_id];
      setCart(updatedCart);
      setItems(items.filter(item => item.product.msa_id !== msa_id));
    } else {
      await axios.delete(`${process.env.REACT_APP_API}/cart/remove`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCart({});
      setItems([]);
    }
  };

  return (
    <div 
      ref={modalRef}
      className="cart-modal-wrapper"
    >
      <table>
        <thead>
          <tr>
            <th style={{ border: "none" }}></th>
            <th>Name</th>
            <th>Part #</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {  items.map(item => {
            return (
              <tr>
                <td style={{ border: "none", color: "red", backgroundColor: "white" }}>
                  <span
                    onClick={() => {
                      clearCart(item.product.msa_id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    x
                  </span>
                </td>
                <td className="item-name">
                  {item.product.name}
                </td>
                <td>
                  {item.product.msa_id}
                </td>
                <td>
                  {
                    item.package_type === "individual"
                      ? `individual units (${item.product.unit_type})`
                      : item.package_type === "small"
                        ? `small package (${item.product.package_size} ${item.product.unit_type})`
                        : `big package (${item.product.package_size} ${item.product.unit_type})`
                  }
                </td>
                <td>
                  {item.amount}
                </td>
                <td>
                  {item.product.unit_type}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="action-wrapper">
        <button
          className="cart-action clear"
          onClick={() => {
            clearCart();
          }}
        >
          Clear Cart
        </button>
        <button 
          className="cart-action gen"
          disabled={!cart || (Object.values(cart).length <= 0 && items.length <= 0) || (items.length != Object.values(cart).length) }
          onClick={async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            const endpoint = `${process.env.REACT_APP_API}/invoice/generate`;
            const res = await axios.post(endpoint, { items }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            clearCart();
            setLoading(false);
            navigate("../invoice", { state: { invoice_id: res.data.invoice_id }});
          }}
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
}

export default CartModal;