import React, { useState, useEffect, useGlobal, useRef } from "reactn";
import { Link } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { FaBars } from "react-icons/fa";
import { TreeItem, TreeView } from "@material-ui/lab";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
import { Product, Item, Cart, CategoryTree } from "../../types";
import ProductCard from "../../components/ProductCard";
import "../../assets/styles/Products.css";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
  }
});

const Products = () => {
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(20);
  const [products, setProducts] = useState<Array<Product>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [menu, setMenu] = useState<Array<CategoryTree>>([]);

  const [cart, setCart] = useGlobal("cart");
  const searchRef = useRef<HTMLInputElement>(null);

  const classes = useStyles();

  useEffect(() => {
    const fetchInitalData = async (token: string) => {
      const endpoint = `${process.env.REACT_APP_API}/products/all?page=${page}&itemsPerPage=${itemsPerPage}`;
      try {
        const result = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProducts(result.data.products);
        setTotalProducts(result.data.totalProducts);
      } catch (error) {
        return <div>UNAUTHORIZED</div>;
      }
    }

    const fetchProducts = async (token: string) => {
      const endpoint = `${process.env.REACT_APP_API}/products/search?page=${page}&itemsPerPage=${itemsPerPage}&searchTerm=${searchTerm}`;
      try {
        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data.products) {
          setProducts(res.data.products);
          setTotalProducts(res.data.totalProducts);
        }
        else {
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error(error);
        return <div>UNAUTHORZED</div>;
      }
    }

    const token = localStorage.getItem("token");
    if (searchTerm && token)
      fetchProducts(token);
    else if (token)
      fetchInitalData(token);

  }, [page, itemsPerPage, searchTerm]);

  useEffect(() => {
    const fetchUserCart = async (token: string) => {
      const cartData = await axios.get(`${process.env.REACT_APP_API}/cart/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newCart: Cart = {};
      if (cartData.data.cart) {
        cartData.data.cart.items.map((item: Item) => {
          newCart[item.product.msa_id] = item;
        });
        setCart(newCart);
      }
    }

    const fetchCategories = async (token: string) => {
      const endpoint = `${process.env.REACT_APP_API}/category/fetch/all`;
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMenu(res.data.categoryTree);
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetchUserCart(token);
      fetchCategories(token);
    }
  }, []);

  const renderMenuItem = (category: CategoryTree, path: string): JSX.Element => {
    if (!category.children || category.children.length === 0) {
      return (
        <Link to={`/products/category/${path.replace(/\s/g,"")}${category.id}-${category.name}`} >
          <TreeItem nodeId={String(category.id)} label={category.name} />
        </Link>
      );
    }

    return (
      <TreeItem nodeId={String(category.id)} label={category.name}>
        {category.children.map(child => renderMenuItem(child, path + `${category.id}-${category.name}/`))}
      </TreeItem>
    );
  };

  return (
    <>
      <div className="products-page">
        <div className="search-wrapper">
          <input
            ref={searchRef}
            className="search"
            placeholder="Search by part number or name"
            type="text"
            onChange={e => {
              if (e.target.value === "") {
                setSearchTerm("");
              }
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && searchRef.current) {
                setSearchTerm(searchRef.current.value);
              }
            }}
          />
          <button
            className="search-button"
            onClick={() => {
              if (searchRef.current) {
                setSearchTerm(searchRef.current.value);
              } else {
                setSearchTerm("");
              }
            }}
          >
            Search
          </button>
        </div>

        <div className="menu-wrapper">
          <div
            className="menu-button"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <FaBars />
          </div>
          {openMenu &&
            <div className="menu">
              <TreeView
                className={classes.root}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
              >
                {
                  menu.map(option => renderMenuItem(option, ""))
                }
              </TreeView>
            </div>
          }

        </div>
        <div className="products-wrapper">
          {products.map(product =>
            <ProductCard
              key={product.msa_id}
              product={product}
              cart={cart}
              setCart={setCart}
            />
          )}
        </div>
        <div className="paginate-wrapper">
          {console.log("total", totalProducts)}
          <ReactPaginate
            pageCount={Math.ceil(totalProducts / itemsPerPage) || 1}
            pageRangeDisplayed={0}
            marginPagesDisplayed={0}
            onPageChange={e => {
              console.log(e.selected);
              setPage(e.selected);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Products;