import React, { useGlobal, useState, useEffect, useRef } from "reactn";
import axios, { AxiosError } from "axios";
import DefaultSelectionArea, { SelectionEvent } from "@viselect/react";

import "../assets/styles/BulkDeleteProducts.css";

const SelectionArea = DefaultSelectionArea as any;

const BulkDeleteProducts = () => {
  const [products, setProducts] = useState<Array<{ id: number; msa_id: string }>>([]);
  const [selectedMsaIds, setSelectedMsaIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  
  const selectedMsaIdsRef = useRef(selectedMsaIds);
  const dragStartSelectionRef = useRef<string[]>([]);

  useEffect(() => {
    selectedMsaIdsRef.current = selectedMsaIds;
  }, [selectedMsaIds]);

  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useGlobal("loading");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = `${process.env.REACT_APP_API}/products/all-msa_id`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setStatusMessage("Failed to load products.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('.selection-area-wrapper')) return;
      if (target.closest('button')) return;

      setSelectedMsaIds([]);
      setLastSelectedIndex(null);
    };

    document.addEventListener("mousedown", handleGlobalClick);
    return () => document.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  const extractIds = (elements: Element[]): string[] => {
    return elements.map((el) => el.getAttribute("data-id")).filter(Boolean) as string[];
  };

  const onStart = ({ selection }: SelectionEvent) => {
    dragStartSelectionRef.current = selectedMsaIdsRef.current;
    if (selectedMsaIdsRef.current.length === 0) {
      selection.clearSelection();
    }
  };

  const onMove = ({ store: { selected } }: SelectionEvent) => {
    // 'selected' contains the absolute list of elements currently touching the blue box
    const intersectedIds = extractIds(selected);

    setSelectedMsaIds(() => {
      // 1. Start with everything that was selected before the drag began
      const next = new Set(dragStartSelectionRef.current);
      
      // 2. Add everything the blue box is currently touching
      intersectedIds.forEach((id) => next.add(id));
      
      return Array.from(next);
    });
  };

  const handleToggle = (msa_id: string, index: number, event: React.MouseEvent) => {
    event.stopPropagation(); 

    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const idsInRange = products.slice(start, end + 1).map(p => p.msa_id);
      
      setSelectedMsaIds(prev => {
        const newSelection = new Set([...prev, ...idsInRange]);
        return Array.from(newSelection);
      });
      setLastSelectedIndex(null);
    } else {
      if (event.shiftKey) setLastSelectedIndex(index);

      setSelectedMsaIds((prev) => {
        if (prev.includes(msa_id)) return prev.filter((id) => id !== msa_id);
        return [...prev, msa_id];
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedMsaIds.length === products.length) {
      setSelectedMsaIds([]); 
    } else {
      setSelectedMsaIds(products.map((p) => p.msa_id)); 
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMsaIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you ABSOLUTELY sure you want to delete ${selectedMsaIds.length} products?\n\nThis will permanently remove them and all their images from the database.`
    );

    if (!confirmed) return;

    setLoading(true);
    setStatusMessage(`Deleting 0 of ${selectedMsaIds.length} products...`);
    setIsError(false);

    const token = localStorage.getItem("token");
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedMsaIds.length; i++) {
      const msa_id = selectedMsaIds[i];
      const endpoint = `${process.env.REACT_APP_API}/products/delete/${encodeURIComponent(msa_id)}`;

      try {
        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        successCount++;
        setStatusMessage(`Deleting ${successCount} of ${selectedMsaIds.length} products...`);
      } catch (error) {
        console.error(`Failed to delete product ${msa_id}:`, error);
        failCount++;
      }
    }

    setLoading(false);
    setSelectedMsaIds([]); 
    setLastSelectedIndex(null);
    
    if (failCount > 0) {
      setStatusMessage(`Deleted ${successCount} products, but failed to delete ${failCount}.`);
      setIsError(true);
    } else {
      setStatusMessage(`Successfully deleted all ${successCount} selected products!`);
      setIsError(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }

    fetchProducts();
  };

  return (
    <div className="bulk-delete-wrapper">
      <div className="bulk-delete-container">
        
        <div className="bulk-delete-header">
          <div>
            <h2>Bulk Delete Products</h2>
            <span className="bulk-delete-subtitle">
              Drag to select, click to toggle, or Shift+Click for ranges.
            </span>
          </div>
          
          <div className="bulk-delete-actions">
            <span className="selected-count">
              {selectedMsaIds.length} selected
            </span>
            <button 
              className={`bulk-delete-btn ${selectedMsaIds.length > 0 ? 'active' : 'disabled'}`}
              disabled={selectedMsaIds.length === 0}
              onClick={handleDeleteSelected}
            >
              Delete Selected
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className={`status-message ${isError ? 'error' : 'success'}`}> 
            {statusMessage} 
          </div>
        )}

        <div className="bulk-delete-controls">
          <button className="select-all-btn" onClick={handleSelectAll}>
            {selectedMsaIds.length === products.length && products.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <SelectionArea
          className="selection-area-wrapper" 
          onStart={onStart} 
          onMove={onMove}
          selectables=".selectable-card" 
          features={{ singleTap: { allow: false } }} 
        >
          <div className="bulk-delete-grid">
            {products.length === 0 && !loading && (
              <div className="empty-state">
                No products found in the database.
              </div>
            )}

            {products.map((product, index) => {
              const isSelected = selectedMsaIds.includes(product.msa_id);
              
              return (
                <div 
                  key={product.id} 
                  data-id={product.msa_id} 
                  className={`selectable-card ${isSelected ? 'selected' : ''}`} 
                  onClick={(e) => handleToggle(product.msa_id, index, e)}
                >
                  <span className="card-label">Part #</span>
                  <strong className="card-id">{product.msa_id}</strong>
                </div>
              );
            })}
          </div>
        </SelectionArea>

      </div>
    </div>
  );
};

export default BulkDeleteProducts;