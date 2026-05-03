import React, { useGlobal, useEffect, useState } from "reactn";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
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
  
  const breadCrumbPath = location.state?.breadCrumbPath || [];
  
  const [product, setProduct] = useState<Product>({
    id: -1,
    msa_id: "",
    name: "",
    description: "",
    unit_price: 0,
    unit_type: "",
    big_unit_type: "",
    has_package: false,
    has_big_package: false,
    package_price: 0,
    big_package_price: 0,
    package_size: 0,
    big_package_size: 0,
    images: [],
    categories: [] 
  });

  // A single, clean useEffect that acts as our ultimate source of truth
  useEffect(() => {
    const fetchPartData = async () => {
      setLoading(true);
      
      try {
        // Always fetch fresh data using the MSA ID from the URL
        const endpoint = `${process.env.REACT_APP_API}/products/specific/${encodeURIComponent(msa_id || "")}`;
        const res = await axios.get(endpoint);
        const { fetchedProduct } = res.data;

        setProduct(fetchedProduct);
        
      } catch (error) {
        console.error("Failed to fetch product", error);
        navigate("../");
      } finally {
        setLoading(false);
      }
    };

    if (msa_id) {
      fetchPartData(); 
    }

    // Image Magnification Logic
    const timer = setTimeout(() => {
      const images = Array.from(document.querySelectorAll(".specific-img-gallery"));
      for (const image of images) {
        const element = image as HTMLElement;
        element.addEventListener("mousemove", (e: MouseEvent) => {
          if (!e.currentTarget) return;
          const target = e.currentTarget as HTMLElement;
          const { left, top, width, height } = target.getBoundingClientRect();
          const offsetX = e.clientX - left;
          const offsetY = e.clientY - top;

          const backgroundPositionX = (offsetX / width) * 100;
          const backgroundPositionY = (offsetY / height) * 100;

          requestAnimationFrame(() => {
            target.style.transform = "scale(2.5)";
            target.style.transformOrigin = `${backgroundPositionX}% ${backgroundPositionY}%`;
          });
        });

        element.addEventListener("mouseleave", (e: MouseEvent) => {
          if (!e.currentTarget) return;
          const target = e.currentTarget as HTMLElement;
          target.style.transform = 'scale(1)';
          target.style.backgroundPosition = 'center';
        });
      } 
    }, 200);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      const images = Array.from(document.querySelectorAll(".specific-img-gallery"));
      for (const image of images) {
        image.removeEventListener("mousemove", () => {});
        image.removeEventListener("mouseleave", () => {});
      }
    };
  }, [msa_id, navigate, setLoading]); // Now only depends on the URL parameter!

  return (
    <div>
      <div className="category-path" style={{ width: '100%', marginBottom: '20px', padding: '20px 40px 0 40px' }}>
        <nav>
          <Link to="/" style={{ fontWeight: 'bold', color: '#333' }}> 
            Home 
          </Link>
          {breadCrumbPath.map((crumb: {name: string, urlPath: string}, i: number) => {
            return (
              <span key={i}>
                <span style={{ margin: '0 8px', color: '#888' }}>/</span>
                <Link 
                  to={`/products/${crumb.urlPath}`} 
                  style={{ color: '#333', fontWeight: 'normal' }}
                > 
                  {crumb.name} 
                </Link>
              </span>
            );
          })}
          <span>
            <span style={{ margin: '0 8px', color: '#888' }}>/</span>
            {/* The active product breadcrumb */}
            <Link 
              to={`/product-details/${product.msa_id}`}
              state={{ breadCrumbPath }} 
              style={{ color: 'rgb(0, 206, 0)', fontWeight: 'bold' }}
            > 
              {product.msa_id} 
            </Link>
          </span>
        </nav>
      </div>
      <div className="specific-product-page">
        <div className="left-column">
          <ImageGallery 
            items={product.images.map((image: string) => ({ 
              original: `${process.env.REACT_APP_GCP_BUCKET_URL}/${encodeURIComponent(image || "")}`,
              thumbnail: `${process.env.REACT_APP_GCP_BUCKET_URL}/${encodeURIComponent(image || "")}`,
              originalClass: "specific-img-gallery"
            }))}
            showPlayButton={false}
            showFullscreenButton={false}
            autoPlay={false}
          />
        </div>
        <div className="right-column">
          {/* {<div className="specific-item-name">{product.name}</div>} */}
          <div className="specific-item-name"><span>Part #:</span> {product.msa_id}</div>
          
          {/* Categories are just read straight out of the fresh product data! */}
          <div className="category-tags">
            {product.categories.map((category, index) => (
              <Chip key={index} label={category}/>
            ))}
          </div>

          <div className="part-info-section">
            <div className="package-types"><span>Available in: </span> <br/>
              <div >
                {product.has_package && `${
                  product.unit_type.includes("Package") 
                    ? "Small Package"
                    : product.unit_type.includes("Box")
                      ? "Boxes"
                      : "Rolls"
                } (${product.package_size} ${product.unit_type})`} <br/>
                {product.has_big_package && `${
                  product.big_unit_type.includes("Package")
                    ? "Big Package"
                    : "Cases"
                } (${product.big_package_size} ${product.unit_type})`}
              </div>
            </div>
            <section>
              <div className="part-info">
                <span><b>Description:</b></span><br/>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecificProduct;