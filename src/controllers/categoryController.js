const CategoryService = require('../services/categoryService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. GET /api/categories - Lấy danh sách tất cả danh mục
const getCategories = async (req, res) => {
    try {
        // Controller chỉ gọi service
        const categories = await CategoryService.getAllCategories();
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
        
        // Controller chỉ gọi service
        const categoryId = CategoryService.validateCategoryId(id);
        const category = await CategoryService.getCategoryById(categoryId);

        return successResponse(res, category, 'Lấy thông tin danh mục thành công');
    } catch (error) {
        console.error('Get category by ID error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'ID danh mục không hợp lệ') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy danh mục') {
            return errorResponse(res, error.message, 404);
        }
        
        return errorResponse(res, 'Lỗi khi lấy thông tin danh mục', 500);
    }
};

// 3. POST /api/categories - Tạo danh mục mới (Admin/Seller)
const createCategory = async (req, res) => {
    try {
        // Controller chỉ gọi service
        const newCategory = await CategoryService.createCategory(req.body);
        
        return successResponse(res, newCategory, 'Tạo danh mục thành công', 201);
    } catch (error) {
        console.error('Create category error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'Tên danh mục đã tồn tại') {
            return errorResponse(res, error.message, 400);
        }
        
        // PostgreSQL unique constraint violation
        if (error.code === '23505') {
            return errorResponse(res, 'Tên danh mục đã tồn tại', 400);
        }
        
        return errorResponse(res, 'Lỗi khi tạo danh mục', 500);
    }
};

// 4. PUT /api/categories/:id - Cập nhật danh mục (Admin/Seller)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller chỉ gọi service
        const categoryId = CategoryService.validateCategoryId(id);
        const updatedCategory = await CategoryService.updateCategory(categoryId, req.body);
        
        return successResponse(res, updatedCategory, 'Cập nhật danh mục thành công');
    } catch (error) {
        console.error('Update category error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'ID danh mục không hợp lệ') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy danh mục') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message === 'Tên danh mục đã tồn tại' || 
            error.message === 'Không thể cập nhật danh mục') {
            return errorResponse(res, error.message, 400);
        }
        
        // PostgreSQL unique constraint violation
        if (error.code === '23505') {
            return errorResponse(res, 'Tên danh mục đã tồn tại', 400);
        }
        
        return errorResponse(res, 'Lỗi khi cập nhật danh mục', 500);
    }
};

// 5. DELETE /api/categories/:id - Xóa danh mục (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller chỉ gọi service
        const categoryId = CategoryService.validateCategoryId(id);
        await CategoryService.deleteCategory(categoryId);
        
        return successResponse(res, null, 'Xóa danh mục thành công');
    } catch (error) {
        console.error('Delete category error:', error);
        
        // Xử lý lỗi từ service
        if (error.message === 'ID danh mục không hợp lệ') {
            return errorResponse(res, error.message, 400);
        }
        
        if (error.message === 'Không tìm thấy danh mục') {
            return errorResponse(res, error.message, 404);
        }
        
        if (error.message === 'Không thể xóa danh mục đã có sản phẩm' ||
            error.message === 'Không thể xóa danh mục') {
            return errorResponse(res, error.message, 400);
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