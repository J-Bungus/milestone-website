import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Category, CategoryTree, Product } from '../types'; 
import '../assets/styles/AddCategory.css'; 

interface FlatCategory {
  id: number;
  displayName: string;
  is_leaf: boolean | string;
}

interface AddCategoryProps {
  closeModal: () => void;
  categories: any[]; 
  editCategory: any | null; 
  fetchUpdate: () => Promise<void> | void;
}

const AddCategory: React.FC<AddCategoryProps> = ({ 
  closeModal, 
  categories, 
  editCategory, 
  fetchUpdate 
}) => {
  // --- Standard Form State ---
  const [dropdownCategories, setDropdownCategories] = useState<FlatCategory[]>([]);
  const [name, setName] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [isLeaf, setIsLeaf] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // --- Product Multi-Select State ---
  const [defaultProducts, setDefaultProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const multiSelectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Categories AND Default Products on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch Categories
        const catRes = await axios.get(`${process.env.REACT_APP_API}/category/fetch/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (catRes.data && catRes.data.categoryTree) {
          const flatList: FlatCategory[] = [];
          const flattenTree = (nodes: CategoryTree[], prefix: string = "") => {
            nodes.forEach(node => {
              flatList.push({ id: node.id, displayName: `${prefix}${node.name}`, is_leaf: node.is_leaf });
              if (node.children && node.children.length > 0) {
                flattenTree(node.children, `${prefix}${node.name} > `);
              }
            });
          };
          flattenTree(catRes.data.categoryTree);
          setDropdownCategories(flatList);
        }

        // Fetch Default Products (so the menu isn't empty on first click)
        const prodRes = await axios.get(`${process.env.REACT_APP_API}/products/all?page=0&itemsPerPage=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (prodRes.data && prodRes.data.products) {
          setDefaultProducts(prodRes.data.products);
        }

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    
    fetchInitialData();
  }, []);

  // 2. Pre-fill form if editing
  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setParentId(editCategory.parent_id ? String(editCategory.parent_id) : '');
      setIsLeaf(editCategory.is_leaf === 'true');
      
      // If it's a leaf category, fetch the products assigned to it!
      if (editCategory.is_leaf === 'true' || editCategory.is_leaf === true) {
        const fetchExistingProducts = async () => {
          try {
            const token = localStorage.getItem("token");
            
            // NOTE: Make sure this URL matches your actual endpoint for fetching products by category!
            const res = await axios.get(`${process.env.REACT_APP_API}/products/all/category/${editCategory.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Populate the pills with the fetched products
            if (res.data && res.data.products) {
              console.log(res.data.products);
              setSelectedProducts(res.data.products);
            }
          } catch (error) {
            console.error("Failed to load existing products:", error);
          }
        };
        
        fetchExistingProducts();
      }
    } else {
      // Reset form if we are just adding a new category
      setName('');
      setParentId('');
      setIsLeaf(false);
      setSelectedProducts([]);
    }
  }, [editCategory]);

  // 3. Handle Live Search (only triggers if they actually type something)
  useEffect(() => {
    const searchApi = async () => {
      if (productSearch.length < 2) {
        setSearchResults([]); // Revert to default list if search is empty
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API}/products/search?page=0&itemsPerPage=50&searchTerm=${productSearch}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.products) setSearchResults(res.data.products);
      } catch (error) {
        console.error("Failed to search products", error);
      }
    };

    const timeoutId = setTimeout(() => searchApi(), 300);
    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  // 4. Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (multiSelectRef.current && !multiSelectRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Helpers for the Multi-Select UI ---
  const displayProducts = productSearch.length >= 2 ? searchResults : defaultProducts;
  const availableOptions = displayProducts.filter(
    (p) => !selectedProducts.find(sp => sp.msa_id === p.msa_id)
  );

  const handleAddProduct = (product: Product) => {
    setSelectedProducts([...selectedProducts, product]);
    setProductSearch(''); // Clear search so they can type the next one
    searchInputRef.current?.focus(); // Keep focus on input
  };

  const handleRemoveProduct = (productId: number | undefined) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');

    try {
      const token = localStorage.getItem("token");
      let categoryId = null;

      // 1. ADD OR UPDATE THE CATEGORY
      if (editCategory) {
        // The PATCH /update endpoint expects everything inside the 'category' object
        const updatePayload = {
          category: {
            id: editCategory.id,
            name: name,
            is_leaf: isLeaf ? 'true' : 'false',
            parent_id: parentId === '' ? null : parseInt(parentId, 10)
          }
        };

        await axios.patch(`${process.env.REACT_APP_API}/category/update`, updatePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        categoryId = editCategory.id;
      } else {
        // The POST /add endpoint expects 'category' and 'parent_id' separated
        const addPayload = {
          category: {
            name: name,
            is_leaf: isLeaf ? 'true' : 'false'
          },
          parent_id: parentId === '' ? null : parseInt(parentId, 10)
        };

        const res = await axios.post(`${process.env.REACT_APP_API}/category/add`, addPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Grab the newly created ID from the response so we can attach products to it
        categoryId = res.data.category_id;
      }

      // 2. ASSIGN PRODUCTS (If applicable)
      // Removed the length > 0 check so it sends empty arrays to the backend!
      if (isLeaf && categoryId) {
        const productIds = selectedProducts.map(p => p.id);
        
        const categorizePayload = {
          category_id: categoryId,
          product_ids: productIds 
        };

        await axios.post(`${process.env.REACT_APP_API}/category/categorize`, categorizePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setStatusMessage('Category saved successfully!');
      await fetchUpdate(); // Refresh the table
      closeModal();        // Close the UI
      
    } catch (error) {
      console.error("Failed to save category:", error);
      setStatusMessage('Error saving category. Please try again.');
    }
  };
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="add-category-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editCategory ? 'Edit Category' : 'Add New Category'}</h2>
        
        {statusMessage && (
          <div className={`status-message ${statusMessage.includes('Error') ? 'status-error' : 'status-success'}`}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="name">Category Name <span style={{ color: 'red' }}>*</span></label>
            <input 
              id="name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="parentCategory">Parent Category (Optional)</label>
            <select 
              id="parentCategory" 
              value={parentId} 
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">-- No Parent (Root Category) --</option>
              {dropdownCategories.filter(cat => 
                  String(cat.is_leaf) !== 'true' && 
                  (editCategory ? cat.id !== editCategory.id : true)).map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="checkbox-group">
            <input 
              id="isLeaf" 
              type="checkbox" 
              checked={isLeaf} 
              onChange={(e) => setIsLeaf(e.target.checked)} 
            />
            <label htmlFor="isLeaf">Is this a leaf category? (Allows product assignment)</label>
          </div>

          {/* --- Multi-Select Dropdown Menu --- */}
          {isLeaf && (
            <div className="form-group" ref={multiSelectRef}>
              <label>Assign Products</label>
              
              <div className="multi-select-wrapper">
                {/* The Clickable Box */}
                <div 
                  className="multi-select-box" 
                  onClick={() => {
                    setIsDropdownOpen(true);
                    searchInputRef.current?.focus();
                  }}
                >
                  {/* Render the selected product pills */}
                  {selectedProducts.map(product => (
                    <div key={product.id} className="multi-select-pill">
                      {product.msa_id}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleRemoveProduct(product.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* The hidden/inline search input */}
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    className="multi-select-input"
                    placeholder={selectedProducts.length === 0 ? "Select products..." : ""} 
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                  />
                  
                  {/* The Dropdown Arrow Indicator */}
                  <span className="multi-select-arrow">▼</span>
                </div>

                {/* The Floating Menu */}
                {isDropdownOpen && (
                  <ul className="multi-select-menu">
                    {availableOptions.length > 0 ? (
                      availableOptions.map(product => (
                        <li 
                          key={product.msa_id} 
                          className="multi-select-option"
                          onClick={() => handleAddProduct(product)}
                        >
                          {product.msa_id}
                        </li>
                      ))
                    ) : (
                      <li className="multi-select-option" style={{ color: '#888', cursor: 'default' }}>
                        {productSearch.length >= 2 ? "No products found." : "Loading products..."}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="modal-button-group">
            <button type="button" className="modal-cancel-btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="modal-submit-btn">{editCategory ? 'Update Category' : 'Add Category'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;