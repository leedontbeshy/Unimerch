// src/controllers/searchController.js

// Tìm kiếm sản phẩm
const searchProducts = (req, res) => {
  const { q } = req.query;
  res.json({ message: `Search products with query: ${q}` });
};

// Tìm kiếm category
const searchCategories = (req, res) => {
  const { q } = req.query;
  res.json({ message: `Search categories with query: ${q}` });
};

// Tìm kiếm user (seller)
const searchUsers = (req, res) => {
  const { q } = req.query;
  res.json({ message: `Search users with query: ${q}` });
};

// Gợi ý tìm kiếm
const getSearchSuggestions = (req, res) => {
  res.json({ suggestions: ["shirt", "pants", "shoes"] });
};

// Tìm kiếm phổ biến
const getPopularSearches = (req, res) => {
  res.json({ popular: ["iphone", "laptop", "headphones"] });
};

// Tìm kiếm nâng cao (ví dụ có filter giá, rating…)
const advancedSearch = (req, res) => {
  res.json({ message: "Advanced search with filters (demo)" });
};

// Lưu lịch sử tìm kiếm
const logSearchTerm = (req, res) => {
  const { term } = req.body;
  res.json({ message: `Logged search term: ${term}` });
};

module.exports = {
  searchProducts,
  searchCategories,
  searchUsers,
  getSearchSuggestions,
  getPopularSearches,
  advancedSearch,
  logSearchTerm,
};
