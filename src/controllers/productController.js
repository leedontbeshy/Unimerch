const Product = require('../models/Product');
const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/response');

// 1. GET /api/products - Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category_id,
            status,
            search,
            min_price,
            max_price,
            seller_id
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            category_id: category_id ? parseInt(category_id) : null,
            status: status || 'available',
            search,
            min_price: min_price ? parseFloat(min_price) : null,
            max_price: max_price ? parseFloat(max_price) : null,
            seller_id: seller_id ? parseInt(seller_id) : null
        };

        const result = await Product.getAll(options);
        
        return successResponse(res, result, 'Lấy danh sách sản phẩm thành công');
    } catch (error) {
        console.error('Get products error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách sản phẩm', 500);
    }
};

// 2. GET /api/products/:id - Lấy thông tin chi tiết sản phẩm
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        const product = await Product.findById(parseInt(id));
        
        if (!product) {
            return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
        }

        return successResponse(res, product, 'Lấy thông tin sản phẩm thành công');
    } catch (error) {
        console.error('Get product by id error:', error);
        return errorResponse(res, 'Lỗi khi lấy thông tin sản phẩm', 500);
    }
};

// 3. POST /api/products - Tạo sản phẩm mới (Seller/Admin)
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount_price,
            quantity,
            image_url,
            category_id
        } = req.body;

        // Validation
        if (!name || !price || !category_id) {
            return errorResponse(res, 'Tên sản phẩm, giá và danh mục là bắt buộc', 400);
        }

        if (price <= 0) {
            return errorResponse(res, 'Giá sản phẩm phải lớn hơn 0', 400);
        }

        if (discount_price && discount_price >= price) {
            return errorResponse(res, 'Giá khuyến mãi phải nhỏ hơn giá gốc', 400);
        }

        // Kiểm tra category tồn tại
        const category = await Category.findById(category_id);
        if (!category) {
            return errorResponse(res, 'Danh mục không tồn tại', 400);
        }

        const productData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            price: parseFloat(price),
            discount_price: discount_price ? parseFloat(discount_price) : null,
            quantity: quantity ? parseInt(quantity) : 0,
            image_url: image_url ? image_url.trim() : null,
            category_id: parseInt(category_id),
            seller_id: req.user.id
        };

        const newProduct = await Product.create(productData);
        
        return successResponse(res, newProduct, 'Tạo sản phẩm thành công', 201);
    } catch (error) {
        console.error('Create product error:', error);
        return errorResponse(res, 'Lỗi khi tạo sản phẩm', 500);
    }
};

// 4. PUT /api/products/:id - Cập nhật sản phẩm (Seller/Admin)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            discount_price,
            quantity,
            image_url,
            category_id,
            status
        } = req.body;

        if (!id || isNaN(id)) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        // Validation
        if (!name || !price || !category_id) {
            return errorResponse(res, 'Tên sản phẩm, giá và danh mục là bắt buộc', 400);
        }

        if (price <= 0) {
            return errorResponse(res, 'Giá sản phẩm phải lớn hơn 0', 400);
        }

        if (discount_price && discount_price >= price) {
            return errorResponse(res, 'Giá khuyến mãi phải nhỏ hơn giá gốc', 400);
        }

        // Kiểm tra category tồn tại
        const category = await Category.findById(category_id);
        if (!category) {
            return errorResponse(res, 'Danh mục không tồn tại', 400);
        }

        // Kiểm tra sản phẩm tồn tại
        const existingProduct = await Product.findById(parseInt(id));
        if (!existingProduct) {
            return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
        }

        const productData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            price: parseFloat(price),
            discount_price: discount_price ? parseFloat(discount_price) : null,
            quantity: quantity !== undefined ? parseInt(quantity) : existingProduct.quantity,
            image_url: image_url ? image_url.trim() : existingProduct.image_url,
            category_id: parseInt(category_id),
            status: status || existingProduct.status
        };

        // Nếu là seller, chỉ cho phép cập nhật sản phẩm của chính mình
        const sellerId = req.user.role === 'seller' ? req.user.id : null;
        
        const updatedProduct = await Product.update(parseInt(id), productData, sellerId);
        
        if (!updatedProduct) {
            return errorResponse(res, 'Không thể cập nhật sản phẩm. Kiểm tra quyền sở hữu.', 403);
        }

        return successResponse(res, updatedProduct, 'Cập nhật sản phẩm thành công');
    } catch (error) {
        console.error('Update product error:', error);
        return errorResponse(res, 'Lỗi khi cập nhật sản phẩm', 500);
    }
};

// 5. DELETE /api/products/:id - Xóa sản phẩm (Seller/Admin)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return errorResponse(res, 'ID sản phẩm không hợp lệ', 400);
        }

        // Kiểm tra sản phẩm tồn tại
        const existingProduct = await Product.findById(parseInt(id));
        if (!existingProduct) {
            return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
        }

        // Nếu là seller, chỉ cho phép xóa sản phẩm của chính mình
        const sellerId = req.user.role === 'seller' ? req.user.id : null;
        
        const deleted = await Product.delete(parseInt(id), sellerId);
        
        if (!deleted) {
            return errorResponse(res, 'Không thể xóa sản phẩm. Kiểm tra quyền sở hữu.', 403);
        }

        return successResponse(res, null, 'Xóa sản phẩm thành công');
    } catch (error) {
        console.error('Delete product error:', error);
        return errorResponse(res, 'Lỗi khi xóa sản phẩm', 500);
    }
};

// 6. GET /api/products/seller/:seller_id - Lấy sản phẩm của seller
const getProductsBySeller = async (req, res) => {
    try {
        const { seller_id } = req.params;
        const {
            page = 1,
            limit = 20,
            status
        } = req.query;

        if (!seller_id || isNaN(seller_id)) {
            return errorResponse(res, 'ID seller không hợp lệ', 400);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            status: status
        };

        const result = await Product.findBySellerId(parseInt(seller_id), options);
        
        return successResponse(res, result, 'Lấy danh sách sản phẩm của seller thành công');
    } catch (error) {
        console.error('Get products by seller error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách sản phẩm của seller', 500);
    }
};

// 7. GET /api/products/featured - Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const products = await Product.getFeatured(parseInt(limit));
        
        return successResponse(res, products, 'Lấy danh sách sản phẩm nổi bật thành công');
    } catch (error) {
        console.error('Get featured products error:', error);
        return errorResponse(res, 'Lỗi khi lấy danh sách sản phẩm nổi bật', 500);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeller,
    getFeaturedProducts
};
