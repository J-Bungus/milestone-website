import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaEnvelope, FaChevronRight } from "react-icons/fa";
import { ControlledMenu, SubMenu, MenuItem } from "@szhsin/react-menu";
import { CategoryTree } from "../types";
import "../assets/styles/Sidebar.css"; // We will create this next

interface SidebarProps {
  categoryTrees: CategoryTree[];
  navigate: any;
}

const Sidebar: React.FC<SidebarProps> = ({ categoryTrees, navigate }) => {

  // The recursive function to render deep sub-categories
  const renderNestedItem = (category: CategoryTree, currentPath: string): JSX.Element => {
    const nextPath = `${currentPath}${category.id}-${category.name}/`;
    const linkPath = `/products/${currentPath.replace(/\s/g, "")}${category.id}-${category.name}`;

    if (!category.children || category.children.length === 0) {
      return (
        <MenuItem key={category.id} onClick={() => navigate(linkPath)}>
          {category.name}
        </MenuItem>
      );
    }

    return (
      <SubMenu
        key={category.id}
        label={<span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{category.name}</span>}
        direction="right"
        align="start"
      >
        {category.children.map((child) => renderNestedItem(child, nextPath))}
        <MenuItem onClick={() => navigate(linkPath)}>View All</MenuItem>
      </SubMenu>
    );
  };

  // The hover-wrapper for the top-level sidebar items
  const SidebarCategoryItem = ({ category }: { category: CategoryTree }) => {
    const [isOpen, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={ref}
        onClick={(e) => {e.stopPropagation(); setOpen(true)}}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="sidebar-item-wrapper"
      >
        <button className="sidebar-link" >
          <span>{category.name}</span>
          {/* The Chevron icon on the right side */}
          {category.children && category.children.length > 0 && (
            <FaChevronRight className="sidebar-chevron" />
          )}
        </button>

        {category.children && category.children.length > 0 && (
          <ControlledMenu
            state={isOpen ? "open" : "closed"}
            anchorRef={ref}
            direction="right" // <-- Opens the menu to the right of the sidebar
            align="start"     // <-- Aligns it with the top of the hovered button
            onClose={() => {setOpen(false);}}
            portal={true} // <-- Renders the menu in a portal to avoid overflow issues
          >
            {category.children.map((child) =>
              renderNestedItem(child, `${category.id}-${category.name}/`)
            )}
          </ControlledMenu>
        )}
      </div>
    );
  };

  return (
    <aside className="sidebar-container">
      {/* Static Top Links */}
      <div className="sidebar-section">
        <Link to="/" className="sidebar-link static-link">
          <FaHome className="sidebar-icon" />
          <span>Home</span>
        </Link>
        <Link to="/contacts" className="sidebar-link static-link">
          <FaEnvelope className="sidebar-icon" />
          <span>Contact</span>
        </Link>
      </div>

      <hr className="sidebar-divider" />

      {/* Categories */}
      <div className="sidebar-section">
        <h3 className="sidebar-subtitle">Categories</h3>
        <div className="sidebar-categories">
          {categoryTrees.map(option => (
            <SidebarCategoryItem key={option.id} category={option} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;