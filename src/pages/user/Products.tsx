import React, { useState, useEffect, useGlobal, useRef } from "reactn";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import ProductCard from "../../components/ProductCard";
import Sidebar from "../../components/Sidebar";
import "../../assets/styles/Products.css";
import { CategoryTree, Product } from "../../types";
import "../../assets/styles/Products.css";
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const Products = () => {
  // Grab the wildcard from the URL to determine if we are in a category
  const { "*": categories } = useParams();
  
  const [categoryTrees, setCategoryTrees] = useState<Array<CategoryTree>>([]);
  const [currentCategory, setCurrentCategory] = useState<CategoryTree | null>(null);
  
  // Storing breadcrumbs as an object makes building the Links much cleaner
  const [breadCrumbPath, setBreadCrumbPath] = useState<Array<{name: string, urlPath: string}>>([]);
  
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(40); 
  const [totalProducts, setTotalProducts] = useState<number>(0);
  
  const [products, setProducts] = useState<Array<Product>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useGlobal("cart");
  const navigate = useNavigate();

  // 1. Reset page and search term when navigating between categories
  useEffect(() => {
    setPage(0);
    setSearchTerm("");
    if (searchRef.current) searchRef.current.value = "";
  }, [categories]);

  // 2. Fetch the Sidebar Category Tree (Runs once)
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

  // 3. Resolve Current Category & Build Breadcrumbs
  useEffect(() => {
    // If there are no categories in the URL, we are on the default page!
    if (!categories) {
      setCurrentCategory(null);
      setBreadCrumbPath([]);
      return;
    }

    if (categoryTrees.length === 0) return;

    const categoryPathList = categories.split("/");
    let categoryLayer = categoryTrees;
    let currCategory: CategoryTree | null = null;
    const path: Array<{name: string, urlPath: string}> = [];
    let currentUrlPath = "";

    for (const catChunk of categoryPathList) {
      const decodedChunk = decodeURIComponent(catChunk);
      const [idStr] = decodedChunk.split("-");
      const id = parseInt(idStr);
      
      const categoryNode = categoryLayer.find(cat => cat.id === id);
      if (!categoryNode) break;

      currentUrlPath += `${currentUrlPath ? "/" : ""}${catChunk}`;
      path.push({ name: categoryNode.name, urlPath: currentUrlPath });
      currCategory = categoryNode;
      
      if (categoryNode.children) {
        categoryLayer = categoryNode.children;
      }
    }

    setCurrentCategory(currCategory);
    setBreadCrumbPath(path);
  }, [categories, categoryTrees]);

  // 4. Fetch Products based on Context (Category vs Global)
  useEffect(() => {
    // Prevent fetching if we are on a category URL but the category hasn't loaded yet
    if (categories && !currentCategory) return;

    // Instantly clear the old products so the user doesn't see stale data while loading
    setProducts([]);
    
    // Create an AbortController to cancel out-of-date requests
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProducts = async () => {
      try {
        let endpoint = "";
        
        if (currentCategory) {
          endpoint = `${process.env.REACT_APP_API}/products/search-in-category?page=${page}&itemsPerPage=${itemsPerPage}&category_id=${currentCategory.id}&searchTerm=${encodeURIComponent(searchTerm)}`;
        } else {
          if (searchTerm) {
            endpoint = `${process.env.REACT_APP_API}/products/search?page=${page}&itemsPerPage=${itemsPerPage}&searchTerm=${encodeURIComponent(searchTerm)}`;
          } else {
            endpoint = `${process.env.REACT_APP_API}/products/all?page=${page}&itemsPerPage=${itemsPerPage}`;
          }
        }

        // Pass the signal to the axios request
        const res = await axios.get(endpoint, { signal });
        
        setProducts(res.data.products || []);
        setTotalProducts(res.data.totalProducts || 0);
      } catch (error) {
        // Axios throws a specific error if the request was intentionally aborted
        if (axios.isCancel(error)) {
          console.log("Previous product fetch cancelled due to rapid clicking.");
        } else {
          console.error("Failed to fetch products", error);
          setProducts([]);
          setTotalProducts(0);
        }
      }
    };

    fetchProducts();

    // The Cleanup Function: aborts the request if the component re-renders
    return () => {
      controller.abort();
    };
  }, [page, itemsPerPage, searchTerm, currentCategory, categories]);

  // Error State: URL has a category, but it doesn't exist in our tree
  if (categories && !currentCategory && categoryTrees.length > 0) {
    return <div style={{ padding: '20px' }}>Category not found.</div>;
  }

  return (
    <div className="products-layout-wrapper" style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      
      <Sidebar categoryTrees={categoryTrees} navigate={navigate} />

      <div className="products-page" style={{ flex: 1, minWidth: 0, marginLeft: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Breadcrumbs - Now visible on the default page too! */}
        <div className="category-path" style={{ width: '100%', marginBottom: '20px', padding: '0 20px' }}>
          <nav>
            <Link to="/" style={{ fontWeight: 'bold', color: currentCategory ? '#333' : 'rgb(0, 206, 0)' }}> 
              Home 
            </Link>
            {breadCrumbPath.map((crumb, i) => {
              const isLast = i === breadCrumbPath.length - 1;
              return (
                <span key={i}>
                  <span style={{ margin: '0 8px', color: '#888' }}>/</span>
                  <Link 
                    to={`/products/${crumb.urlPath}`} 
                    style={{ 
                      color: isLast ? 'rgb(0, 206, 0)' : '#333', 
                      fontWeight: isLast ? 'bold' : 'normal' 
                    }}
                  > 
                    {crumb.name} 
                  </Link>
                </span>
              );
            })}
          </nav>
        </div>

        {/* Empty State / Coming Soon */}
        {products.length === 0 && searchTerm === "" ? (
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            flex: 1, width: '100%', minHeight: '40vh', color: '#555', textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>Coming Soon!</h2>
            <p style={{ fontSize: '18px', color: '#888' }}>We are currently stocking products for this section.</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="search-wrapper">
              <input
                ref={searchRef}
                className="search"
                // Dynamically changes the placeholder text based on where they are!
                placeholder={currentCategory ? `Search in ${currentCategory.name}...` : "Search all products..."}
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
                  breadCrumbPath={breadCrumbPath}
                  cart={cart}
                  setCart={setCart}
                />
              ))}
              
              {/* No Results from Search */}
              {products.length === 0 && searchTerm !== "" && (
                <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#666', fontSize: '18px' }}>
                  No products found matching "{searchTerm}".
                </div>
              )}
            </div>

            {/* Pagination */}
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

export default Products;