const { pool } = require('../../config/database');

class Category {
    static async getAll() {
        try {
            const result = await pool.query(
                'SELECT id, name, description, image_url FROM categories ORDER BY name ASC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
    static async findById(id) {
        try {
            const result = await pool.query(
                'SELECT id, name, description, image_url FROM categories WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async create(categoryData) {
        try {
            const { name, description, imageUrl } = categoryData;
            const result = await pool.query(
                'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING id, name, description, image_url',
                [name, description || null, imageUrl || null]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, categoryData) {
        try {
            const { name, description, imageUrl } = categoryData;
            const result = await pool.query(
                'UPDATE categories SET name = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING id, name, description, image_url',
                [name, description || null, imageUrl || null, id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
            const productCheck = await pool.query(
                'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
                [id]
            );

            if (parseInt(productCheck.rows[0].count) > 0) {
                throw new Error('Không thể xóa danh mục đã có sản phẩm');
            }

            const result = await pool.query(
                'DELETE FROM categories WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    static async findByName(name) {
        try {
            const result = await pool.query(
                'SELECT id, name, description, image_url FROM categories WHERE LOWER(name) = LOWER($1)',
                [name]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
}


module.exports = Category;
