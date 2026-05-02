import React from 'reactn';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/user/Login";
import Products from './pages/user/Products';
import AuthRoute from './components/AuthRoute';
import SpecificProduct from './pages/user/SpecificProduct';
import InvoicePage from "./pages/user/InvoicePage";
import Account from './pages/user/Account';
import Admin from './pages/admin/Admin';
import Loader from './components/Loader';
import VerifyLogin from './pages/user/VerifyLogin';
import CategoryProducts from './pages/user/CategoryProducts';

import './App.css';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Contacts from './pages/user/Contacts';
import Home from './pages/user/Home';

function App() {  
  return (
    <BrowserRouter>
      <Loader/>
      <Routes>
        <Route path="/" element={<Header/>}>
          <Route index element={<Home/>}/>
          <Route path="/admin-login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/> 
          <Route 
            path="/admin"
            element={
              <AuthRoute key="admin" isAdmin={true}>
                <Admin/>
              </AuthRoute>
            }
          />
          <Route 
            path="/products/*" 
            element={<Products/>}
          />
          { /* <Route path="/verify-login" element={<VerifyLogin/>}/> */}
          { /*<Route 
            path="/invoice" 
            element={<InvoicePage/>}
          />
          <Route 
            path="/account" 
            element={<Account/>}
          /> */}
          <Route
            path="/product-details/:msa_id"
            element={<SpecificProduct/>}
          />
          <Route
            path="/contacts"
            element={<Contacts/>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
