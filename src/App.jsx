import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './screen/home/home';
import ProductsPage from './screen/products/products';
import BrandsPage from './screen/brands/brands';
import AuthPage from './screen/auth/auth';
import ProfilePage from './screen/profile/profile';
import OrderSuccessPage from './screen/order-success/order-success';
import OrderFailurePage from './screen/order-failure/order-failure';
import OrdersPage from './screen/orders/orders';
import ContactPage from './screen/contact/contact';
import EmployeePanel from './screen/employee-panel/employee-panel';
import EmployeeManagement from './screen/employee-management/employee-management';
import UserManagement from './screen/user-management/user-management';
import AboutPage from './screen/about/about';
import RequestQuotePage from './screen/request-quote/request-quote';
import LegalPage from './screen/legal/legal';
import ProductDetailPage from './screen/product-detail/product-detail';
import WhatsAppFloat from './components/common/WhatsAppFloat';
import QuoteFloat from './components/common/QuoteFloat';
import ScrollToTop from './components/common/ScrollToTop';
import CheckoutPage from './screen/checkout/checkout';
import './App.css';

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <WhatsAppFloat />
          <QuoteFloat />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/order-failure" element={<OrderFailurePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/employee-panel" element={<EmployeePanel />} />
              <Route path="/admin/employees" element={<EmployeeManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/quote" element={<RequestQuotePage />} />
              <Route path="/privacy" element={<LegalPage />} />
              <Route path="/terms" element={<LegalPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}


export default App;
