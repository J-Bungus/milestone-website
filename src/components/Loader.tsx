import React, { useGlobal } from "reactn";
import "../assets/styles/Loader.css";

const loader = require("../assets/imgs/nut.png");

const Loader = () => {
  const [loading, setLoading] = useGlobal("loading");
  
  if (!loading) {
    return <span></span>
  }

  return (
    <div className="loading-page">
      <img className="loader" src={loader}/>
    </div>
  );
}

export default Loader;