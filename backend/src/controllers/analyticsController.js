import Order from "../models/Order.js";
import Laptop from "../models/Laptop.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

// ADMIN - GET /api/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    
    // Calculate days based on timeRange
    let days = 30; // default to month
    if (timeRange === 'week') days = 7;
    else if (timeRange === 'quarter') days = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get orders in time range
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $in: ['paid', 'shipped', 'completed'] }
    }).populate('items.laptop');
    
    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);
    
    const previousOrders = await Order.find({
      createdAt: { 
        $gte: previousStartDate,
        $lt: startDate
      },
      status: { $in: ['paid', 'shipped', 'completed'] }
    });
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const previousOrderCount = previousOrders.length;
    const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
    
    // Calculate changes
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const ordersChange = previousOrderCount > 0
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
      : 0;
    const aovChange = previousAOV > 0
      ? ((averageOrderValue - previousAOV) / previousAOV) * 100
      : 0;
    
    // Get total customers
    const totalCustomers = await User.countDocuments();
    const previousCustomers = await User.countDocuments({
      createdAt: { $lt: startDate }
    });
    const customersChange = previousCustomers > 0
      ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
      : 0;
    
    // Get top products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const laptopId = item.laptop._id?.toString() || item.laptop.toString();
        if (!productSales[laptopId]) {
          productSales[laptopId] = {
            laptop: item.laptop,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[laptopId].quantity += item.quantity;
        productSales[laptopId].revenue += (item.price || item.laptop.price) * item.quantity;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(item => ({
        id: item.laptop._id || item.laptop.id,
        name: item.laptop.name,
        brand: item.laptop.brand,
        image: item.laptop.image,
        sales: item.quantity,
        revenue: item.revenue
      }));
    
    // Generate daily sales data
    const dailySales = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
      dailySales.push({
        date: date.toISOString(),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }
    
    // Calculate conversion rate (simplified - orders / total visitors estimate)
    const conversionRate = 3.2; // This would typically come from analytics service
    const conversionChange = 0.8;
    
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenueChange,
        totalOrders,
        ordersChange,
        averageOrderValue,
        aovChange,
        totalCustomers,
        customersChange,
        conversionRate,
        conversionChange,
        topProducts,
        dailySales
      }
    });
  } catch (error) {
    logger.error("Error in getAnalytics: " + error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

