import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Make sure these paths match your actual folder structure!
import Sidebar from "../../components/Sidebar"; 
import { CategoryTree } from "../../types"; 
import "../../assets/styles/Contacts.css";

const Contact: React.FC = () => {
  const [categoryTrees, setCategoryTrees] = useState<Array<CategoryTree>>([]);
  const navigate = useNavigate();

  // Fetch the categories so the Sidebar can render properly!
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
    /* We use the same flex layout as the products page to hold the Sidebar and Content side-by-side */
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', minHeight: '90vh', backgroundColor: '#EFEFF0' }}>
      
      {/* 1. The Sidebar on the left */}
      <Sidebar categoryTrees={categoryTrees} navigate={navigate} />

      {/* 2. The Contact Content taking up the remaining space on the right */}
      <div className="simple-contact-wrapper" style={{ flex: 1, height: '90vh' }}>
        <div className="simple-contact-card">
          <h2>Contact Us</h2>
          <p>
            <strong>Phone: </strong> 
            <a href="tel:+4164969384">(416) 496-9384</a>
          </p>
          <p>
            <strong>Fax: </strong> 
            <a href="tel:+4164967844">(416) 496-7844</a>
          </p>
          <p>
            <strong>Email: </strong> 
            <a href="mailto:milestoneautosuppliesinc@hotmail.com">milestoneautosuppliesinc@hotmail.com</a>
          </p>
          <p>
            <strong>Address: </strong> 
            <a href="https://www.google.com/maps/place/Milestone+Auto+Supplies/@43.8105938,-79.3460349,17z/data=!3m1!4b1!4m6!3m5!1s0x89d4d37eb52a2945:0xbae80424cfecc93e!8m2!3d43.81059!4d-79.34346!16s%2Fg%2F11b773t2lf?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">
            596 Gordon Baker Rd, North York, ON M2H 3B4
            </a>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Contact;