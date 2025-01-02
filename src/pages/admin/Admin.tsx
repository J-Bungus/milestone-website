import React, { useState } from "reactn";
import axios from "axios";
import { Tab, Tabs } from "@material-ui/core";

import ClientRegistrationForm from "../../components/ClientRegistrationForm";
import AddProductForm from "../../components/AddProductForm";
import Categories from "./Categories";
import "../../assets/styles/Admin.css";

const Admin = () => {
  const [value, setValue] = useState<number>(0);

  return (
    <div className="admin-wrapper">
      <Tabs value={value} onChange={(event: any, newValue: number) => setValue(newValue)}>
        <Tab label="Register Client"/>
        <Tab label="Add Product"/>
        <Tab label="Build Categories"/>
      </Tabs>
      {value === 0 && <ClientRegistrationForm/>}
      {value === 1 && <AddProductForm/>}
      {value === 2 && <Categories/>}
    </div>
  );
};

export default Admin;