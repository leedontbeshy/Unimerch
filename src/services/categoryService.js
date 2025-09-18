const Category = require('../models/Category');

class CategoryService {
    
    /**
     * Business Logic: Lấy tất cả danh mục
     */
    static async getAllCategories() {
        return await Category.getAll();
    }
    
    /**
     * Business Logic: Lấy danh mục theo ID
     */
    static async getCategoryById(categoryId) {
        const category = await Category.findById(categoryId);
        
        if (!category) {
            throw new Error('Không tìm thấy danh mục');
        }
        
        return category;
    }
    
    /**
     * Business Logic: Tạo danh mục mới
     */
    static async createCategory(categoryData) {
        const { name, description, imageUrl } = categoryData;
        
        // 1. Kiểm tra tên danh mục đã tồn tại chưa
        const existingCategory = await Category.findByName(name.trim());
        if (existingCategory) {
            throw new Error('Tên danh mục đã tồn tại');
        }
        
        // 2. Chuẩn bị dữ liệu
        const cleanCategoryData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            imageUrl: imageUrl ? imageUrl.trim() : null
        };
        
        // 3. Tạo danh mục mới
        const newCategory = await Category.create(cleanCategoryData);
        return newCategory;
    }
    
    /**
     * Business Logic: Cập nhật danh mục
     */
    static async updateCategory(categoryId, categoryData) {
        const { name, description, imageUrl } = categoryData;
        
        // 1. Kiểm tra danh mục có tồn tại không
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            throw new Error('Không tìm thấy danh mục');
        }
        
        // 2. Kiểm tra tên danh mục đã tồn tại chưa (trừ chính nó)
        const categoryWithSameName = await Category.findByName(name.trim());
        if (categoryWithSameName && categoryWithSameName.id !== categoryId) {
            throw new Error('Tên danh mục đã tồn tại');
        }
        
        // 3. Chuẩn bị dữ liệu
        const cleanCategoryData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            imageUrl: imageUrl ? imageUrl.trim() : null
        };
        
        // 4. Cập nhật danh mục
        const updatedCategory = await Category.update(categoryId, cleanCategoryData);
        
        if (!updatedCategory) {
            throw new Error('Không thể cập nhật danh mục');
        }
        
        return updatedCategory;
    }
    
    /**
     * Business Logic: Xóa danh mục
     */
    static async deleteCategory(categoryId) {
        // 1. Kiểm tra danh mục có tồn tại không
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            throw new Error('Không tìm thấy danh mục');
        }
        
        // 2. Xóa danh mục (model sẽ check có sản phẩm hay không)
        try {
            const deleted = await Category.delete(categoryId);
            
            if (!deleted) {
                throw new Error('Không thể xóa danh mục');
            }
            
            return true;
        } catch (error) {
            // Re-throw business logic errors từ model
            if (error.message === 'Không thể xóa danh mục đã có sản phẩm') {
                throw error;
            }
            throw new Error('Không thể xóa danh mục');
        }
    }
    
    /**
     * Business Logic: Kiểm tra tên danh mục có tồn tại không
     */
    static async checkCategoryNameExists(name, excludeId = null) {
        const existingCategory = await Category.findByName(name);
        
        if (!existingCategory) {
            return false;
        }
        
        if (excludeId && existingCategory.id === excludeId) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Business Logic: Validate category data
     */
    static validateCategoryData(categoryData) {
        const { name, description, imageUrl } = categoryData;
        const errors = [];
        
        // Validate name
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Tên danh mục không được để trống');
        } else if (name.trim().length > 100) {
            errors.push('Tên danh mục không được vượt quá 100 ký tự');
        }
        
        // Validate description
        if (description && typeof description === 'string' && description.length > 500) {
            errors.push('Mô tả không được vượt quá 500 ký tự');
        }
        
        // Validate imageUrl
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 255) {
            errors.push('URL hình ảnh không được vượt quá 255 ký tự');
        }
        
        return errors;
    }
    
    /**
     * Helper: Validate category ID
     */
    static validateCategoryId(id) {
        const categoryId = parseInt(id);
        
        if (!id || isNaN(categoryId) || categoryId <= 0) {
            throw new Error('ID danh mục không hợp lệ');
        }
        
        return categoryId;
    }
}

module.exports = CategoryService;
