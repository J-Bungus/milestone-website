import React, { useState, useEffect, useGlobal } from "reactn";
import Select from "react-select";
import { Switch } from "@material-ui/core";
import axios from "axios";

import { Category, AddCategoryProps } from "../types";
const close = require('../assets/imgs/close_icon.png');

const AddCategory = ({ closeModal, categories, editCategory, fetchUpdate }: AddCategoryProps) => {
  const [category, setCategory] = useState<Category>(
    editCategory
      ? editCategory
      : {
        id: 0,
        name: "",
        parent_id: null,
        is_leaf: true,
        order_index: -1
      }
  );
  const [isSub, setIsSub] = useState<boolean>(editCategory ? !!editCategory.parent_id : false);
  const [products, setProducts] = useState<Array<{ id: number, msa_id: string }>>([]);
  const [categoryProducts, setCategoryProducts] = useState<Array<{ value: number, label: string }>>([]);
  const [loading, setLoading] = useGlobal('loading');

  useEffect(() => {
    const fetchProducts = async () => {
      const endpoint = `${process.env.REACT_APP_API}/products/all-msa_id`;
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProducts(res.data.products);
      } catch (error) {
        console.error(error);
      }
    }

    const fetchExistingCategorization = async () => {
      if (!editCategory) {
        return;
      }

      const token = localStorage.getItem("token");
      const endpoint = `${process.env.REACT_APP_API}/products/all/category/${editCategory.id}`;
      try {
        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("use effect:", res.data);
        setCategoryProducts(res.data.products.map((product: { id: number, msa_id: string }) => ({ value: product.id, label: product.msa_id })));
      } catch (error) {
        console.error(error);
      }
    }

    const fetchInitial = async () => {
      await fetchProducts();
      await fetchExistingCategorization();
    }

    fetchInitial();
  }, []);

  return (
    <div className="password-modal-wrapper">
      <div className="password-modal">
        <div className="password-modal-heading">
          <h3>{editCategory ? "Edit" : "New"} Category</h3>
          {closeModal &&
            <img
              className="close-icon"
              src={close}
              alt="close modal"
              onClick={() => closeModal()}
            />
          }
        </div>
        <div>
          <span>Name</span>
          <input
            value={category.name}
            onChange={e => setCategory({ ...category, name: e.target.value })}
          />
        </div>

        <div>
          <span>Is this a subcategory?</span>
          <Switch
            defaultChecked={isSub}
            onClick={() => {
              if (isSub) {
                setCategory({ ...category, parent_id: null });
              }
              setIsSub(!isSub)
            }} />
        </div>
        {isSub &&
          <div>
            <div>Select Parent Category</div>
            <select
              onChange={e => {
                setCategory({ ...category, parent_id: parseInt(e.target.value) })
              }}
              value={category.parent_id ? category.parent_id : ""}
            >
              <option value="" disabled>Please select an option</option>
              {
                categories.filter(category => !category.is_leaf).map(category => <option value={category.id} >{category.name}</option>)
              }
            </select>
          </div>}

        <div>
          <span>Is this a final subcategory?</span>
          <Switch
            defaultChecked={category.is_leaf}
            onClick={() => {
              if (category.is_leaf) {
                setCategoryProducts([]);
              }

              setCategory({ ...category, is_leaf: !category.is_leaf });
            }} />
        </div>

        {
          category.is_leaf &&
          (
            <div>
              <div> Select the Products that are in this Category</div>
              <Select
                isMulti
                onChange={options => {
                  setCategoryProducts(Array.from(options));
                }}
                options={products.map(product => ({ value: product.id, label: product.msa_id }))}
                value={categoryProducts}
              />
            </div>
          )
        }

        <button
          onClick={async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            let category_id;
            if (editCategory) {
              const endpoint = `${process.env.REACT_APP_API}/category/update`;
              try {
                const res = await axios.patch(endpoint, { category }, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                category_id = res.data.category_id;
              } catch (error) {
                console.error(error);
              }
            } else {
              const endpoint = `${process.env.REACT_APP_API}/category/add`;
              try {
                const res = await axios.post(endpoint, { category: category, parent_id: category.parent_id }, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                category_id = res.data.category_id;
              } catch (error) {
                console.error(error);
              }
            }

            if (category.is_leaf) {
              const endpoint = `${process.env.REACT_APP_API}/category/categorize`;
              try {
                const res = await axios.post(endpoint, { product_ids: categoryProducts.map(product => product.value), category_id: category_id }, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
              } catch (error) {
                console.error(error);
              }
            }

            await fetchUpdate();
            closeModal();
            setLoading(false);
          }}
        >
          {editCategory ? "Update" : "Add"} Category
        </button>
      </div>
    </div>
  );
};

export default AddCategory;