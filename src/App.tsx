import React from 'reactn';
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {  
  return (
    <BrowserRouter>
      <Loader/>
      <Routes>
        <Route path="/" element={<Header/>}>
          <Route index element={<Login/>}/>
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
            path="/products" 
            element={
              <AuthRoute key="products" isAdmin={false}>
                <Products/>
              </AuthRoute>
            }
          />
          <Route
            path="/products/category/*"
            element={
              <AuthRoute>
                <CategoryProducts/>
              </AuthRoute>
            }
          />
          <Route path="/verify-login" element={<VerifyLogin/>}/>
          <Route 
            path="/invoice" 
            element={
              <AuthRoute>
                <InvoicePage/>
              </AuthRoute>
            }
          />
          <Route 
            path="/account" 
            element={
              <AuthRoute>
                <Account/>
              </AuthRoute>
            }
          />
          <Route
            path="/products/specific/:msa_id"
            element={
              <AuthRoute>
                <SpecificProduct/>
              </AuthRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
