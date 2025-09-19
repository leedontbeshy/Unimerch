const ProductService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. GET /api/products - Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
    try {
        const result = await ProductService.getProductsList(req.query);
        return successResponse(res, result, 'Lấy danh sách sản phẩm thành công');
    } catch (error) {
        console.error('Get products error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy danh sách sản phẩm', 500);
    }
};

// 2. GET /api/products/:id - Lấy thông tin chi tiết sản phẩm  
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getProductDetails(parseInt(id));
        return successResponse(res, product, 'Lấy thông tin sản phẩm thành công');
    } catch (error) {
        console.error('Get product by id error:', error);
        if (error.message === 'Không tìm thấy sản phẩm') {
            return errorResponse(res, error.message, 404);
        }
        return errorResponse(res, error.message || 'Lỗi khi lấy thông tin sản phẩm', 500);
    }
};

// 3. POST /api/products - Tạo sản phẩm mới (Seller/Admin)
const createProduct = async (req, res) => {
    try {
        const newProduct = await ProductService.createNewProduct(req.body, req.user.id);
        return successResponse(res, newProduct, 'Tạo sản phẩm thành công', 201);
    } catch (error) {
        console.error('Create product error:', error);
        if (error.message === 'Danh mục không tồn tại') {
            return errorResponse(res, error.message, 400);
        }
        return errorResponse(res, error.message || 'Lỗi khi tạo sản phẩm', 500);
    }
};

// 4. PUT /api/products/:id - Cập nhật sản phẩm (Seller/Admin)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.role === 'seller' ? req.user.id : null;
        
        const updatedProduct = await ProductService.updateExistingProduct(
            parseInt(id), 
            req.body, 
            sellerId
        );
        
        return successResponse(res, updatedProduct, 'Cập nhật sản phẩm thành công');
    } catch (error) {
        console.error('Update product error:', error);
        if (error.message === 'Không tìm thấy sản phẩm') {
            return errorResponse(res, error.message, 404);
        }
        if (error.message === 'Danh mục không tồn tại') {
            return errorResponse(res, error.message, 400);
        }
        if (error.message === 'Không thể cập nhật sản phẩm. Kiểm tra quyền sở hữu.') {
            return errorResponse(res, error.message, 403);
        }
        return errorResponse(res, error.message || 'Lỗi khi cập nhật sản phẩm', 500);
    }
};

// 5. DELETE /api/products/:id - Xóa sản phẩm (Seller/Admin)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.role === 'seller' ? req.user.id : null;
        
        await ProductService.deleteProduct(parseInt(id), sellerId);
        
        return successResponse(res, null, 'Xóa sản phẩm thành công');
    } catch (error) {
        console.error('Delete product error:', error);
        if (error.message === 'Không tìm thấy sản phẩm') {
            return errorResponse(res, error.message, 404);
        }
        if (error.message === 'Không thể xóa sản phẩm. Kiểm tra quyền sở hữu.') {
            return errorResponse(res, error.message, 403);
        }
        return errorResponse(res, error.message || 'Lỗi khi xóa sản phẩm', 500);
    }
};

// 6. GET /api/products/seller/:seller_id - Lấy sản phẩm của seller
const getProductsBySeller = async (req, res) => {
    try {
        const { seller_id } = req.params;
        const result = await ProductService.getProductsBySeller(parseInt(seller_id), req.query);
        return successResponse(res, result, 'Lấy danh sách sản phẩm của seller thành công');
    } catch (error) {
        console.error('Get products by seller error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy danh sách sản phẩm của seller', 500);
    }
};

// 7. GET /api/products/featured - Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const products = await ProductService.getFeaturedProducts(parseInt(limit));
        return successResponse(res, products, 'Lấy danh sách sản phẩm nổi bật thành công');
    } catch (error) {
        console.error('Get featured products error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy danh sách sản phẩm nổi bật', 500);
    }
};

// Thêm API để tìm kiếm theo color và size
const getProductsByColorSize = async (req, res) => {
    try {
        const products = await ProductService.searchProductsByColorSize(req.query);
        return successResponse(res, products, 'Lấy sản phẩm thành công');
    } catch (error) {
        console.error('Get products by color/size error:', error);
        return errorResponse(res, error.message || 'Lỗi khi lấy sản phẩm', 500);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeller,
    getFeaturedProducts,
    getProductsByColorSize
};