import React, { useState, useGlobal, useEffect } from "reactn";
import { FaChevronDown, FaChevronRight, FaRegEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

import { CategoryItemProps } from "../types";

const CategoryItem = ({ category, setEditCategory, fetchUpdate }: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useGlobal("loading");
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (!category.children || category.children.length === 0) {
      setIsExpanded(false);
    }
  }, [category]);
  
  return (
    <div className={`category ${category.parent_id ? "sub-category" : ""}`}>
      <div className="category-heading">
        {category.children && category.children.length > 0 && (
          <span onClick={toggleExpand} style={{ marginRight: "8px" }}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}

        <span>{category.name} </span>
        <span onClick={() => setEditCategory(category) } style={{padding: "0px 20px"}}>
          <FaRegEdit/>
        </span>
        <span onClick={async () => {
          setLoading(true);
          const token = localStorage.getItem("token");
          const endpoint = `${process.env.REACT_APP_API}/category/delete/${category.id}`;
          await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          await fetchUpdate();
          setLoading(false);
        }}>
          <FaTrash/>
        </span>
      </div>
      {isExpanded && category.children && (
        <div
          className="category-children"
        >
          {category.children && category.children.map((child, i) => (
            <CategoryItem key={child.id} category={child} setEditCategory={setEditCategory} fetchUpdate={fetchUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;