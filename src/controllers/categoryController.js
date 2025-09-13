const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/response');

// 1. GET /api/categories - Lấy danh sách tất cả danh mục
const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        return successResponse(res, categories, 'Lấy danh sách danh mục thành công');
    } catch (error) {
        console.error('Get categories error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách danh mục', 500);
    }
};

// 2. GET /api/categories/:id - Lấy thông tin danh mục theo ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID danh mục không hợp lệ', 400);
        }

        const category = await Category.findById(parseInt(id));

        if (!category) {
            return errorResponse(res, 'Không tìm thấy danh mục', 404);
        }

        return successResponse(res, category, 'Lấy thông tin danh mục thành công');
    } catch (error) {
        console.error('Get category by ID error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin danh mục', 500);
    }
};

// 3. POST /api/categories - Tạo danh mục mới (Admin/Seller)
const createCategory = async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return errorResponse(res, 'Tên danh mục không được để trống', 400);
        }

        if (name.trim().length > 100) {
            return errorResponse(res, 'Tên danh mục không được vượt quá 100 ký tự', 400);
        }

        if (description && description.length > 500) {
            return errorResponse(res, 'Mô tả không được vượt quá 500 ký tự', 400);
        }

        if (imageUrl && imageUrl.length > 255) {
            return errorResponse(res, 'URL hình ảnh không được vượt quá 255 ký tự', 400);
        }

        // Kiểm tra tên danh mục đã tồn tại chưa
        const existingCategory = await Category.findByName(name.trim());
        if (existingCategory) {
            return errorResponse(res, 'Tên danh mục đã tồn tại', 400);
        }

        const categoryData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            imageUrl: imageUrl ? imageUrl.trim() : null
        };

        const newCategory = await Category.create(categoryData);
        return successResponse(res, newCategory, 'Tạo danh mục thành công', 201);
    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === '23505') { // Unique constraint violation
            return errorResponse(res, 'Tên danh mục đã tồn tại', 400);
        }
        return errorResponse(res, 'Lỗi khi tạo danh mục', 500);
    }
};

// 4. PUT /api/categories/:id - Cập nhật danh mục (Admin/Seller)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, imageUrl } = req.body;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID danh mục không hợp lệ', 400);
        }

        // Validation
        if (!name || name.trim().length === 0) {
            return errorResponse(res, 'Tên danh mục không được để trống', 400);
        }

        if (name.trim().length > 100) {
            return errorResponse(res, 'Tên danh mục không được vượt quá 100 ký tự', 400);
        }

        if (description && description.length > 500) {
            return errorResponse(res, 'Mô tả không được vượt quá 500 ký tự', 400);
        }

        if (imageUrl && imageUrl.length > 255) {
            return errorResponse(res, 'URL hình ảnh không được vượt quá 255 ký tự', 400);
        }

        // Kiểm tra danh mục có tồn tại không
        const existingCategory = await Category.findById(parseInt(id));
        if (!existingCategory) {
            return errorResponse(res, 'Không tìm thấy danh mục', 404);
        }

        // Kiểm tra tên danh mục đã tồn tại chưa (trừ chính nó)
        const categoryWithSameName = await Category.findByName(name.trim());
        if (categoryWithSameName && categoryWithSameName.id !== parseInt(id)) {
            return errorResponse(res, 'Tên danh mục đã tồn tại', 400);
        }

        const categoryData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            imageUrl: imageUrl ? imageUrl.trim() : null
        };

        const updatedCategory = await Category.update(parseInt(id), categoryData);
        return successResponse(res, updatedCategory, 'Cập nhật danh mục thành công');
    } catch (error) {
        console.error('Update category error:', error);
        if (error.code === '23505') { // Unique constraint violation
            return errorResponse(res, 'Tên danh mục đã tồn tại', 400);
        }
        return errorResponse(res, 'Lỗi khi cập nhật danh mục', 500);
    }
};

// 5. DELETE /api/categories/:id - Xóa danh mục (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return errorResponse(res, 'ID danh mục không hợp lệ', 400);
        }

        // Kiểm tra danh mục có tồn tại không
        const existingCategory = await Category.findById(parseInt(id));
        if (!existingCategory) {
            return errorResponse(res, 'Không tìm thấy danh mục', 404);
        }

        const deleted = await Category.delete(parseInt(id));
        if (deleted) {
            return successResponse(res, null, 'Xóa danh mục thành công');
        } else {
            return errorResponse(res, 'Không thể xóa danh mục', 400);
        }
    } catch (error) {
        console.error('Delete category error:', error);
        if (error.message === 'Không thể xóa danh mục đã có sản phẩm') {
            return errorResponse(res, 'Không thể xóa danh mục đã có sản phẩm', 400);
        }
        return errorResponse(res, 'Lỗi khi xóa danh mục', 500);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};