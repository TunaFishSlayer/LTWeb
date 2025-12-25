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

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

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
    try {
      if (!analytics) {
        toast.error('No data to export report');
        return;
      }

      // Check if jsPDF is available
      if (typeof window.jspdf === 'undefined') {
        toast.error('Loading PDF library, please try again in a few seconds...');
        return;
      }

      const { jsPDF } = window.jspdf;
      
      // Create PDF document with built-in fonts
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set up fonts and margins (using built-in fonts)
      doc.setFont('helvetica');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;
      
      // Add title with better formatting
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const title = `Sales Analytics Report - ${timeRange}`;
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
      yPosition += 15;
      
      // Add line separator
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Add summary section with better formatting
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SALES SUMMARY:', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const summaryData = [
        { label: 'Total Revenue:', value: formatCurrency(analytics.totalRevenue) },
        { label: 'Total Orders:', value: analytics.totalOrders.toLocaleString() },
        { label: 'Average Order Value:', value: formatCurrency(analytics.averageOrderValue) },
        { label: 'Total Customers:', value: analytics.totalCustomers.toLocaleString() }
      ];
      
      summaryData.forEach(item => {
        doc.text(item.label, margin + 5, yPosition);
        doc.text(item.value, margin + 60, yPosition);
        yPosition += 7;
      });
      
      yPosition += 10;
      
      // Add line separator
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Add top products section with better formatting
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP PRODUCTS SOLD:', margin, yPosition);
      yPosition += 10;
      
      if (topProducts.length === 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('No data available', margin, yPosition);
      } else {
        topProducts.forEach((product, index) => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${product.name}`, margin, yPosition);
          yPosition += 6;
          
          doc.setFont('helvetica', 'normal');
          doc.text(`Brand: ${product.brand}`, margin + 5, yPosition);
          doc.text(`Sold: ${product.sales} products`, margin + 5, yPosition + 6);
          doc.text(`Revenue: ${formatCurrency(product.revenue)}`, margin + 5, yPosition + 12);
          yPosition += 20;
        });
      }
      
      // Add footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} / ${totalPages}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Exported on: ${new Date().toLocaleDateString('vi-VN')}`, margin, doc.internal.pageSize.getHeight() - 10);
      }
      
      // Save PDF with error handling
      try {
        doc.save(`sales-analytics-report-${timeRange}.pdf`);
        toast.success('Export PDF successfully!');
      } catch (saveError) {
        console.error('Save error:', saveError);
        toast.error('Error saving PDF file, please try again');
      }
      
    } catch (error) {
      console.error('PDF Export error:', error);
      toast.error('Error creating PDF report: ' + error.message);
    }
  };

  if (loading || !analytics) {
    return <div className="admin-analytics-loading">Loading analytics data...</div>;
  }

  return (
    <div className="admin-sales-analytics">
      <div className="admin-analytics-header">
        <h2>Sales Analytics</h2>
        <div className="admin-header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="admin-time-range-selector"
          >
            <option value="week">7 days ago</option>
            <option value="month">30 days ago</option>
            <option value="quarter">90 days ago</option>
          </select>
          <button onClick={exportReport} className="admin-export-btn">
            <LuDownload size={16} />
            Export
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
            <h3>Total Revenue</h3>
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
            <h3>Total Orders</h3>
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
            <h3>Average Order Value</h3>
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
            <h3>Total Customers</h3>
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
        <h3>Sales Trend</h3>
        <div className="admin-chart-container">
          <div className="admin-chart-placeholder">
            <div className="admin-chart-bars">
              {salesData.slice(-10).map((item, index) => (
                <div key={index} className="admin-chart-bar-group">
                  <div 
                    className="admin-chart-bar admin-revenue-bar" 
                    style={{ height: `${(item.revenue / 7000) * 100}%` }}
                    title={`Revenue: ${formatCurrency(item.revenue)}`}
                  ></div>
                  <div 
                    className="admin-chart-bar admin-orders-bar" 
                    style={{ height: `${(item.orders / 25) * 100}%` }}
                    title={`Orders: ${item.orders}`}
                  ></div>
                  <div className="admin-chart-label">{item.date.split('/')[0]}</div>
                </div>
              ))}
            </div>
            <div className="admin-chart-legend">
              <div className="admin-legend-item">
                <div className="admin-legend-color admin-revenue-bar"></div>
                <span>Revenue</span>
              </div>
              <div className="admin-legend-item">
                <div className="admin-legend-color admin-orders-bar"></div>
                <span>Orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-analytics-grid">
        {/* Top Products */}
        <div className="admin-analytics-card">
          <h3>Top Products Sold</h3>
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
                    <span className="admin-stat-label">sold</span>
                  </div>
                  <div className="admin-revenue-stat">
                    <span className="admin-stat-value">{formatCurrency(product.revenue)}</span>
                    <span className="admin-stat-label">revenue</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="admin-analytics-card">
          <h3>Performance Summary</h3>
          <div className="admin-performance-list">
            <div className="admin-performance-item">
              <span className="admin-performance-label">Conversion Rate</span>
              <div className="admin-performance-value">
                <span>{analytics.conversionRate}%</span>
                <span className="admin-performance-change" style={{ color: getChangeColor(analytics.conversionChange) }}>
                  {getChangeIcon(analytics.conversionChange)}
                  {Math.abs(analytics.conversionChange)}%
                </span>
              </div>
            </div>
            <div className="admin-performance-item">
              <span className="admin-performance-label">Average Order Value</span>
              <div className="admin-performance-value">
                <span>{formatCurrency(analytics.averageOrderValue)}</span>
                <span className="admin-performance-change" style={{ color: getChangeColor(analytics.aovChange) }}>
                  {getChangeIcon(analytics.aovChange)}
                  {Math.abs(analytics.aovChange)}%
                </span>
              </div>
            </div>
            <div className="admin-performance-item">
              <span className="admin-performance-label">Total Customers</span>
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
            <h4>Insights details</h4>
            <ul>
              <li>Revenue increased by {analytics.revenueChange}% compared to the previous period</li>
              <li>MacBook Pro 14-inch M3 is the best selling product</li>
              <li>Conversion rate improved by {analytics.conversionChange}%</li>
              <li>Average order value decreased by {Math.abs(analytics.aovChange)}%</li>
            </ul>
          </div>
        </div>
      </div>
  );
}
