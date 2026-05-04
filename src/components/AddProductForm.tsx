import React, { useGlobal, useState, useEffect } from "reactn";
import axios, { AxiosError } from "axios";
import { Category } from "../types"; 
import { Switch } from "@material-ui/core";
import Select from "react-select";

import "../assets/styles/AddProductForm.css";
import "../assets/styles/Account.css";

const AddProductForm = () => {
  const [product, setProduct] = useState<any>({
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
    categories: []
  }); 
  const [files, setFiles] = useState<Array<File>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<Category>>([])
  const [invalidText, setInvalidText] = useState<string>("");
  const [showInvalidText, setShowInvalidText] = useState<boolean>(false);
  const [loading, setLoading] = useGlobal("loading");
  const [isError, setIsError] = useState<boolean>(false);

  const fields: Array<{ key: string, text: string }> = [
    { key: "msa_id", text: "Part #" },
    { key: "description", text: "Description" },
    { key: "unit_type", text: "Package Type" },
    { key: "package_size", text: "Amount / Package" },
    { key: "package_price", text: "Package Price" },
    { key: "has_big_package", text: "Has Big Package?" },
    { key: "big_unit_type", text: "Package Type" },
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
        console.error(error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="add-product-wrapper">
      <div className="product-form">
        {fields.map((field: { key: string, text: string }) => {
          
          if (field.key === "has_big_package") {
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
                  className="form-select"
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
                >
                  <option value="pcs/Box">pcs/Box</option>
                  <option value="pcs/Package">pcs/Pkg</option>
                  <option value="pcs/Roll">pcs/Roll</option>
                  <option value="strips/Box">strips/Box</option>
                </select>
              </div>
            );
          }

          if (field.key === "big_unit_type") {
            return (
              <div key={field.key} className="account-field">
                <span>{product.big_unit_type}</span>
                <select
                  className="form-select"
                  value={product.big_unit_type}
                  onChange={(e) => setProduct({ ...product, big_unit_type: e.target.value })}
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
                  className="form-input"
                  type="number"
                  value={product[field.key] === "" ? "" : product[field.key] as number}
                  onChange={e => setProduct({ ...product, [field.key]: e.target.value === "" ? "" : Number(e.target.value) })}
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
                      
                      const newFiles = Array.from(e.target.files);
                      const newUrls = newFiles.map(file => URL.createObjectURL(file));

                      setFiles(prevFiles => [...prevFiles, ...newFiles]);
                      setProduct((prevProduct: any) => ({
                        ...prevProduct,
                        images: [...prevProduct.images, ...newUrls]
                      }));

                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="preview-section"> 
                  { (product.images as string[]).map((image, i) => {
                    return (
                      <div key={image + i} className="preview-wrapper">
                        <img className="preview-img" src={image} alt={files[i]?.name || "Preview"}/>
                        <button
                          type="button" 
                          className="delete-image-btn"
                          onClick={() => {
                            const updatedFiles = [...files];
                            const updatedImages = [...product.images];

                            updatedFiles.splice(i, 1);
                            updatedImages.splice(i, 1);

                            setFiles(updatedFiles);
                            setProduct({ ...product, images: updatedImages });

                            URL.revokeObjectURL(image);
                          }}
                        >
                          X
                        </button>
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
                  className="description-input"
                  id={field.key}
                  rows={5}
                  value={product[field.key] as string}
                  onChange={e => setProduct({ ...product, [field.key]: e.target.value })}
                />
              </div>
            );
          }

          if (field.key === "categories") {
            return (
              <div key={field.key} className="account-field">
                <span>{field.text}</span>
                <div className="select-wrapper">
                  <Select
                    isMulti
                    value={categoryOptions.filter(category => product.categories.includes(String(category.id))).map(category => ({ value: String(category.id), label: category.path || category.name}))}
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
                className="form-input"
                type={field.key.includes('price') || field.key.includes('size') ? 'number' : 'text'}
                id={field.key}
                value={product[field.key] as string | number}
                onChange={e => setProduct({ ...product, [field.key]: e.target.value })}
              />
            </div>
          );
        })}
        
        { showInvalidText && <div style={{color: isError ? "red" : "green", marginTop: "10px"}}> {invalidText} </div>}
        
        <button
          className="cart-action gen"
          style={{ marginTop: '20px' }}
          onClick={async () => {
            setLoading(true);
            setShowInvalidText(false);

            const endpoint = `${process.env.REACT_APP_API}/products/create`;
            const formData = new FormData();
            files.forEach(file => {
              formData.append('images', file);
            });

            formData.append("product", JSON.stringify(product));

            const token = localStorage.getItem("token");
            try {
              await axios.post(endpoint, formData, {
                headers: { Authorization: `Bearer ${token}` }
              });

              setProduct({
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
                categories: []
              });
              const fileInput = document.getElementById('images') as HTMLInputElement;
              if (fileInput) fileInput.value = "";
              setFiles([]); 
              setLoading(false);
              setIsError(false);
              
              setInvalidText("Product added successfully!");
              setShowInvalidText(true);
              setTimeout(() => setShowInvalidText(false), 3000);

            } catch(error) {
              console.error(error);
              setIsError(true);
              if (error instanceof AxiosError) {
                setInvalidText(error?.response?.data?.message || "Creation failed");
              } else {
                setInvalidText("An unexpected error occurred");
              }
              setShowInvalidText(true);
              setLoading(false);
            }
          }}
        >
          Add Product
        </button>
      </div>
    </div>
  );
};

export default AddProductForm;