import React, { useState, useEffect } from "react";
import { 
  LuTrendingUp, 
  LuTrendingDown, 
  LuDollarSign, 
  LuShoppingCart, 
  LuPackage,
  LuUsers,
  LuDownload
} from "react-icons/lu";
import { toast } from 'sonner';
import "./SalesAnalytics.css";

const API_BASE = '/api';

export default function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState("month");
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/analytics?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load analytics');
        }

        setAnalytics(data.data);
        setTopProducts(data.data.topProducts || []);
        
        // Transform daily sales data for chart
        const transformedSalesData = (data.data.dailySales || []).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          revenue: item.revenue,
          orders: item.orders
        }));
        setSalesData(transformedSalesData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error(error.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? <LuTrendingUp size={16} /> : <LuTrendingDown size={16} />;
  };

  const getChangeColor = (change) => {
    return change >= 0 ? "#10b981" : "#ef4444";
  };

  const exportReport = () => {
    // Simulate export functionality
    alert("Đang xuất báo cáo phân tích bán hàng...");
  };

  if (loading || !analytics) {
    return <div className="admin-analytics-loading">Đang tải dữ liệu phân tích...</div>;
  }

  return (
    <div className="admin-sales-analytics">
      <div className="admin-analytics-header">
        <h2>Phân tích Bán hàng</h2>
        <div className="admin-header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="admin-time-range-selector"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">90 ngày qua</option>
          </select>
          <button onClick={exportReport} className="admin-export-btn">
            <LuDownload size={16} />
            Xuất Báo cáo
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon admin-revenue">
            <LuDollarSign size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Tổng Doanh thu</h3>
            <p className="admin-metric-value">{formatCurrency(analytics.totalRevenue)}</p>
            <div className="admin-metric-change" style={{ color: getChangeColor(analytics.revenueChange) }}>
              {getChangeIcon(analytics.revenueChange)}
              <span>{Math.abs(analytics.revenueChange)}%</span>
            </div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon admin-orders">
            <LuShoppingCart size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Tổng Đơn hàng</h3>
            <p className="admin-metric-value">{analytics.totalOrders.toLocaleString()}</p>
            <div className="admin-metric-change" style={{ color: getChangeColor(analytics.ordersChange) }}>
              {getChangeIcon(analytics.ordersChange)}
              <span>{Math.abs(analytics.ordersChange)}%</span>
            </div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon admin-aov">
            <LuPackage size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Giá trị TB Đơn hàng</h3>
            <p className="admin-metric-value">{formatCurrency(analytics.averageOrderValue)}</p>
            <div className="admin-metric-change" style={{ color: getChangeColor(analytics.aovChange) }}>
              {getChangeIcon(analytics.aovChange)}
              <span>{Math.abs(analytics.aovChange)}%</span>
            </div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon admin-customers">
            <LuUsers size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Khách hàng</h3>
            <p className="admin-metric-value">{analytics.totalCustomers.toLocaleString()}</p>
            <div className="admin-metric-change" style={{ color: getChangeColor(analytics.customersChange) }}>
              {getChangeIcon(analytics.customersChange)}
              <span>{Math.abs(analytics.customersChange)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="admin-chart-section">
        <h3>Xu hướng Bán hàng</h3>
        <div className="admin-chart-container">
          <div className="admin-chart-placeholder">
            <div className="admin-chart-bars">
              {salesData.slice(-10).map((item, index) => (
                <div key={index} className="admin-chart-bar-group">
                  <div 
                    className="admin-chart-bar admin-revenue-bar" 
                    style={{ height: `${(item.revenue / 7000) * 100}%` }}
                    title={`Doanh thu: ${formatCurrency(item.revenue)}`}
                  ></div>
                  <div 
                    className="admin-chart-bar admin-orders-bar" 
                    style={{ height: `${(item.orders / 25) * 100}%` }}
                    title={`Đơn hàng: ${item.orders}`}
                  ></div>
                  <div className="admin-chart-label">{item.date.split('/')[0]}</div>
                </div>
              ))}
            </div>
            <div className="admin-chart-legend">
              <div className="admin-legend-item">
                <div className="admin-legend-color admin-revenue-bar"></div>
                <span>Doanh thu</span>
              </div>
              <div className="admin-legend-item">
                <div className="admin-legend-color admin-orders-bar"></div>
                <span>Đơn hàng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-analytics-grid">
        {/* Top Products */}
        <div className="admin-analytics-card">
          <h3>Sản phẩm Bán chạy</h3>
          <div className="admin-top-products-list">
            {topProducts.map((product, index) => (
              <div key={product.id || product._id} className="admin-product-row">
                <div className="admin-product-rank">{index + 1}</div>
                <img src={product.image} alt={product.name} className="admin-product-image" />
                <div className="admin-product-info">
                  <h4>{product.name}</h4>
                  <p>{product.brand}</p>
                </div>
                <div className="admin-product-stats">
                  <div className="admin-sales-stat">
                    <span className="admin-stat-value">{product.sales}</span>
                    <span className="admin-stat-label">đã bán</span>
                  </div>
                  <div className="admin-revenue-stat">
                    <span className="admin-stat-value">{formatCurrency(product.revenue)}</span>
                    <span className="admin-stat-label">doanh thu</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="admin-analytics-card">
          <h3>Tóm tắt Hiệu suất</h3>
          <div className="admin-performance-list">
            <div className="admin-performance-item">
              <span className="admin-performance-label">Tỷ lệ chuyển đổi</span>
              <div className="admin-performance-value">
                <span>{analytics.conversionRate}%</span>
                <span className="admin-performance-change" style={{ color: getChangeColor(analytics.conversionChange) }}>
                  {getChangeIcon(analytics.conversionChange)}
                  {Math.abs(analytics.conversionChange)}%
                </span>
              </div>
            </div>
            <div className="admin-performance-item">
              <span className="admin-performance-label">Giá trị đơn hàng trung bình</span>
              <div className="admin-performance-value">
                <span>{formatCurrency(analytics.averageOrderValue)}</span>
                <span className="admin-performance-change" style={{ color: getChangeColor(analytics.aovChange) }}>
                  {getChangeIcon(analytics.aovChange)}
                  {Math.abs(analytics.aovChange)}%
                </span>
              </div>
            </div>
            <div className="admin-performance-item">
              <span className="admin-performance-label">Tổng khách hàng</span>
              <div className="admin-performance-value">
                <span>{analytics.totalCustomers.toLocaleString()}</span>
                <span className="admin-performance-change" style={{ color: getChangeColor(analytics.customersChange) }}>
                  {getChangeIcon(analytics.customersChange)}
                  {Math.abs(analytics.customersChange)}%
                </span>
              </div>
            </div>
          </div>
          </div>

          <div className="admin-insights">
            <h4>Chi tiết insights</h4>
            <ul>
              <li>Doanh thu tăng {analytics.revenueChange}% so với kỳ trước</li>
              <li>Sản phẩm MacBook Pro 14-inch M3 là sản phẩm bán chạy nhất</li>
              <li>Tỷ lệ chuyển đổi cải thiện {analytics.conversionChange}%</li>
              <li>Giá trị đơn hàng trung bình giảm {Math.abs(analytics.aovChange)}%</li>
            </ul>
          </div>
        </div>
      </div>
  );
}
