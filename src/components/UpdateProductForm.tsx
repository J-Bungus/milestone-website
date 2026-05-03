import React, { useGlobal, useState, useEffect } from "reactn";
import axios, { AxiosError } from "axios";
import { Category, Product } from "../types";
import { Switch } from "@material-ui/core";
import Select from "react-select";

import "../assets/styles/AddProductForm.css";
import "../assets/styles/Account.css";

const EditProductForm = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [product, setProduct] = useState<Product>({
    id: -1,
    msa_id: "",
    name: "",
    description: "",
    unit_price: 0,
    unit_type: "pcs", 
    has_package: true, 
    has_big_package: false,
    package_price: 0,
    big_package_price: 0,
    package_size: 0,
    big_package_size: 0,
    images: [],
    categories: []
  }); 
  const [files, setFiles] = useState<Array<File>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<Category>>([])
  const [invalidText, setInvalidText] = useState<string>("");
  const [showInvalidText, setShowInvalidText] = useState<boolean>(false);
  const [loading, setLoading] = useGlobal("loading");

  type ProductKeys = Exclude<keyof Product, 'id'>;
  
  const fields: Array<{ key: ProductKeys, text: string, required: boolean }> = [
    { key: "msa_id", text: "Part #", required: true },
    { key: "name", text: "Name", required: true },
    { key: "description", text: "Description", required: true },
    { key: "has_package", text: "Has Package?", required: true },
    { key: "package_size", text: "pcs / Package", required: product.has_package },
    { key: "package_price", text: "Package Price", required: product.has_package},
    { key: "has_big_package", text: "Has Big Package?", required: true },
    { key: "big_package_size", text: "pcs / Big Package", required: product.has_big_package },
    { key: "big_package_price", text: "Big Package Price", required: product.has_big_package},
    { key: "images", text: "Gallery", required: false }, 
    { key: "categories", text: "Categories", required: false }
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
      const endpoint = `${process.env.REACT_APP_API}/products/specific/${searchTerm}`;
      const res = await axios.get(endpoint);
      
      const { fetchedProduct } = res.data;

      if (fetchedProduct) {
        setProduct(fetchedProduct);
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
    // Back to the standard AddProductForm wrapper style!
    <div className="add-product-wrapper" style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div className="product-form" style={{ position: 'relative', paddingTop: "0px" }}>
        
        {/* Sticky Header Section */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          backgroundColor: '#fff', // Prevents scrolling text from showing behind it
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
            {fields.map((field: { key: ProductKeys, text: string, required: boolean }) => {
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

              if (!product.has_package && (field.key === "package_size" || field.key === "package_price")) {
                return null;
              }

              if (!product.has_big_package && (field.key === "big_package_size" || field.key === "big_package_price")) {
                return null;
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
                          : `${process.env.REACT_APP_GCP_BUCKET_URL}/${image}`;

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
                      rows={3}
                      value={product[field.key] as string}
                      onChange={e => {
                        if (e.target.value !== "" && e.target.style.borderColor === "red") {
                          e.target.style.borderColor = "gray";
                        }
                        setProduct({...product, [field.key]: e.target.value});
                      }}
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
                        onChange={options => setProduct({...product, categories: options.map(option => option.value) as any})}
                        options={categoryOptions.map(category => ({ value: String(category.id), label: category.path || category.name }))}
                        styles={{
                          // 1. Allows the text inside the pill to wrap to multiple lines
                          multiValueLabel: (base) => ({
                            ...base,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }),
                          // 2. Ensures the pill itself doesn't try to grow wider than the main box
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
                    disabled={field.key === "msa_id"} 
                    value={product[field.key] as string | number}
                    onChange={e => {
                      if (e.target.value !== "" && e.target.style.borderColor === "red") {
                        e.target.style.borderColor = "gray";
                      }
                      setProduct({...product, [field.key]: e.target.value});
                    }}
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
            
            <button
              className="cart-action gen"
              style={{ marginTop: '20px' }}
              onClick={async () => {
                setLoading(true);
                const validSubmit = fields.reduce((acc: boolean, curr: {key: ProductKeys, text: string, required: boolean}): boolean => {
                  if (!curr.required) return acc && true;
                  return acc && (product[curr.key] !== "" && product[curr.key] !== 0);
                }, true);

                if (!validSubmit) {
                  fields.forEach((field: {key: ProductKeys, text: string, required: boolean}) => {
                    if (field.required && (product[field.key] === "" || product[field.key] === 0)) {
                      const fieldElement = document.getElementById(field.key);
                      if (fieldElement) fieldElement.style.borderColor = "red";
                    }
                  });

                  setLoading(false);
                  setInvalidText("Please fill in the missing fields!");
                  setShowInvalidText(true);
                  return;
                }

                const endpoint = `${process.env.REACT_APP_API}/products/update/${product.msa_id}`;
                const formData = new FormData();
                
                if (files.length > 0) {
                  files.forEach(file => {
                    formData.append('images', file);
                  });
                }
                
                formData.append("product", JSON.stringify(product));

                const token = localStorage.getItem("token");
                try {
                  await axios.put(endpoint, formData, {
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
                  setProduct({
                    id: -1,
                    msa_id: "",
                    name: "",
                    description: "",
                    unit_price: 0,
                    unit_type: "pcs", 
                    has_package: true, 
                    has_big_package: false,
                    package_price: 0,
                    big_package_price: 0,
                    package_size: 0,
                    big_package_size: 0,
                    images: [],
                    categories: []
                  });
                  setFiles([]);
                  setIsLoaded(false);
                  setSearchTerm("");
                }
              }}
            >
              Update Product
            </button>
            <button
                className="cart-action gen"
                style={{ 
                  margin: 0, 
                  backgroundColor: '#dc3545', // A nice danger red
                  color: 'white',
                  border: 'none',
                  flex: 0.3 // Makes the delete button slightly narrower than the update button
                }}
                onClick={async () => {
                  // 1. Force the user to confirm before doing anything destructive
                  const confirmed = window.confirm(
                    `Are you sure you want to completely delete Part #${product.msa_id}?\n\nThis will remove all associated images and cannot be undone.`
                  );
                  
                  if (!confirmed) return;

                  setLoading(true);
                  const token = localStorage.getItem("token");
                  const endpoint = `${process.env.REACT_APP_API}/products/delete/${product.msa_id}`;

                  try {
                    // 2. Fire the delete request to the backend
                    await axios.delete(endpoint, {
                      headers: { Authorization: `Bearer ${token}` }
                    });

                    // 3. Show success message
                    setInvalidText("Product deleted successfully!");
                    setShowInvalidText(true);
                    
                    // 4. Reset the form back to the blank search state after 2 seconds
                    setTimeout(() => {
                      setShowInvalidText(false);
                      setIsLoaded(false);
                      setSearchTerm("");
                    }, 2000);

                  } catch (error) {
                    console.error(error);
                    if (error instanceof AxiosError) {
                      setInvalidText(error?.response?.data?.message || "Failed to delete product");
                    } else {
                      setInvalidText("An unexpected error occurred while deleting.");
                    }
                    setShowInvalidText(true);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Delete
              </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditProductForm;