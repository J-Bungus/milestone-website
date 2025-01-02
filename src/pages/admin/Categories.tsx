import React, { useEffect, useState } from "reactn";
import axios from "axios";

import CategoryItem from "../../components/CategoryItem";
import AddCategory from "../../components/AddCategory";
import { Category, CategoryTree } from "../../types";
import "../../assets/styles/Category.css";

const Categories = () => {
  const [categoryTree, setCategoryTree] = useState<Array<CategoryTree>>([]);
  const [categories, setCategories] = useState<Array<Category>>([]);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const endpoint = `${process.env.REACT_APP_API}/category/fetch/all`;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategoryTree(res.data.categoryTree);
      setCategories(res.data.categories);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      { (openAdd || editCategory) && (
        <AddCategory 
          closeModal={() => {
            setOpenAdd(false);
            setEditCategory(null);
          }} 
          categories={categories} 
          editCategory={editCategory}
          fetchUpdate={fetchCategories}/>
      )}
      <div className="category-wrapper">
        <div className="category-display">
          <button onClick={() => setOpenAdd(true) }>
            + New Category
          </button>
          {
            categoryTree.map(category => 
              <CategoryItem 
                category={category} 
                key={category.id} 
                setEditCategory={setEditCategory} 
                fetchUpdate={fetchCategories}
              />)
          }
        </div>
      </div>
    </>
  );
};

export default Categories;