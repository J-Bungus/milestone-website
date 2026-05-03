import React, { useGlobal, useState, useEffect } from "reactn";
import axios, { AxiosError } from "axios";
import { Category } from "../types";
import { Switch } from "@material-ui/core";
import Select from "react-select";

import "../assets/styles/AddProductForm.css";
import "../assets/styles/Account.css";

const EditProductForm = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Switched to <any> to support the new big_unit_type without strict type errors
  const [product, setProduct] = useState<any>({
    id: -1,
    msa_id: "",
    name: "N/A", 
    description: "",
    unit_price: 0,
    unit_type: "pcs/Box", 
    big_unit_type: "bxs/Case",
    has_package: true, 
    has_big_package: false,
    package_price: 0,
    big_package_price: 0,
    package_size: 0,
    big_package_size: 0,
    images: [],
    categories: [],
    category_ids: []
  }); 
  const [files, setFiles] = useState<Array<File>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<Category>>([])
  const [invalidText, setInvalidText] = useState<string>("");
  const [showInvalidText, setShowInvalidText] = useState<boolean>(false);
  const [loading, setLoading] = useGlobal("loading");
  
  // Matched to the AddProductForm fields
  const fields: Array<{ key: string, text: string }> = [
    { key: "msa_id", text: "Part #" },
    { key: "description", text: "Description" },
    { key: "has_package", text: "Has Package?" },
    { key: "unit_type", text: "Package Type" },
    { key: "package_size", text: "Amount / Package" },
    { key: "package_price", text: "Package Price" },
    { key: "has_big_package", text: "Has Big Package?" },
    { key: "big_unit_type", text: "Big Package Type" },
    { key: "big_package_size", text: "Amount / Big Package" },
    { key: "big_package_price", text: "Big Package Price" },
    { key: "images", text: "Gallery" }, 
    { key: "categories", text: "Categories" }
  ];

  useEffect(() => {
    const fetchCategories = async() => {
      const token = localStorage.getItem("token");
      const endpoint = `${process.env.REACT_APP_API}/category/fetch/all/leaf-paths`;
      try {
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategoryOptions(res.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    }
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setShowInvalidText(false);

    try {
      const endpoint = `${process.env.REACT_APP_API}/products/specific/${encodeURIComponent(searchTerm)}`;
      const res = await axios.get(endpoint);
      
      const { fetchedProduct } = res.data;

      if (fetchedProduct) {
        setProduct({
          ...fetchedProduct,
          // Fallbacks just in case the old product data doesn't have these exact fields yet
          unit_type: fetchedProduct.unit_type || "pcs/Box",
          big_unit_type: fetchedProduct.big_unit_type || "bxs/Case"
        });
        setIsLoaded(true);
        setFiles([]); 
      }
    } catch (error) {
      console.error(error);
      setInvalidText("Product not found. Please check the Part #.");
      setShowInvalidText(true);
      setIsLoaded(false);
    }
    setLoading(false);
  };

  return (
    <div className="add-product-wrapper" style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div className="product-form" style={{ position: 'relative', paddingTop: "0px" }}>
        
        {/* Sticky Header Section */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          backgroundColor: '#fff', 
          zIndex: 100, 
          width: '100%',
          paddingTop: '30px',
          paddingBottom: '20px', 
          marginBottom: '20px',
          borderBottom: isLoaded ? '1px solid #eee' : 'none',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Edit Product</h2>
          <div className="account-field" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Enter Part # to edit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, boxSizing: 'border-box' }}
            />
            <button 
              className="cart-action gen" 
              style={{ margin: 0, width: 'auto', padding: '10px 20px' }}
              onClick={handleSearch}
            >
              Find Part
            </button>
          </div>
        </div>

        {/* Dynamic Form Body Section */}
        {isLoaded && (
          <>
            {fields.map((field: { key: string, text: string }) => {
              if (field.key === "has_package" || field.key === "has_big_package") {
                return (
                  <div key={field.key} className="account-field">
                    <span>{field.text}</span>
                    <div className="switch-wrapper">
                      <Switch
                        checked={product[field.key] as boolean}
                        onChange={() => {
                          if (field.key === "has_package" && product[field.key]) {
                            setProduct({
                              ...product,
                              has_big_package: false,
                              has_package: !product.has_package
                            })
                          } else {
                            setProduct({...product, [field.key]: !product[field.key]})
                          }
                        }}
                        disabled={field.key === "has_big_package" ? !product.has_package : false}
                      />
                    </div>
                  </div>
                );
              }

              if (!product.has_package && (field.key === "package_size" || field.key === "package_price" || field.key === "unit_type")) {
                return null;
              }

              if (!product.has_big_package && (field.key === "big_package_size" || field.key === "big_package_price" || field.key === "big_unit_type")) {
                return null;
              }

              if (field.key === "unit_type") {
                return (
                  <div key={field.key} className="account-field">
                    <span>{field.text}</span>
                    <select
                      value={product.unit_type}
                      onChange={(e) => {
                        const newUnit = e.target.value;
                        let newBigUnit = product.big_unit_type;
                        let hasBigPackage = product.has_big_package;

                        if (newUnit.includes("Box")) newBigUnit = "bxs/Case";
                        if (newUnit.includes("Package")) newBigUnit = "pcs/Big Package";
                        if (newUnit.includes("Roll")) hasBigPackage = false;
    
                        setProduct({
                          ...product,
                          unit_type: newUnit,
                          big_unit_type: newBigUnit,
                          has_big_package: hasBigPackage
                        });
                      }}
                      style={{ padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                      <option value="pcs/Box">pcs/Box</option>
                      <option value="pcs/Package">pcs/Package</option>
                      <option value="pcs/Roll">pcs/Roll</option>
                      <option value="strips/Box">strips/Box</option>
                    </select>
                  </div>
                );
              }
    
              if (field.key === "big_unit_type") {
                return (
                  <div key={field.key} className="account-field">
                    <span>{field.text}</span>
                    <select
                      value={product.big_unit_type}
                      onChange={(e) => setProduct({ ...product, big_unit_type: e.target.value })}
                      style={{ padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                      <option value="pcs/Big Package">pcs / Big pkg</option>
                      <option value="bxs/Case">bxs/Case</option>
                    </select>
                  </div>
                );
              }

              if (field.key === "package_size" || field.key === "big_package_size") {
                return (
                  <div key={field.key} className="account-field">
                    <span>{field.key === "package_size" ? product.unit_type : product.big_unit_type}</span>
                    <input  
                      type="number"
                      value={product[field.key] as number}
                      onChange={e => setProduct({ ...product, [field.key]: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                  </div>
                );
              }

              if (field.key === "images") {
                return (
                  <div key={field.key}>
                    <div className="account-field">
                      <span>{field.text}</span>
                      <input
                        className="image-input"
                        type="file"
                        id={field.key}
                        multiple
                        onChange={e => {
                          if (!e.target.files) return;

                          const filesList = Array.from(e.target.files);
                          setFiles(filesList);
                          setProduct({
                            ...product,
                            images: filesList.map(file => URL.createObjectURL(file))
                          });
                        }}
                      />
                    </div>
                    <div className="preview-section"> 
                      { (product.images as string[]).map((image, i) => {
                        const imgSrc = image.startsWith('blob:') 
                          ? image 
                          : `${process.env.REACT_APP_GCP_BUCKET_URL}/${encodeURIComponent(image || "")}`;

                        return (
                          <div key={image + i} className="preview-wrapper">
                            <img className="preview-img" src={imgSrc} alt="Product Preview"/>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              if (field.key === "description") {
                return (
                  <div key={field.key} className="account-field description">
                    <span>{field.text}</span>
                    <textarea
                      id={field.key}
                      rows={4} // Matched to AddProductForm
                      value={product[field.key] as string}
                      onChange={e => setProduct({...product, [field.key]: e.target.value})}
                      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                );
              }

              if (field.key === "categories") {
                return (
                  <div key={field.key} className="account-field">
                    <span>{field.text}</span>
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                      <Select
                        isMulti
                        value={categoryOptions
                          .filter(cat => product.category_ids?.includes(cat.id))
                          .map(cat => ({ value: String(cat.id), label: cat.path || cat.name }))
                        }
                        onChange={options => setProduct({...product, categories: options.map(option => option.value) })}
                        options={categoryOptions.map(category => ({ value: String(category.id), label: category.path || category.name }))}
                        styles={{
                          multiValueLabel: (base) => ({
                            ...base,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }),
                          multiValue: (base) => ({
                            ...base,
                            maxWidth: '100%',
                            height: 'auto',
                          })
                        }}
                      />
                    </div>
                  </div>
                )
              }

              return (
                <div key={field.key} className="account-field">
                  <span>{field.text}</span>
                  <input
                    type={field.key.includes('price') || field.key.includes('size') ? 'number' : 'text'}
                    id={field.key}
                    disabled={field.key === "msa_id"} // Important so they can't change the primary identifier!
                    value={product[field.key] as string | number}
                    onChange={e => setProduct({...product, [field.key]: e.target.value})}
                    style={{ 
                      backgroundColor: field.key === "msa_id" ? "#f5f5f5" : "white",
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              );
            })}
            
            { showInvalidText && <div style={{color: "red", marginTop: "10px"}}> {invalidText} </div>}
            
            {/* Action Buttons Container */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              
              <button
                className="cart-action gen"
                style={{ margin: 0, flex: 1 }}
                onClick={async () => {
                  setLoading(true);
                  setShowInvalidText(false);

                  // Ensure we hit the patch endpoint for updates!
                  const endpoint = `${process.env.REACT_APP_API}/products/update/${encodeURIComponent(product.msa_id || "")}`;
                  const formData = new FormData();
                  
                  if (files.length > 0) {
                    files.forEach(file => {
                      formData.append('images', file);
                    });
                  }
                  
                  formData.append("product", JSON.stringify(product));

                  const token = localStorage.getItem("token");
                  try {
                    await axios.patch(endpoint, formData, {
                      headers: { Authorization: `Bearer ${token}` }
                    });

                    setInvalidText("Product updated successfully!");
                    setShowInvalidText(true);
                    setTimeout(() => setShowInvalidText(false), 3000); 
                    
                  } catch(error) {
                    console.error(error);
                    if (error instanceof AxiosError) {
                      setInvalidText(error?.response?.data?.message || "Update failed");
                    } else {
                      setInvalidText("An unexpected error occurred");
                    }
                    setShowInvalidText(true);
                  } finally {
                    setLoading(false);
                    // Clear the form after a successful update
                    setProduct({
                      id: -1,
                      msa_id: "",
                      name: "N/A",
                      description: "",
                      unit_price: 0,
                      unit_type: "pcs/Box", 
                      big_unit_type: "bxs/Case",
                      has_package: true, 
                      has_big_package: false,
                      package_price: 0,
                      big_package_price: 0,
                      package_size: 0,
                      big_package_size: 0,
                      images: [],
                      categories: [],
                      category_ids: []
                    });
                    setFiles([]);
                    setIsLoaded(false);
                    setSearchTerm("");
                  }
                }}
              >
                Update Product
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditProductForm;