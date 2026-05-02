import React, { useState, useEffect, useGlobal, useRef } from "reactn";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import ProductCard from "../../components/ProductCard";
import "../../assets/styles/Products.css";
import { CategoryTree, Product, Cart, Item } from "../../types";
import Sidebar from "../../components/Sidebar";

const CategoryProducts = () => {
  const { "*": categories } = useParams();
  const categoryPath = categories ? categories.split("/") : [];
  
  const [currentCategory, setCurrentCategory] = useState<CategoryTree | null>(null);
  const [categoryTrees, setCategoryTrees] = useState<Array<CategoryTree>>([]);
  const [breadCrumb, setBreadCrumb] = useState<Array<string>>([]);
  
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(40); 
  const [totalProducts, setTotalProducts] = useState<number>(0);
  
  const [products, setProducts] = useState<Array<Product>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useGlobal("cart");
  const navigate = useNavigate();

  useEffect(() => {
    setPage(0);
  }, [categories]);

  useEffect(() => {
    if (categoryTrees.length === 0) return;

    const fetchProducts = async (category: CategoryTree | null) => {
      if (!category) return;

      const endpoint = `${process.env.REACT_APP_API}/products/search-in-category?page=${page}&itemsPerPage=${itemsPerPage}&category_id=${category.id}&searchTerm=${searchTerm}`;
      try {
        const res = await axios.get(endpoint);
        setProducts(res.data.products);
        setTotalProducts(res.data.totalProducts);
      } catch (error) {
        console.error("Failed to fetch category products", error);
      }
    };

    let categoryLayer = categoryTrees;
    let currCategory = null;
    const path = [];
    
    for (const category of categoryPath) {
      const decodedCategory = decodeURIComponent(category);
      const [id, name] = decodedCategory.split("-");
      const categoryNode = categoryLayer.filter(cat => cat.id === parseInt(id))[0];
      
      if (!categoryNode) break;

      path.push(categoryNode.name);
      currCategory = categoryNode;
      
      if (categoryNode.children) {
        categoryLayer = categoryNode.children;
      }
    }

    if (currCategory) {
      setCurrentCategory(currCategory);
      setBreadCrumb(path);
      fetchProducts(currCategory);
    }

  }, [categoryTrees, categories, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const endpoint = `${process.env.REACT_APP_API}/category/fetch/all`;
        const res = await axios.get(endpoint);
        setCategoryTrees(res.data.categoryTree);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  if (!currentCategory && categoryTrees.length > 0) {
    return <div style={{ padding: '20px' }}>Category not found.</div>;
  }

  return (
    <div className="products-layout-wrapper" style={{ display: 'flex', alignItems: 'flex-start', width: '100%', overflowX: 'hidden' }}>
      
      <Sidebar categoryTrees={categoryTrees} navigate={navigate} />

      <div className="products-page" style={{ flex: 1, minWidth: 0, marginLeft: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Breadcrumbs */}
        <div className="category-path" style={{ width: '100%', marginBottom: '20px', padding: '0 20px' }}>
          <nav>
            <Link to="/products" style={{ fontWeight: 'bold', color: '#333' }}> Home </Link>
            {breadCrumb.map((crumb, i) => (
              <span key={i}>
                <span style={{ margin: '0 8px', color: '#888' }}>/</span>
                <Link to={`/products/category/${categoryPath.slice(0, i + 1).join("/")}`} style={{ color: '#333' }}> 
                  {crumb} 
                </Link>
              </span>
            ))}
          </nav>
        </div>

        {products.length === 0 && searchTerm === "" ? (
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1, /* Pushes it to take up the remaining vertical space */
            width: '100%',
            minHeight: '40vh',
            color: '#555',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>Coming Soon!</h2>
            <p style={{ fontSize: '18px', color: '#888' }}>We are currently stocking products for this category.</p>
          </div>

        ) : (
          
          <>
            {/* Search Bar */}
            <div className="search-wrapper">
              <input
                ref={searchRef}
                className="search"
                placeholder="Search within category..."
                type="text"
                onChange={e => {
                  if (e.target.value === "") setSearchTerm("");
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchRef.current) {
                    setSearchTerm(searchRef.current.value);
                    setPage(0); 
                  }
                }}
              />
              <button
                type="button"
                className="search-button"
                onClick={() => {
                  if (searchRef.current) {
                    setSearchTerm(searchRef.current.value);
                    setPage(0);
                  } else {
                    setSearchTerm("");
                  }
                }}
              >
                Search
              </button>
            </div>

            {/* Products Grid */}
            <div className="products-wrapper">
              {products.map(product => (
                <ProductCard
                  key={product.id || product.msa_id}
                  product={product}
                  cart={cart}
                  setCart={setCart}
                />
              ))}
              
              {/* If they searched for something that doesn't exist, show this instead */}
              {products.length === 0 && searchTerm !== "" && (
                <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', fontSize: '18px' }}>
                  No products found matching "{searchTerm}".
                </div>
              )}
            </div>

            {/* PAGINATION COMPONENT */}
            {totalProducts > 0 && (
              <div className="paginate-wrapper">
                <ReactPaginate
                  pageCount={Math.ceil(totalProducts / itemsPerPage) || 1}
                  pageRangeDisplayed={1}
                  marginPagesDisplayed={1}
                  forcePage={page}
                  onPageChange={e => {
                    setPage(e.selected);
                    window.scrollTo(0, 0); 
                  }}
                />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default CategoryProducts;