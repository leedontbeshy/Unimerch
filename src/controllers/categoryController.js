// src/controllers/categoryController.js

const getAllCategories = (req, res) => {
  res.json({ message: "All categories (demo)" });
};

const getCategoryById = (req, res) => {
  res.json({ message: `Category with ID: ${req.params.id}` });
};

const createCategory = (req, res) => {
  res.json({ message: "Category created (demo)" });
};

const updateCategory = (req, res) => {
  res.json({ message: `Category ${req.params.id} updated (demo)` });
};

const deleteCategory = (req, res) => {
  res.json({ message: `Category ${req.params.id} deleted (demo)` });
};

const getCategoryProducts = (req, res) => {
  res.json({ message: `Products in category ${req.params.id}` });
};

const getCategoryStats = (req, res) => {
  res.json({ message: `Stats for category ${req.params.id}` });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  getCategoryStats,
};
