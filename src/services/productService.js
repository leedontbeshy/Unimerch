const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Product Service - Chứa toàn bộ business logic cho product management
 * Theo nguyên tắc SRP: Service chỉ chứa business logic, không xử lý request/response
 */
class ProductService {

    /**
     * Business Logic: Lấy danh sách sản phẩm với filter và pagination
     * @param {Object} options - Tùy chọn lọc và phân trang
     * @returns {Object} - Danh sách sản phẩm và thông tin phân trang
     */
    static async getProductsList(options) {
        const {
            page = 1,
            limit = 20,
            category_id,
            status = 'available',
            search,
            min_price,
            max_price,
            seller_id,
            color,
            size
        } = options;

        const filterOptions = {
            page,
            limit,
            category_id,
            status,
            search,
            min_price,
            max_price,
            seller_id,
            color,
            size
        };

        return await Product.getAll(filterOptions);
    }

    /**
     * Business Logic: Lấy thông tin chi tiết sản phẩm theo ID
     * @param {number} productId - ID sản phẩm
     * @returns {Object} - Thông tin sản phẩm
     */
    static async getProductDetails(productId) {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        return product;
    }

    /**
     * Business Logic: Tạo sản phẩm mới
     * @param {Object} productData - Dữ liệu sản phẩm
     * @param {number} sellerId - ID người bán
     * @returns {Object} - Sản phẩm mới được tạo
     */
    static async createNewProduct(productData, sellerId) {
        const {
            name,
            description,
            price,
            discount_price,
            quantity,
            image_url,
            category_id,
            color,
            size
        } = productData;

        // 1. Kiểm tra danh mục có tồn tại không
        const category = await Category.findById(category_id);
        if (!category) {
            throw new Error('Danh mục không tồn tại');
        }

        // 2. Chuẩn bị dữ liệu sản phẩm
        const newProductData = {
            name,
            description,
            price,
            discount_price,
            quantity,
            image_url,
            category_id,
            seller_id: sellerId,
            color,
            size,
            status: 'available'
        };

        // 3. Tạo sản phẩm mới
        const newProduct = await Product.create(newProductData);
        return newProduct;
    }

    /**
     * Business Logic: Cập nhật sản phẩm
     * @param {number} productId - ID sản phẩm
     * @param {Object} updateData - Dữ liệu cập nhật
     * @param {number} sellerId - ID người bán (null nếu admin)
     * @returns {Object} - Sản phẩm đã cập nhật
     */
    static async updateExistingProduct(productId, updateData, sellerId = null) {
        const {
            name,
            description,
            price,
            discount_price,
            quantity,
            image_url,
            category_id,
            status,
            color,
            size
        } = updateData;

        // 1. Kiểm tra sản phẩm có tồn tại không
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // 2. Kiểm tra danh mục có tồn tại không
        const category = await Category.findById(category_id);
        if (!category) {
            throw new Error('Danh mục không tồn tại');
        }

        // 3. Chuẩn bị dữ liệu cập nhật
        const updatedProductData = {
            name,
            description,
            price,
            discount_price: discount_price || null,
            quantity: quantity !== undefined ? quantity : existingProduct.quantity,
            image_url: image_url || existingProduct.image_url,
            category_id,
            status: status || existingProduct.status,
            color: color || existingProduct.color,
            size: size || existingProduct.size
        };

        // 4. Cập nhật sản phẩm
        const updatedProduct = await Product.update(productId, updatedProductData, sellerId);
        
        if (!updatedProduct) {
            throw new Error('Không thể cập nhật sản phẩm. Kiểm tra quyền sở hữu.');
        }

        return updatedProduct;
    }

    /**
     * Business Logic: Xóa sản phẩm
     * @param {number} productId - ID sản phẩm
     * @param {number} sellerId - ID người bán (null nếu admin)
     * @returns {boolean} - Kết quả xóa
     */
    static async deleteProduct(productId, sellerId = null) {
        // 1. Kiểm tra sản phẩm có tồn tại không
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // 2. Xóa sản phẩm
        const deleted = await Product.delete(productId, sellerId);
        
        if (!deleted) {
            throw new Error('Không thể xóa sản phẩm. Kiểm tra quyền sở hữu.');
        }

        return true;
    }

    /**
     * Business Logic: Lấy sản phẩm của seller cụ thể
     * @param {number} sellerId - ID người bán
     * @param {Object} options - Tùy chọn phân trang và lọc
     * @returns {Object} - Danh sách sản phẩm của seller
     */
    static async getProductsBySeller(sellerId, options) {
        const {
            page = 1,
            limit = 20,
            status
        } = options;

        const filterOptions = {
            page,
            limit,
            status
        };

        return await Product.findBySellerId(sellerId, filterOptions);
    }

    /**
     * Business Logic: Lấy sản phẩm nổi bật
     * @param {number} limit - Số lượng sản phẩm nổi bật
     * @returns {Array} - Danh sách sản phẩm nổi bật
     */
    static async getFeaturedProducts(limit = 10) {
        return await Product.getFeatured(limit);
    }

    /**
     * Business Logic: Tìm sản phẩm theo màu sắc và kích thước
     * @param {Object} searchOptions - Tùy chọn tìm kiếm
     * @returns {Object} - Kết quả tìm kiếm
     */
    static async searchProductsByColorSize(searchOptions) {
        const {
            page = 1,
            limit = 20,
            category_id,
            color,
            size
        } = searchOptions;

        const searchParams = {
            page,
            limit,
            category_id,
            color,
            size
        };

        return await Product.findByColorAndSize(searchParams);
    }

    /**
     * Business Logic: Kiểm tra quyền sở hữu sản phẩm
     * @param {number} productId - ID sản phẩm
     * @param {number} userId - ID người dùng
     * @param {string} userRole - Role của người dùng
     * @returns {boolean} - Có quyền hay không
     */
    static async checkProductOwnership(productId, userId, userRole) {
        // Admin có quyền truy cập tất cả
        if (userRole === 'admin') {
            return true;
        }

        const product = await Product.findById(productId);
        if (!product) {
            return false;
        }

        // Seller chỉ có quyền với sản phẩm của mình
        return product.seller_id === userId;
    }

    /**
     * Business Logic: Cập nhật trạng thái sản phẩm hàng loạt
     * @param {Array} productIds - Danh sách ID sản phẩm
     * @param {string} status - Trạng thái mới
     * @param {number} sellerId - ID người bán (null nếu admin)
     * @returns {Array} - Danh sách sản phẩm đã cập nhật
     */
    static async updateProductsStatus(productIds, status, sellerId = null) {
        const updatedProducts = [];
        
        for (const productId of productIds) {
            try {
                const product = await this.updateExistingProduct(
                    productId, 
                    { status }, 
                    sellerId
                );
                updatedProducts.push(product);
            } catch (error) {
                // Bỏ qua lỗi và tiếp tục với sản phẩm khác
                console.warn(`Không thể cập nhật sản phẩm ID ${productId}: ${error.message}`);
            }
        }

        return updatedProducts;
    }

    /**
     * Business Logic: Kiểm tra tồn kho và trạng thái sản phẩm
     * @param {number} productId - ID sản phẩm
     * @param {number} requestedQuantity - Số lượng yêu cầu
     * @returns {Object} - Thông tin kiểm tra
     */
    static async checkProductAvailability(productId, requestedQuantity = 1) {
        const product = await Product.findById(productId);
        
        if (!product) {
            return {
                available: false,
                reason: 'Sản phẩm không tồn tại'
            };
        }

        if (product.status !== 'available') {
            return {
                available: false,
                reason: 'Sản phẩm không khả dụng',
                product
            };
        }

        if (product.quantity < requestedQuantity) {
            return {
                available: false,
                reason: `Số lượng không đủ (còn ${product.quantity})`,
                product
            };
        }

        return {
            available: true,
            product
        };
    }

    /**
     * Business Logic: Lấy thống kê sản phẩm theo seller
     * @param {number} sellerId - ID người bán
     * @returns {Object} - Thống kê sản phẩm
     */
    static async getProductStatsBySeller(sellerId) {
        // Lấy tất cả sản phẩm của seller (không phân trang)
        const allProducts = await Product.findBySellerId(sellerId, { page: 1, limit: 999999 });
        
        const stats = {
            total: allProducts.data.length,
            available: 0,
            out_of_stock: 0,
            discontinued: 0,
            totalValue: 0
        };

        allProducts.data.forEach(product => {
            stats[product.status]++;
            stats.totalValue += (product.discount_price || product.price) * product.quantity;
        });

        return stats;
    }

}

module.exports = ProductService;
