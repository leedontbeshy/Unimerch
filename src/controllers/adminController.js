const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
    // GET /admin/products - Lấy danh sách tất cả sản phẩm
    static async getAllProducts(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                category_id,
                status,
                search,
                min_price,
                max_price
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                category_id: category_id ? parseInt(category_id) : null,
                status,
                search,
                min_price: min_price ? parseFloat(min_price) : null,
                max_price: max_price ? parseFloat(max_price) : null
            };

            const result = await AdminService.getAllProducts(options);
            
            if (result.success) {
                return successResponse(res, result.data, 'Lấy danh sách sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin get all products controller error:', error);
            return errorResponse(res, 'Lỗi server khi lấy danh sách sản phẩm', 500);
        }
    }

    // GET /admin/products/:id - Lấy chi tiết sản phẩm theo ID
    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
            }

            const result = await AdminService.getProductById(parseInt(id));
            
            if (result.success) {
                return successResponse(res, result.data, 'Lấy thông tin sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 404);
            }
        } catch (error) {
            console.error('Admin get product by id controller error:', error);
            return errorResponse(res, 'Lỗi server khi lấy thông tin sản phẩm', 500);
        }
    }

    // POST /admin/products - Tạo sản phẩm mới
    static async createProduct(req, res) {
        try {
            const {
                name,
                description,
                price,
                discount_price,
                quantity,
                image_url,
                color,
                size,
                category_id,
                seller_id,
                status = 'available'
            } = req.body;

            // Validation cơ bản
            if (!name || !price || !quantity || !category_id || !seller_id) {
                return errorResponse(res, 'Thiếu thông tin bắt buộc: name, price, quantity, category_id, seller_id', 400);
            }

            if (price <= 0 || quantity < 0) {
                return errorResponse(res, 'Giá phải lớn hơn 0 và số lượng phải không âm', 400);
            }

            if (discount_price && discount_price >= price) {
                return errorResponse(res, 'Giá khuyến mãi phải nhỏ hơn giá gốc', 400);
            }

            const productData = {
                name: name.trim(),
                description: description ? description.trim() : null,
                price: parseFloat(price),
                discount_price: discount_price ? parseFloat(discount_price) : null,
                quantity: parseInt(quantity),
                image_url: image_url ? image_url.trim() : null,
                color: color ? color.trim() : null,
                size: size ? size.trim() : null,
                category_id: parseInt(category_id),
                seller_id: parseInt(seller_id),
                status
            };

            const result = await AdminService.createProduct(productData);
            
            if (result.success) {
                return successResponse(res, result.data, 'Tạo sản phẩm mới thành công', 201);
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin create product controller error:', error);
            return errorResponse(res, 'Lỗi server khi tạo sản phẩm mới', 500);
        }
    }

    // PUT /admin/products/:id - Cập nhật sản phẩm
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
            }

            const {
                name,
                description,
                price,
                discount_price,
                quantity,
                image_url,
                color,
                size,
                category_id,
                seller_id,
                status
            } = req.body;

            // Validation
            if (price && price <= 0) {
                return errorResponse(res, 'Giá phải lớn hơn 0', 400);
            }

            if (quantity && quantity < 0) {
                return errorResponse(res, 'Số lượng phải không âm', 400);
            }

            if (discount_price && price && discount_price >= price) {
                return errorResponse(res, 'Giá khuyến mãi phải nhỏ hơn giá gốc', 400);
            }

            // Chỉ cập nhật các trường được gửi lên
            const updateData = {};
            if (name !== undefined) updateData.name = name.trim();
            if (description !== undefined) updateData.description = description ? description.trim() : null;
            if (price !== undefined) updateData.price = parseFloat(price);
            if (discount_price !== undefined) updateData.discount_price = discount_price ? parseFloat(discount_price) : null;
            if (quantity !== undefined) updateData.quantity = parseInt(quantity);
            if (image_url !== undefined) updateData.image_url = image_url ? image_url.trim() : null;
            if (color !== undefined) updateData.color = color ? color.trim() : null;
            if (size !== undefined) updateData.size = size ? size.trim() : null;
            if (category_id !== undefined) updateData.category_id = parseInt(category_id);
            if (seller_id !== undefined) updateData.seller_id = parseInt(seller_id);
            if (status !== undefined) updateData.status = status;

            const result = await AdminService.updateProduct(parseInt(id), updateData);
            
            if (result.success) {
                return successResponse(res, result.data, 'Cập nhật sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin update product controller error:', error);
            return errorResponse(res, 'Lỗi server khi cập nhật sản phẩm', 500);
        }
    }

    // DELETE /admin/products/:id - Xóa sản phẩm
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
            }

            const result = await AdminService.deleteProduct(parseInt(id));
            
            if (result.success) {
                return successResponse(res, null, 'Xóa sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin delete product controller error:', error);
            return errorResponse(res, 'Lỗi server khi xóa sản phẩm', 500);
        }
    }

    // PATCH /admin/products/:id/status - Cập nhật trạng thái sản phẩm
    static async updateProductStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!id || isNaN(parseInt(id))) {
                return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
            }

            if (!status) {
                return errorResponse(res, 'Thiếu thông tin trạng thái', 400);
            }

            const result = await AdminService.updateProductStatus(parseInt(id), status);
            
            if (result.success) {
                return successResponse(res, result.data, 'Cập nhật trạng thái sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin update product status controller error:', error);
            return errorResponse(res, 'Lỗi server khi cập nhật trạng thái sản phẩm', 500);
        }
    }

    // PATCH /admin/products/:id/quantity - Cập nhật số lượng sản phẩm
    static async updateProductQuantity(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            
            if (!id || isNaN(parseInt(id))) {
                return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
            }

            if (quantity === undefined || quantity < 0) {
                return errorResponse(res, 'Số lượng phải là số không âm', 400);
            }

            const result = await AdminService.updateProductQuantity(parseInt(id), parseInt(quantity));
            
            if (result.success) {
                return successResponse(res, result.data, 'Cập nhật số lượng sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin update product quantity controller error:', error);
            return errorResponse(res, 'Lỗi server khi cập nhật số lượng sản phẩm', 500);
        }
    }

    // GET /admin/products/stats - Lấy thống kê sản phẩm
    static async getProductStats(req, res) {
        try {
            const result = await AdminService.getProductStats();
            
            if (result.success) {
                return successResponse(res, result.data, 'Lấy thống kê sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin get product stats controller error:', error);
            return errorResponse(res, 'Lỗi server khi lấy thống kê sản phẩm', 500);
        }
    }

    // GET /admin/products/search - Tìm kiếm sản phẩm
    static async searchProducts(req, res) {
        try {
            const {
                keyword = '',
                category_id,
                status,
                min_price,
                max_price,
                seller_id,
                page = 1,
                limit = 20
            } = req.query;

            const searchParams = {
                keyword: keyword.trim(),
                category_id: category_id ? parseInt(category_id) : null,
                status,
                min_price: min_price ? parseFloat(min_price) : null,
                max_price: max_price ? parseFloat(max_price) : null,
                seller_id: seller_id ? parseInt(seller_id) : null,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await AdminService.searchProducts(searchParams);
            
            if (result.success) {
                return successResponse(res, result.data, 'Tìm kiếm sản phẩm thành công');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            console.error('Admin search products controller error:', error);
            return errorResponse(res, 'Lỗi server khi tìm kiếm sản phẩm', 500);
        }
    }
}

module.exports = AdminController;