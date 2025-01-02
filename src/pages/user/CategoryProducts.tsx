import React, { useState, useEffect, useGlobal } from "reactn";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FaBars } from "react-icons/fa";
import { TreeItem, TreeView } from "@material-ui/lab";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
import ProductCard from "../../components/ProductCard";
import "../../assets/styles/Products.css";
import { makeStyles } from "@material-ui/core";
import { CategoryTree, Product, Cart, Item } from "../../types";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
  }
});


const CategoryProducts = () => {
  const { "*": categories } = useParams();
  const categoryPath = categories ? categories.split("/") : [];
  const [currentCategory, setCurrentCategory] = useState<CategoryTree | null>(null);
  const [categoryTrees, setCategoryTrees] = useState<Array<CategoryTree>>([]);
  const [breadCrumb, setBreadCrumb] = useState<Array<string>>([]);
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(20);
  const [products, setProducts] = useState<Array<Product>>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const [cart, setCart] = useGlobal("cart");

  const classes = useStyles();

  useEffect(() => {
    const fetchProducts = async (category: CategoryTree | null) => {
      if (!category) {
        return;
      }

      const endpoint = `${process.env.REACT_APP_API}/products/search-category?page=${page}&itemsPerPage=${itemsPerPage}&category_id=${category.id}`;;
      const token = localStorage.getItem("token");
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProducts(res.data.products);
      setTotalProducts(res.data.totalProducts);
    }

    let categoryLayer = categoryTrees;
    let currCategory = null;
    const path = [];
    console.log(categoryPath);
    for (const category of categoryPath) {
      const [id, name] = category.split("-");
      console.log(id);
      const categoryNode = categoryLayer.filter(cat => cat.id === parseInt(id))[0];
      if (!categoryNode) {
        break;
      }

      path.push(categoryNode.name);

      
      currCategory = categoryNode;
      if (categoryNode.children) {
        categoryLayer = categoryNode.children;
      }
    }

    fetchProducts(currCategory);
    setCurrentCategory(currCategory);
    setBreadCrumb(path);

  }, [categoryTrees, categories]);

  useEffect(() => {
    const fetchUserCart = async (token: string) => {
      const cartData = await axios.get(`${process.env.REACT_APP_API}/cart/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("fetched data", cartData);
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

      setCategoryTrees(res.data.categoryTree);
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
        <Link to={`/products/category/${path.replace(/\s/g, "")}${category.id}-${category.name}`} >
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

  if (!currentCategory) {
    return <div>Category not found.</div>
  }

  return (
    <>
      <div className="products-page">
        <div className="category-path">
          <nav>
            <Link to="/products"> Home </Link>
            {
              breadCrumb.map((crumb, i) => {
                return (
                  <span key={i}>
                    {" > "}
                    <Link to={`/products/category/${categoryPath.slice(0, i + 1).join("/")}`}> {crumb} </Link>
                  </span>);
              })
            }
          </nav>
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
                  categoryTrees.map(option => renderMenuItem(option, ""))
                }
              </TreeView>
            </div>
          }

        </div>
        {currentCategory.is_leaf || !currentCategory.children || currentCategory.children.length === 0
          ? <>
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
              <ReactPaginate
                pageCount={totalProducts / itemsPerPage || 1}
                onPageChange={e => {
                  console.log(e.selected);
                  setPage(e.selected);
                }}
              />
            </div>
          </>
          : <>
            <ul>
              {currentCategory.children.map(child => (
                <li key={child.id}>
                  <Link to={`/products/category/${categoryPath.concat(`${child.id}-${child.name.replace(/\s/g, "")}`).join("/")}`}>
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        }
      </div>
    </>
  )
};

export default CategoryProducts;