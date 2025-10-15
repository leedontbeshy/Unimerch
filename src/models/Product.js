const { pool } = require('../../config/database');

class Product {
    // Lấy tất cả sản phẩm với phân trang và filter
    static async getAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                category_id = null,
                status = 'available',
                search = null,
                min_price = null,
                max_price = null,
                seller_id = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, p.created_at, p.updated_at,
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

            // Filter theo status
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

            // Filter theo seller
            if (seller_id) {
                query += ` AND p.seller_id = $${paramIndex}`;
                params.push(seller_id);
                paramIndex++;
            }

            // Search theo tên sản phẩm
            if (search) {
                query += ` AND (LOWER(p.name) LIKE LOWER($${paramIndex}) OR LOWER(p.description) LIKE LOWER($${paramIndex}))`;
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

            if (seller_id) {
                countQuery += ` AND p.seller_id = $${countParamIndex}`;
                countParams.push(seller_id);
                countParamIndex++;
            }

            if (search) {
                countQuery += ` AND (LOWER(p.name) LIKE LOWER($${countParamIndex}) OR LOWER(p.description) LIKE LOWER($${countParamIndex}))`;
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
                products: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    static async findById(id) {
        try {
            const result = await pool.query(`
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, p.created_at, p.updated_at,
                    p.category_id, p.seller_id,
                    c.name as category_name,
                    u.username as seller_name,
                    u.full_name as seller_full_name,
                    u.email as seller_email,
                    u.phone as seller_phone
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE p.id = $1
            `, [id]);
            
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async create(productData) {
        try {
            const { 
                name, 
                description, 
                price, 
                discount_price, 
                quantity, 
                image_url, 
                category_id, 
                seller_id,
                color,
                size
            } = productData;

            const result = await pool.query(`
                INSERT INTO products (
                    name, description, price, discount_price, quantity, 
                    image_url, category_id, seller_id, color, size, status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `, [
                name, 
                description || null, 
                price, 
                discount_price || null, 
                quantity || 0, 
                image_url || null, 
                category_id, 
                seller_id,
                color || null,
                size || null
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật sản phẩm
    static async update(id, productData, sellerId = null) {
        try {
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
            } = productData;

            // Kiểm tra quyền sở hữu nếu có sellerId
            let query = `
                UPDATE products 
                SET name = $1, description = $2, price = $3, discount_price = $4, 
                    quantity = $5, image_url = $6, category_id = $7, status = $8,
                    color = $9, size = $10, updated_at = CURRENT_TIMESTAMP
                WHERE id = $11
            `;
            let params = [
                name, 
                description || null, 
                price, 
                discount_price || null, 
                quantity, 
                image_url || null, 
                category_id,
                status || 'available',
                color || null,
                size || null,
                id
            ];

            // Nếu là seller, chỉ cho phép cập nhật sản phẩm của chính mình
            if (sellerId) {
                query += ` AND seller_id = $12`;
                params.push(sellerId);
            }

            query += ` RETURNING *`;

            const result = await pool.query(query, params);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Thêm method tìm kiếm theo color và size
    static async findByColorAndSize(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                category_id = null,
                color = null,
                size = null,
                status = 'available'
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, p.created_at,
                    c.name as category_name,
                    u.username as seller_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE p.status = $1
            `;
            
            const params = [status];
            let paramIndex = 2;

            if (category_id) {
                query += ` AND p.category_id = $${paramIndex}`;
                params.push(category_id);
                paramIndex++;
            }

            if (color) {
                query += ` AND LOWER(p.color) = LOWER($${paramIndex})`;
                params.push(color);
                paramIndex++;
            }

            if (size) {
                query += ` AND LOWER(p.size) = LOWER($${paramIndex})`;
                params.push(size);
                paramIndex++;
            }

            query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }


    // Xóa sản phẩm
    static async delete(id, sellerId = null) {
        try {
            let query = 'DELETE FROM products WHERE id = $1';
            let params = [id];

            // Nếu là seller, chỉ cho phép xóa sản phẩm của chính mình
            if (sellerId) {
                query += ' AND seller_id = $2';
                params.push(sellerId);
            }

            query += ' RETURNING id';

            const result = await pool.query(query, params);
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm của seller
    static async findBySellerId(sellerId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, p.created_at, p.updated_at,
                    c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.seller_id = $1
            `;
            
            const params = [sellerId];
            let paramIndex = 2;

            if (status) {
                query += ` AND p.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);

            // Đếm tổng số sản phẩm của seller
            let countQuery = 'SELECT COUNT(*) as total FROM products WHERE seller_id = $1';
            const countParams = [sellerId];

            if (status) {
                countQuery += ' AND status = $2';
                countParams.push(status);
            }

            const countResult = await pool.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);

            return {
                products: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm nổi bật (có thể dựa vào số lượng bán, rating, etc.)
    static async getFeatured(limit = 10) {
        try {
            // Tạm thời lấy sản phẩm mới nhất và có sẵn
            const result = await pool.query(`
                SELECT 
                    p.id, p.name, p.description, p.price, p.discount_price, 
                    p.quantity, p.image_url, p.color, p.size, p.status, p.created_at,
                    c.name as category_name,
                    u.username as seller_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE p.status = 'available' AND p.quantity > 0
                ORDER BY p.created_at DESC
                LIMIT $1
            `, [limit]);

            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật số lượng sản phẩm
    static async updateQuantity(id, quantity) {
        try {
            const result = await pool.query(`
                UPDATE products 
                SET quantity = $1, 
                    status = CASE 
                        WHEN $1 <= 0 THEN 'out_of_stock' 
                        ELSE 'available' 
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [quantity, id]);

            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
}



module.exports = Product;
