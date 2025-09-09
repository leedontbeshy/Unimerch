// src/controllers/statsController.js

// Dashboard tổng hợp
const getDashboardStats = (req, res) => {
  res.json({
    totalUsers: 120,
    totalOrders: 450,
    totalRevenue: 150000,
    topProducts: ["Laptop", "Shoes", "Headphones"]
  });
};

// Thống kê seller cụ thể
const getSellerStats = (req, res) => {
  res.json({
    sellerId: req.params.sellerId,
    totalProducts: 25,
    totalOrders: 80,
    revenue: 35000
  });
};

// Thống kê sản phẩm
const getProductStats = (req, res) => {
  res.json({
    totalProducts: 500,
    activeProducts: 470,
    inactiveProducts: 30
  });
};

// Thống kê đơn hàng
const getOrderStats = (req, res) => {
  res.json({
    totalOrders: 1000,
    pending: 100,
    shipped: 800,
    cancelled: 100
  });
};

// Thống kê người dùng
const getUserStats = (req, res) => {
  res.json({
    totalUsers: 120,
    customers: 100,
    sellers: 15,
    admins: 5
  });
};

// Thống kê doanh thu
const getRevenueStats = (req, res) => {
  res.json({
    daily: 2000,
    monthly: 45000,
    yearly: 520000
  });
};

// Thống kê theo category
const getCategoryStats = (req, res) => {
  res.json([
    { category: "Electronics", productCount: 120 },
    { category: "Clothing", productCount: 200 },
    { category: "Books", productCount: 50 }
  ]);
};

// Thống kê review
const getReviewStats = (req, res) => {
  res.json({
    totalReviews: 300,
    averageRating: 4.2,
    fiveStars: 180,
    oneStars: 10
  });
};

// Thống kê bán hàng theo kỳ (day/week/month)
const getSalesStats = (req, res) => {
  const { period } = req.params;
  res.json({
    period,
    sales: [
      { date: "2025-09-01", value: 2000 },
      { date: "2025-09-02", value: 3500 }
    ]
  });
};

// Top sản phẩm bán chạy
const getTopProducts = (req, res) => {
  res.json([
    { product: "Laptop", sales: 120 },
    { product: "Shoes", sales: 100 },
    { product: "Phone", sales: 80 }
  ]);
};

module.exports = {
  getDashboardStats,
  getSellerStats,
  getProductStats,
  getOrderStats,
  getUserStats,
  getRevenueStats,
  getCategoryStats,
  getReviewStats,
  getSalesStats,
  getTopProducts,
};
