// src/controllers/uploadController.js
const path = require("path");
const fs = require("fs");

// Upload 1 ảnh
const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
};

// Upload nhiều ảnh
const uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No images uploaded" });
  const files = req.files.map(f => ({ filename: f.filename, path: `/uploads/${f.filename}` }));
  res.json({ files });
};

// Upload ảnh sản phẩm
const uploadProductImages = (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No product images uploaded" });
  const files = req.files.map(f => ({ filename: f.filename, path: `/uploads/products/${f.filename}` }));
  res.json({ files });
};

// Upload ảnh category
const uploadCategoryImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No category image uploaded" });
  res.json({ filename: req.file.filename, path: `/uploads/categories/${req.file.filename}` });
};

// Upload avatar user
const uploadAvatar = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No avatar uploaded" });
  res.json({ filename: req.file.filename, path: `/uploads/avatars/${req.file.filename}` });
};

// Xoá file
const deleteFile = (req, res) => {
  const filePath = path.join(__dirname, "../../uploads", req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(404).json({ message: "File not found" });
    res.json({ message: "File deleted successfully" });
  });
};

// Lấy ảnh public
const getImage = (req, res) => {
  const filePath = path.join(__dirname, "../../uploads", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  res.sendFile(filePath);
};

module.exports = {
  uploadImage,
  uploadImages,
  uploadProductImages,
  uploadCategoryImage,
  uploadAvatar,
  deleteFile,
  getImage,
};
