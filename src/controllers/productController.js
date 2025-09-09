// src/controllers/productController.js

// Lấy toàn bộ sản phẩm (demo)
const getAllProducts = (req, res) => {
  res.json({ message: "All products (demo)" });
};

// Lấy sản phẩm nổi bật
const getFeaturedProducts = (req, res) => {
  res.json({ message: "Featured products (demo)" });
};

// Lấy sản phẩm theo seller
const getProductsBySeller = (req, res) => {
  res.json({ message: `Products for seller ${req.params.sellerId}` });
};

// Lấy sản phẩm theo category
const getProductsByCategory = (req, res) => {
  res.json({ message: `Products in category ${req.params.categoryId}` });
};

// Lấy 1 sản phẩm theo ID
const getProductById = (req, res) => {
  res.json({ message: `Product with ID ${req.params.id}` });
};

// Tạo sản phẩm mới
const createProduct = (req, res) => {
  res.json({ message: "Product created (demo)" });
};

// Cập nhật sản phẩm
const updateProduct = (req, res) => {
  res.json({ message: `Product ${req.params.id} updated (demo)` });
};

// Xoá sản phẩm
const deleteProduct = (req, res) => {
  res.json({ message: `Product ${req.params.id} deleted (demo)` });
};

// Cập nhật trạng thái sản phẩm
const updateProductStatus = (req, res) => {
  res.json({ message: `Product ${req.params.id} status updated (demo)` });
};

// Cập nhật số lượng sản phẩm
const updateProductQuantity = (req, res) => {
  res.json({ message: `Product ${req.params.id} quantity updated (demo)` });
};

// Lấy danh sách review sản phẩm
const getProductReviews = (req, res) => {
  res.json({ message: `Reviews for product ${req.params.id}` });
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductsBySeller,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductQuantity,
  getProductReviews
};
