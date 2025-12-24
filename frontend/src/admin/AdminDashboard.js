import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LuPackage, 
  LuPercent, 
  LuPlus, 
  LuChartBar, 
  LuLayoutDashboard,
  LuLogOut,
  LuUsers,
  LuShoppingCart,
  LuTrendingUp,
  LuBoxes,
  LuTag,
  LuMenu
} from "react-icons/lu";
import { useAuthStore } from "../lib/auth";
import InventoryManagement from "./components/InventoryManagement";
import DiscountManagement from "./components/DiscountManagement";
import AddProduct from "./components/AddProduct";
import SalesAnalytics from "./components/SalesAnalytics";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Extract active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname.split("/admin/")[1];
    return path || "dashboard";
  };

  const activeTab = getActiveTab();

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getCurrentTabLabel = () => {
    switch (activeTab) {
      case "dashboard":
        return { label: "Dashboard", icon: <LuLayoutDashboard size={20} /> };
      case "inventory":
        return { label: "Inventory Management", icon: <LuBoxes size={20} /> };
      case "discount":
        return { label: "Discount Management", icon: <LuPercent size={20} /> };
      case "add-product":
        return { label: "Add Product", icon: <LuPlus size={20} /> };
      case "analytics":
        return { label: "Sales Analytics", icon: <LuChartBar size={20} /> };
      default:
        return { label: "Dashboard", icon: <LuLayoutDashboard size={20} /> };
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryManagement />;
      case "discount":
        return <DiscountManagement />;
      case "add-product":
        return <AddProduct />;
      case "analytics":
        return <SalesAnalytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Compact Mobile Navigation */}
      <div className="mobile-nav-compact">
        <div className="mobile-nav-current" onClick={toggleMobileMenu}>
          <div className="mobile-nav-label">
            {getCurrentTabLabel().icon}
            {getCurrentTabLabel().label}
          </div>
          <LuMenu size={20} />
        </div>
        
        <div className={`mobile-nav-expanded ${isMobileMenuOpen ? 'show' : ''}`}>
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => handleNavigation("dashboard")}
          >
            <LuLayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => handleNavigation("inventory")}
          >
            <LuBoxes size={20} />
            Inventory Management
          </button>
          <button
            className={`nav-item ${activeTab === "discount" ? "active" : ""}`}
            onClick={() => handleNavigation("discount")}
          >
            <LuPercent size={20} />
            Discount Management
          </button>
          <button
            className={`nav-item ${activeTab === "add-product" ? "active" : ""}`}
            onClick={() => handleNavigation("add-product")}
          >
            <LuPlus size={20} />
            Add Product
          </button>
          <button
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => handleNavigation("analytics")}
          >
            <LuChartBar size={20} />
            Sales Analytics
          </button>
          <div className="admin-logout">
            <button onClick={handleLogout} className="ad-logout-btn">
              <LuLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <div className="admin-logo">
          <img src="/taplop-high-resolution-logo-transparent.png" alt="Taplop Logo" />
          <h1 className="admin-logo">TAPLOP</h1>
          </div>
          <div className="admin-user">
            <span>Welcome {user?.firstName}</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => handleNavigation("dashboard")}
          >
            <LuLayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => handleNavigation("inventory")}
          >
            <LuBoxes size={20} />
            Inventory Management
          </button>
          <button
            className={`nav-item ${activeTab === "discount" ? "active" : ""}`}
            onClick={() => handleNavigation("discount")}
          >
            <LuPercent size={20} />
            Discount Management
          </button>
          <button
            className={`nav-item ${activeTab === "add-product" ? "active" : ""}`}
            onClick={() => handleNavigation("add-product")}
          >
            <LuPlus size={20} />
            Add Product
          </button>
          <button
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => handleNavigation("analytics")}
          >
            <LuChartBar size={20} />
            Sales Analytics
          </button>
        </nav>
        
        <div className="admin-logout">
          <button onClick={handleLogout} className="ad-logout-btn">
            <LuLogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
}

function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "$0",
      change: "+0%",
      icon: <LuTrendingUp size={24} />,
      color: "green"
    },
    {
      title: "Total laptops",
      value: "0",
      change: "+0 Laptops",
      icon: <LuPackage size={24} />,
      color: "blue"
    },
    {
      title: "Total Orders",
      value: "0",
      change: "+0 orders",
      icon: <LuShoppingCart size={24} />,
      color: "purple"
    },
    {
      title: "Total Customers",
      value: "0",
      change: "+0 customers",
      icon: <LuUsers size={24} />,
      color: "orange"
    }
  ]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch analytics
        const analyticsRes = await fetch('/api/analytics?timeRange=month', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const analyticsData = await analyticsRes.json();
        
        // Fetch laptops count
        const laptopsRes = await fetch('/api/laptops?limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const laptopsData = await laptopsRes.json();
        
        if (analyticsRes.ok && analyticsData.success && laptopsRes.ok && laptopsData.success) {
          const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(amount);
          };
          
          setStats([
            {
              title: "Total Revenue",
              value: formatCurrency(analyticsData.data.totalRevenue || 0),
              change: `${analyticsData.data.revenueChange >= 0 ? '+' : ''}${analyticsData.data.revenueChange?.toFixed(1) || 0}%`,
              icon: <LuTrendingUp size={24} />,
              color: "green"
            },
            {
              title: "Total Laptops",
              value: laptopsData.pagination?.totalItems || 0,
              change: `+${laptopsData.pagination?.totalItems || 0} laptops`,
              icon: <LuPackage size={24} />,
              color: "blue"
            },
            {
              title: "Total Orders",
              value: analyticsData.data.totalOrders || 0,
              change: `+${analyticsData.data.ordersChange?.toFixed(1) || 0}%`,
              icon: <LuShoppingCart size={24} />,
              color: "purple"
            },
            {
              title: "Total Customers",
              value: analyticsData.data.totalCustomers || 0,
              change: `+${analyticsData.data.customersChange?.toFixed(1) || 0}%`,
              icon: <LuUsers size={24} />,
              color: "orange"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-overview">
        <div className="admin-loading">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className="stat-change">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <div className="action-card" onClick={() => navigate("/admin/inventory")}>
            <LuBoxes size={32} />
            <h4>Inventory Management</h4>
            <p>Check and update stock levels</p>
          </div>
          <div className="action-card" onClick={() => navigate("/admin/discount")}>
            <LuTag size={32} />
            <h4>Discount Management</h4>
            <p>Create and edit discount programs</p>
          </div>
          <div className="action-card" onClick={() => navigate("/admin/add-product")}>
            <LuPlus size={32} />
            <h4>Add Product</h4>
            <p>Add new products to inventory</p>
          </div>
          <div className="action-card" onClick={() => navigate("/admin/analytics")}>
            <LuChartBar size={32} />
            <h4>Sales Analytics</h4>
            <p>View sales reports and statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
