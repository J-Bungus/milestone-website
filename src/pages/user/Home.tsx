import React, { useState, useEffect } from "reactn";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { CategoryTree } from "../../types";
import "../../assets/styles/Home.css";

const Home = () => {
  const [categoryTrees, setCategoryTrees] = useState<Array<CategoryTree>>([]);
  const navigate = useNavigate();

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

  return (
    <div className="products-layout-wrapper" style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      
      <Sidebar categoryTrees={categoryTrees} navigate={navigate} />

      {/* FIX: Changed class to 'products-page' to inherit your CSS, and added boxSizing */}
      <div 
        className="products-page" 
        style={{ 
          flex: 1, 
          minWidth: 0, 
          padding: '60px 40px 60px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '60px',
          boxSizing: 'border-box' // Ensures padding doesn't break the layout width
        }}
      >
        
        {/* Hero Section */}
        <section className="hero-section" 
          style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            borderRadius: '8px', 
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
          <h1 style={{ fontSize: '42px', marginBottom: '20px', color: '#ffffff' }}>
            Your Trusted Partner in the Shop.
          </h1>
          <p style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', color: '#cbd5e1' }}>
            We supply the reliable, high-quality components you need to get the job done right. 
            <br />
            Use the sidebar to browse our catalog and find exactly what fits.
          </p>
        </section>

        {/* Why Us Section */}
<section className="why-us-section" style={{ padding: '20px', width: '100%' }}>
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '40px', color: '#333' }}>
            Why Choose Us?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
            
            <div className="feature-card">
              {/* Support/Headset Icon */}
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 206, 0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#111' }}>Real People, Real Help</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                Don't know the exact part number? No problem. Just call us. We know cars and we are happy to help you figure it out.
              </p>
            </div>
            
            <div className="feature-card">
              {/* Quality/Shield Icon */}
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 206, 0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#111' }}>Quality Components</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                We only stock reliable, durable parts that we would trust in our very own vehicles.
              </p>
            </div>
            
            <div className="feature-card">
              {/* Fast/Lightning Bolt Icon */}
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 206, 0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#111' }}>Fast Turnaround</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                Get the parts you need quickly so your bay doesn't stay tied up longer than it needs to.
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;