const Product = require('../models/Product');
const { pool } = require('../../config/database');

class AdminService {
    // Lấy tất cả sản phẩm cho admin (không có giới hạn về seller)
    static async getAllProducts(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                category_id = null,
                status = null,
                search = null,
                min_price = null,
                max_price = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, 
                    p.category_id, p.seller_id, p.created_at, p.updated_at,
                    c.name as category_name,
                    u.username as seller_name,
                    u.full_name as seller_full_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramIndex = 1;

            // Filter theo status (admin có thể xem tất cả status)
            if (status) {
                query += ` AND p.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            // Filter theo category
            if (category_id) {
                query += ` AND p.category_id = $${paramIndex}`;
                params.push(category_id);
                paramIndex++;
            }

            // Search theo tên sản phẩm
            if (search) {
                query += ` AND p.name ILIKE $${paramIndex}`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            // Filter theo giá
            if (min_price) {
                query += ` AND p.price >= $${paramIndex}`;
                params.push(min_price);
                paramIndex++;
            }

            if (max_price) {
                query += ` AND p.price <= $${paramIndex}`;
                params.push(max_price);
                paramIndex++;
            }

            // Sắp xếp và phân trang
            query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);

            // Đếm tổng số sản phẩm
            let countQuery = `
                SELECT COUNT(*) as total
                FROM products p
                WHERE 1=1
            `;
            const countParams = [];
            let countParamIndex = 1;

            if (status) {
                countQuery += ` AND p.status = $${countParamIndex}`;
                countParams.push(status);
                countParamIndex++;
            }

            if (category_id) {
                countQuery += ` AND p.category_id = $${countParamIndex}`;
                countParams.push(category_id);
                countParamIndex++;
            }

            if (search) {
                countQuery += ` AND p.name ILIKE $${countParamIndex}`;
                countParams.push(`%${search}%`);
                countParamIndex++;
            }

            if (min_price) {
                countQuery += ` AND p.price >= $${countParamIndex}`;
                countParams.push(min_price);
                countParamIndex++;
            }

            if (max_price) {
                countQuery += ` AND p.price <= $${countParamIndex}`;
                countParams.push(max_price);
                countParamIndex++;
            }

            const countResult = await pool.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);

            return {
                success: true,
                data: {
                    products: result.rows,
                    pagination: {
                        current_page: page,
                        per_page: limit,
                        total: total,
                        total_pages: Math.ceil(total / limit)
                    }
                }
            };
        } catch (error) {
            console.error('Admin get all products error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm',
                error: error.message
            };
        }
    }

    // Lấy chi tiết sản phẩm theo ID
    static async getProductById(id) {
        try {
            const result = await Product.findById(id);
            if (!result.success) {
                return result;
            }

            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            console.error('Admin get product by id error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin sản phẩm',
                error: error.message
            };
        }
    }

    // Tạo sản phẩm mới
    static async createProduct(productData) {
        try {
            const result = await Product.create(productData);
            return result;
        } catch (error) {
            console.error('Admin create product error:', error);
            return {
                success: false,
                message: 'Lỗi khi tạo sản phẩm mới',
                error: error.message
            };
        }
    }

    // Cập nhật sản phẩm (admin có thể cập nhật bất kỳ sản phẩm nào)
    static async updateProduct(id, productData) {
        try {
            // Admin có thể cập nhật sản phẩm mà không cần kiểm tra seller_id
            const result = await Product.update(id, productData);
            return result;
        } catch (error) {
            console.error('Admin update product error:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật sản phẩm',
                error: error.message
            };
        }
    }

    // Xóa sản phẩm (admin có thể xóa bất kỳ sản phẩm nào)
    static async deleteProduct(id) {
        try {
            // Admin có thể xóa sản phẩm mà không cần kiểm tra seller_id
            const result = await Product.delete(id);
            return result;
        } catch (error) {
            console.error('Admin delete product error:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa sản phẩm',
                error: error.message
            };
        }
    }

    // Cập nhật trạng thái sản phẩm (chỉ admin mới có quyền này)
    static async updateProductStatus(id, status) {
        try {
            const validStatuses = ['available', 'out_of_stock', 'discontinued', 'pending'];
            if (!validStatuses.includes(status)) {
                return {
                    success: false,
                    message: 'Trạng thái không hợp lệ'
                };
            }

            const query = `
                UPDATE products 
                SET status = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *
            `;
            
            const result = await pool.query(query, [status, id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                };
            }

            return {
                success: true,
                message: 'Cập nhật trạng thái sản phẩm thành công',
                data: result.rows[0]
            };
        } catch (error) {
            console.error('Admin update product status error:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật trạng thái sản phẩm',
                error: error.message
            };
        }
    }

    // Cập nhật số lượng sản phẩm
    static async updateProductQuantity(id, quantity) {
        try {
            const result = await Product.updateQuantity(id, quantity);
            return result;
        } catch (error) {
            console.error('Admin update product quantity error:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật số lượng sản phẩm',
                error: error.message
            };
        }
    }

    // Lấy thống kê sản phẩm cho admin
    static async getProductStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_products,
                    COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock_products,
                    COUNT(CASE WHEN status = 'discontinued' THEN 1 END) as discontinued_products,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_products,
                    AVG(price) as average_price,
                    MAX(price) as max_price,
                    MIN(price) as min_price,
                    SUM(quantity) as total_inventory
                FROM products
            `;
            
            const result = await pool.query(query);
            
            return {
                success: true,
                data: {
                    ...result.rows[0],
                    average_price: parseFloat(result.rows[0].average_price || 0).toFixed(2),
                    max_price: parseFloat(result.rows[0].max_price || 0),
                    min_price: parseFloat(result.rows[0].min_price || 0),
                    total_inventory: parseInt(result.rows[0].total_inventory || 0)
                }
            };
        } catch (error) {
            console.error('Admin get product stats error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê sản phẩm',
                error: error.message
            };
        }
    }

    // Tìm kiếm sản phẩm theo nhiều tiêu chí
    static async searchProducts(searchParams) {
        try {
            const {
                keyword = '',
                category_id = null,
                status = null,
                min_price = null,
                max_price = null,
                seller_id = null,
                page = 1,
                limit = 20
            } = searchParams;

            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, 
                    p.category_id, p.seller_id, p.created_at, p.updated_at,
                    c.name as category_name,
                    u.username as seller_name,
                    u.full_name as seller_full_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramIndex = 1;

            // Tìm kiếm theo keyword
            if (keyword) {
                query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
                params.push(`%${keyword}%`);
                paramIndex++;
            }

            // Filter theo các tiêu chí khác
            if (category_id) {
                query += ` AND p.category_id = $${paramIndex}`;
                params.push(category_id);
                paramIndex++;
            }

            if (status) {
                query += ` AND p.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (min_price) {
                query += ` AND p.price >= $${paramIndex}`;
                params.push(min_price);
                paramIndex++;
            }

            if (max_price) {
                query += ` AND p.price <= $${paramIndex}`;
                params.push(max_price);
                paramIndex++;
            }

            if (seller_id) {
                query += ` AND p.seller_id = $${paramIndex}`;
                params.push(seller_id);
                paramIndex++;
            }

            query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);

            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.error('Admin search products error:', error);
            return {
                success: false,
                message: 'Lỗi khi tìm kiếm sản phẩm',
                error: error.message
            };
        }
    }
}

module.exports = AdminService;