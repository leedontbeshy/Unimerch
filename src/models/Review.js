const { pool } = require('../../config/database');

class Review {
    // Lấy tất cả review với phân trang và filter
    static async getAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                product_id = null,
                user_id = null,
                rating = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
                    u.username, u.full_name as user_full_name,
                    p.name as product_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                WHERE 1=1
            `;
            
            const params = [];
            let paramIndex = 1;

            // Filter theo product_id
            if (product_id) {
                query += ` AND r.product_id = $${paramIndex}`;
                params.push(product_id);
                paramIndex++;
            }

            // Filter theo user_id
            if (user_id) {
                query += ` AND r.user_id = $${paramIndex}`;
                params.push(user_id);
                paramIndex++;
            }

            // Filter theo rating
            if (rating) {
                query += ` AND r.rating = $${paramIndex}`;
                params.push(rating);
                paramIndex++;
            }

            // Sắp xếp theo thời gian tạo mới nhất
            query += ` ORDER BY r.created_at DESC`;

            // Thêm phân trang
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);

            // Query để đếm tổng số records
            let countQuery = `
                SELECT COUNT(*) as total
                FROM reviews r
                WHERE 1=1
            `;
            const countParams = [];
            let countParamIndex = 1;

            if (product_id) {
                countQuery += ` AND r.product_id = $${countParamIndex}`;
                countParams.push(product_id);
                countParamIndex++;
            }

            if (user_id) {
                countQuery += ` AND r.user_id = $${countParamIndex}`;
                countParams.push(user_id);
                countParamIndex++;
            }

            if (rating) {
                countQuery += ` AND r.rating = $${countParamIndex}`;
                countParams.push(rating);
                countParamIndex++;
            }

            const countResult = await pool.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);

            return {
                reviews: result.rows,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            console.error('Get all reviews error:', error);
            throw error;
        }
    }

    // Lấy review theo ID
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
                    u.username, u.full_name as user_full_name,
                    p.name as product_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                WHERE r.id = $1
            `;
            
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Find review by id error:', error);
            throw error;
        }
    }

    // Lấy reviews theo product_id
    static async findByProductId(product_id, options = {}) {
        try {
            const { page = 1, limit = 20 } = options;
            return await this.getAll({ ...options, product_id, page, limit });
        } catch (error) {
            console.error('Find reviews by product id error:', error);
            throw error;
        }
    }

    // Lấy reviews theo user_id
    static async findByUserId(user_id, options = {}) {
        try {
            const { page = 1, limit = 20 } = options;
            return await this.getAll({ ...options, user_id, page, limit });
        } catch (error) {
            console.error('Find reviews by user id error:', error);
            throw error;
        }
    }

    // Tạo review mới
    static async create(reviewData) {
        try {
            const { product_id, user_id, rating, comment } = reviewData;
            
            const query = `
                INSERT INTO reviews (product_id, user_id, rating, comment)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const result = await pool.query(query, [product_id, user_id, rating, comment]);
            return result.rows[0];
        } catch (error) {
            console.error('Create review error:', error);
            throw error;
        }
    }

    // Cập nhật review
    static async update(id, reviewData, userId = null) {
        try {
            const { rating, comment } = reviewData;
            
            let query = `
                UPDATE reviews 
                SET rating = $1, comment = $2
                WHERE id = $3
            `;
            let params = [rating, comment, id];
            
            // Nếu có userId (seller/user), chỉ cho phép cập nhật review của chính họ
            if (userId) {
                query += ` AND user_id = $4`;
                params.push(userId);
            }
            
            query += ` RETURNING *`;
            
            const result = await pool.query(query, params);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Update review error:', error);
            throw error;
        }
    }

    // Xóa review
    static async delete(id, userId = null) {
        try {
            let query = `DELETE FROM reviews WHERE id = $1`;
            let params = [id];
            
            // Nếu có userId, chỉ cho phép xóa review của chính họ
            if (userId) {
                query += ` AND user_id = $2`;
                params.push(userId);
            }
            
            const result = await pool.query(query, params);
            return result.rowCount > 0;
        } catch (error) {
            console.error('Delete review error:', error);
            throw error;
        }
    }

    // Kiểm tra user đã review sản phẩm chưa
    static async hasUserReviewedProduct(user_id, product_id) {
        try {
            const query = `
                SELECT id FROM reviews 
                WHERE user_id = $1 AND product_id = $2
            `;
            
            const result = await pool.query(query, [user_id, product_id]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Check user reviewed product error:', error);
            throw error;
        }
    }

    // Lấy thống kê rating của sản phẩm
    static async getProductRatingStats(product_id) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_reviews,
                    AVG(rating::numeric) as average_rating,
                    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
                FROM reviews 
                WHERE product_id = $1
            `;
            
            const result = await pool.query(query, [product_id]);
            const stats = result.rows[0];
            
            return {
                total_reviews: parseInt(stats.total_reviews),
                average_rating: parseFloat(stats.average_rating) || 0,
                rating_distribution: {
                    5: parseInt(stats.five_star),
                    4: parseInt(stats.four_star), 
                    3: parseInt(stats.three_star),
                    2: parseInt(stats.two_star),
                    1: parseInt(stats.one_star)
                }
            };
        } catch (error) {
            console.error('Get product rating stats error:', error);
            throw error;
        }
    }

    // Lấy top sản phẩm có rating cao nhất
    static async getTopRatedProducts(limit = 10) {
        try {
            const query = `
                SELECT 
                    p.id, p.name, p.image_url, p.price, p.discount_price,
                    AVG(r.rating::numeric) as average_rating,
                    COUNT(r.id) as total_reviews
                FROM products p
                INNER JOIN reviews r ON p.id = r.product_id
                WHERE p.status = 'available'
                GROUP BY p.id, p.name, p.image_url, p.price, p.discount_price
                HAVING COUNT(r.id) >= 5
                ORDER BY average_rating DESC, total_reviews DESC
                LIMIT $1
            `;
            
            const result = await pool.query(query, [limit]);
            return result.rows.map(row => ({
                ...row,
                average_rating: parseFloat(row.average_rating),
                total_reviews: parseInt(row.total_reviews)
            }));
        } catch (error) {
            console.error('Get top rated products error:', error);
            throw error;
        }
    }
}

module.exports = Review;
