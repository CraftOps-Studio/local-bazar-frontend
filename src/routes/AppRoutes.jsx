import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layout Imports
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Page Imports
import Landing from '../pages/Landing';
import Storefront from '../pages/Storefront';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import CustomerOrders from '../pages/Orders';
import Profile from '../pages/Profile';

// Auth Page Imports
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ShopRegister from '../pages/ShopRegister';
import ActivateSeller from '../pages/ActivateSeller';
import { useAuth } from '../context/AuthContext';

// Dashboard Page Imports
import Dashboard from '../pages/Dashboard/Dashboard';
import Products from '../pages/Dashboard/Products';
import Orders from '../pages/Dashboard/Orders';
import Transactions from '../pages/Dashboard/Transactions';
import Analytics from '../pages/Dashboard/Analytics';
import Settings from '../pages/Dashboard/Settings';

// Admin Page Imports
import AdminDashboard from '../pages/Dashboard/Admin/AdminDashboard';
import AdminShops from '../pages/Dashboard/Admin/AdminShops';
import AdminUsers from '../pages/Dashboard/Admin/AdminUsers';
import AdminDeliveryAgents from '../pages/Dashboard/Admin/AdminDeliveryAgents';

const DashboardRedirect = () => {
  const { roleMode } = useAuth();
  if (roleMode === 'admin') {
    return <AdminDashboard />;
  }
  return <Dashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      
      {/* ─── PUBLIC STOREFRONT PORTAL ROUTING ─── */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Landing />} />
        <Route path="storefront" element={<Storefront />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<ProtectedRoute><CustomerOrders /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* ─── AUTHENTICATION PORTAL ROUTING ─── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/activate-seller" element={<ActivateSeller />} />
      </Route>

      {/* ─── SHOP OWNER REGISTRATION GATEWAY ─── */}
      <Route path="/shop-register" element={<ShopRegister />} />

      {/* ─── PROTECTED ADMIN/SELLER DASHBOARDS ROUTING ─── */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['shopOwner', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Admin only subpaths */}
        <Route path="shops" element={<AdminShops />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="delivery-agents" element={<AdminDeliveryAgents />} />
      </Route>

      {/* ─── FALLBACK CATCHALL REDIRECT ─── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;
