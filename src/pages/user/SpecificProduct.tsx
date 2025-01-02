import React, { useGlobal, useEffect, useState } from "reactn";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ImageGallery from "react-image-gallery";
import { Chip } from "@material-ui/core";

import "../../assets/styles/SpecificProduct.css";
import { Product } from "../../types";

const SpecificProduct = () => {
  const location = useLocation();
  const { msa_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useGlobal("loading");
  const [labeledInfo, setLabeledInfo] = useState<Array<{label: string, value: string}>>([]);
  const [unlabeledInfo, setUnlabeledInfo] = useState<Array<string>>([]);
  const [product, setProduct] = useState<Product>({
    id: -1,
    msa_id: "",
    name: "",
    description: "",
    unit_price: 0,
    unit_type: "",
    has_package: false,
    has_big_package: false,
    package_price: 0,
    big_package_price: 0,
    package_size: 0,
    big_package_size: 0,
    images: [],
    categories: []
  });

  useEffect(() => {
    const fetchPartData = async () => {
      setLoading(true);

      if (location.state) {
        console.log(location.state.product);
        location.state.product.description.split(',').map((info: string) => {
          const isLabeled = info.split(':').length === 2;
      
          if (isLabeled) {
            const formattedInfo = {
              label: info.split(':')[0],
              value: info.split(':')[1]
            };
            
            setLabeledInfo(labeledInfo => [...labeledInfo, formattedInfo]);
          } else {
            setUnlabeledInfo(unlabeledInfo => [...unlabeledInfo, info]);
          }
        });

        setProduct(location.state.product);
      } else {
        const token = localStorage.getItem("token");
        const endpoint = `${process.env.REACT_APP_API}/products/specific/${msa_id}`;
        try {
          const res = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const { fetchedProduct } = res.data;
          console.log(fetchedProduct);
          fetchedProduct.description.split(",").map((info: string) => {
            const isLabeled = info.split(':').length === 2;
      
            if (isLabeled) {
              const formattedInfo = {
                label: info.split(':')[0],
                value: info.split(':')[1]
              };
              
              setLabeledInfo(labeledInfo => [...labeledInfo, formattedInfo]);
            } else {
              setUnlabeledInfo(unlabeledInfo => [...unlabeledInfo, info]);
            }
          });

          setProduct(fetchedProduct);
        } catch (error) {
          console.error(error);
          setLoading(false);
          navigate("../");
        }
      }

      setLoading(false);
    }

    fetchPartData(); 

    setTimeout(() => {
      const images = Array.from(document.querySelectorAll(".specific-img-gallery"));
      console.log(images);
      for (const image of images) {
        const element = image as HTMLElement;
        console.log(element);
        element.addEventListener("mousemove", (e: MouseEvent) => {
          if (!e.currentTarget) {
            return;
          }
          const target = e.currentTarget as HTMLElement;
          const { left, top, width, height } = target.getBoundingClientRect();
          const offsetX = e.clientX - left;
          const offsetY = e.clientY - top;

          const backgroundPositionX = (offsetX / width) * 100;
          const backgroundPositionY = (offsetY / height) * 100;

          requestAnimationFrame(() => {
            target.style.transform = "scale(2.5)";
            target.style.transformOrigin = `${backgroundPositionX}% ${backgroundPositionY}%`
          });
        });

        element.addEventListener("mouseleave", (e: MouseEvent) => {
          if (!e.currentTarget) {
            return;
          }

          const target = e.currentTarget as HTMLElement;
          target.style.transform = 'scale(1)';
          target.style.backgroundPosition = 'center';
        });
      } 
    }, 200);
    return () => {
      const images = Array.from(document.querySelectorAll(".specific-img-gallery"));
      for (const image of images) {
        image.removeEventListener("mousemove", () => {});
        image.removeEventListener("mouseleave", () => {});
      }
    }
  }, []);

  return (
    <div className="specific-product-page">
      <div className="left-column">
        <ImageGallery 
          items={product.images.map((image: string) => ({ 
            original: `${process.env.REACT_APP_GCP_BUCKET_URL}/${image}`,
            originalClass: "specific-img-gallery"
          }))}
        />
      </div>
      <div className="right-column">
        <div className="specific-item-name">{product.name}</div>
        <div className="specific-part-number"><span>Part #:</span> {product.msa_id}</div>
        <div className="category-tags">
          {
            product.categories.map(category => (<Chip label={category}/>))
          }
        </div>
        <div className="part-info-section">
          <div className="package-types"><span>Available in: </span> Individual Units ({ product.unit_type })
            {
              product.has_package && `, Small Package (${product.package_size} ${product.unit_type})`
            }
            {
              product.has_big_package && `, Big Package (${product.big_package_size} ${product.unit_type})`
            }
          </div>
          {
            labeledInfo.map(info => (
              <div key={info.label + info.value} className="part-info-row">
                <span className="row-label">{info.label}</span>
                <span className="row-value">{info.value}</span>
              </div>
            ))
          }
          {
            unlabeledInfo.length > 0 && (
              <div className="part-info-row">
                <span className="row-label">Additional Info</span>
                <span className="row-value">{unlabeledInfo.join(", ")}</span>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default SpecificProduct;