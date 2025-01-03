import React, { useEffect, useGlobal } from "reactn";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import AddItemButton from "./AddItemButton";
import { ProductCardProps } from "../types";
import "../assets/styles/ProductCard.css";

const ProductCard = ({ product, cart = {}, setCart }: ProductCardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate(`../`);
    }
  }, []);

  return (
    <div className="product-card-wrapper">
      <div className="product-image-wrapper">
        <div className="product-overlay">
          <button 
            className="detailed-view"
            onClick={() => navigate(`/products/specific/${product.msa_id}`, { state: { product: product } })}
          >
            Detailed View
          </button>
        </div>
        <img className="product-image" src={`${process.env.REACT_APP_GCP_BUCKET_URL}/${product.images[0]}`} alt={product.name}/>
      </div>
      <div className="part-number"><strong>Part #: </strong>{product.msa_id}</div>
      <div className="product-name">{product.name}</div>
      <AddItemButton cart={cart} setCart={setCart} product={product} />
      <div className="package-selection">
        <label htmlFor="package">
          Package Type:
        </label>
        <select 
          name="package"
          value={ cart[product.msa_id] ? cart[product.msa_id].package_type : "individual" }
          onChange={async e => {
            let updatedCart;
            const msaID = product.msa_id;
            if (cart[msaID]) {
              updatedCart = {
                ...cart[msaID],
                package_type: e.target.value
              }

            } else {
              updatedCart = {
                product,
                amount: 1,
                package_type: e.target.value
              }

            }
            const token = localStorage.getItem("token");
            await axios.put(`${process.env.REACT_APP_API}/cart/item/update`, { item: updatedCart }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setCart({ ...cart, [msaID]: updatedCart });
          }}
        >
          <option value="individual">Individual Units ({product.unit_type})</option>
          {product.has_package && <option value="small">Small Package ({product.package_size} {product.unit_type})</option>}
          {product.has_big_package && <option value="big">Big Package ({product.big_package_size} {product.unit_type})</option>}
        </select>
      </div>
    </div>
  );
}

export default ProductCard;