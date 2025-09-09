// src/controllers/reviewController.js

// Lấy tất cả review (admin hoặc review của user đang đăng nhập)
const getReviews = (req, res) => {
  res.json({ message: "Get all reviews or user's reviews (demo)" });
};

// Lấy review theo product
const getProductReviews = (req, res) => {
  res.json({ message: `Get reviews for product ${req.params.productId}` });
};

// Lấy 1 review theo ID
const getReviewById = (req, res) => {
  res.json({ message: `Get review with ID ${req.params.id}` });
};

// Tạo review mới
const createReview = (req, res) => {
  res.json({ message: "Review created (demo)" });
};

// Cập nhật review
const updateReview = (req, res) => {
  res.json({ message: `Review ${req.params.id} updated (demo)` });
};

// Xoá review
const deleteReview = (req, res) => {
  res.json({ message: `Review ${req.params.id} deleted (demo)` });
};

// Lấy review của 1 user (Admin)
const getUserReviews = (req, res) => {
  res.json({ message: `Get reviews by user ${req.params.userId}` });
};

// Lấy thống kê review cho 1 sản phẩm
const getProductReviewStats = (req, res) => {
  res.json({ message: `Stats for product ${req.params.productId}` });
};

// Đánh dấu review là hữu ích
const markReviewHelpful = (req, res) => {
  res.json({ message: `Review ${req.params.id} marked as helpful (demo)` });
};

module.exports = {
  getReviews,
  getProductReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getProductReviewStats,
  markReviewHelpful,
};
