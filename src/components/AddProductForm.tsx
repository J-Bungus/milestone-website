import React, { useGlobal, useState, useEffect } from "reactn";
import axios, { AxiosError} from "axios";
import { Category, Product } from "../types";
import { Switch } from "@material-ui/core";
import Select from "react-select";

import "../assets/styles/AddProductForm.css";
import "../assets/styles/Account.css";
import { LocalLaundryService } from "@material-ui/icons";

const AddProductForm = () => {
  const [product, setProduct] = useState<Product>({
    msa_id: "",
    name: "",
    description: "",
    unit_price: 0,
    unit_type: "pcs", // <-- Hardcoded default
    has_package: true, // <-- Turned ON by default
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

  type ProductKeys = Exclude<keyof Product, 'id'>
  // REMOVED 'unit_type' and 'unit_price' from this array!
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
    { key: "images", text: "Gallery", required: true },
    { key: "categories", text: "Categories", required: false }
  ];

  useEffect(() => {
    const fetchCategories = async() => {
      const token = localStorage.getItem("token");
      const endpoint = `${process.env.REACT_APP_API}/category/fetch/all/leaf-paths`;
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCategoryOptions(res.data.categories);
    }

    fetchCategories();
  }, []);

  return (
    <div className="add-product-wrapper">
      <div className="product-form">
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
                      if (!e.target.files) {
                        return;
                      }

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
                    return (
                      <div key={image + i} className="preview-wrapper">
                        <img className="preview-img" src={image} alt={files[i].name}/>
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
  
                    setProduct({
                      ...product,
                      [field.key]: e.target.value
                    });
                  }}
                />
              </div>
            );
          }

          if (field.key === "categories") {
            return (
              <div key={field.key} className="account-field">
                <span>{field.text}</span>
                <div style={{ width: "100%"}}>
                  <Select
                    isMulti
                    onChange={options => setProduct({...product, categories: options.map(option => option.value ) as any})}
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
                type="text"
                id={field.key}
                value={product[field.key] as string | number}
                onChange={e => {
                  if (e.target.value !== "" && e.target.style.borderColor === "red") {
                    e.target.style.borderColor = "gray";
                  }

                  setProduct({
                    ...product,
                    [field.key]: e.target.value
                  });
                }}
              />
            </div>
          );
        })}
        { showInvalidText && <div style={{color: "red"}}> {invalidText} </div>}
        <button
          className="cart-action gen"
          onClick={async () => {
            setLoading(true);
            const validSubmit = fields.reduce((acc: boolean, curr: {key: ProductKeys, text: string, required: boolean}): boolean => {
              if (!curr.required) {
                return acc && true;
              }

              return acc && (product[curr.key] !== "" && product[curr.key] !== 0);
            }, true);

            if (!validSubmit) {
              fields.forEach((field: {key: ProductKeys, text: string, required: boolean}) => {
                if (field.required && (product[field.key] === "" || product[field.key] === 0)) {
                  const fieldElement = document.getElementById(field.key);
                  if (fieldElement) {
                    fieldElement.style.borderColor = "red";
                  }
                }
              });

              setLoading(false);
              setInvalidText("Please fill in the missing fields!");
              setShowInvalidText(true);
              return;
            }

            const endpoint = `${process.env.REACT_APP_API}/products/create`;
            const formData = new FormData();
            files.forEach(file => {
              formData.append('images', file);
            });

            formData.append("product", JSON.stringify(product));

            const token = localStorage.getItem("token");
            try {
              const res = await axios.post(endpoint, formData, {
                headers: {  
                  Authorization: `Bearer ${token}`
                }
              });

              // Reset form with the new defaults
              setProduct({
                msa_id: "",
                name: "",
                description: "",
                unit_price: 0,
                unit_type: "pcs", // <-- Reset to pcs
                has_package: true, // <-- Reset to true
                has_big_package: false,
                package_price: 0,
                big_package_price: 0,
                package_size: 0,
                big_package_size: 0,
                images: [],
                categories: []
              });
              setFiles([]); // Clear out the files state too!
              setShowInvalidText(false);
              setLoading(false);
            } catch(error) {
              console.error(error);
              if (error instanceof AxiosError) {
                setInvalidText(error?.response?.data?.message);
                const fieldElement = document.getElementById("username");
                if (fieldElement) {
                  fieldElement.style.borderColor = "red";
                }
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