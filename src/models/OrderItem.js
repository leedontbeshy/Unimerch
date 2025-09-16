const { pool } = require('../../config/database');

class OrderItem {
  constructor(data = {}) {
    this.id = data.id;
    this.order_id = data.order_id;
    this.product_id = data.product_id;
    this.quantity = data.quantity;
    this.price = data.price;
    
    // Thông tin từ join với products
    this.product_name = data.product_name;
    this.product_image = data.product_image;
  }

  // Tạo order item mới
  static async create(itemData) {
    try {
      const query = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const values = [
        itemData.order_id,
        itemData.product_id,
        itemData.quantity,
        itemData.price
      ];

      const result = await pool.query(query, values);
      return new OrderItem(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Tạo nhiều order items cùng lúc
  static async createMany(items) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const createdItems = [];
      
      for (const item of items) {
        const query = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        const values = [
          item.order_id,
          item.product_id,
          item.quantity,
          item.price
        ];

        const result = await client.query(query, values);
        createdItems.push(new OrderItem(result.rows[0]));
      }
      
      await client.query('COMMIT');
      return createdItems;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Lấy tất cả items của một order
  static async findByOrderId(orderId) {
    try {
      const query = `
        SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image,
          p.status as product_status
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `;
      
      const result = await pool.query(query, [orderId]);
      return result.rows.map(row => new OrderItem(row));
    } catch (error) {
      throw error;
    }
  }

  // Lấy order item theo ID
  static async findById(id) {
    try {
      const query = `
        SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image,
          p.status as product_status
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new OrderItem(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật order item
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updateData[key]);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE order_items 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      values.push(id);

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new OrderItem(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Xóa order item
  static async delete(id) {
    try {
      const query = 'DELETE FROM order_items WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa tất cả items của một order
  static async deleteByOrderId(orderId) {
    try {
      const query = 'DELETE FROM order_items WHERE order_id = $1 RETURNING *';
      const result = await pool.query(query, [orderId]);
      return result.rows.length;
    } catch (error) {
      throw error;
    }
  }

  // Tính tổng tiền của một order
  static async calculateOrderTotal(orderId) {
    try {
      const query = `
        SELECT SUM(quantity * price) as total
        FROM order_items
        WHERE order_id = $1
      `;
      
      const result = await pool.query(query, [orderId]);
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê sản phẩm bán chạy
  static async getTopSellingProducts(limit = 10, sellerId = null) {
    try {
      let query = `
        SELECT 
          p.id,
          p.name,
          p.image_url,
          SUM(oi.quantity) as total_sold,
          SUM(oi.quantity * oi.price) as total_revenue,
          AVG(oi.price) as avg_price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('delivered', 'shipped')
      `;

      const values = [];

      if (sellerId) {
        query += ' AND p.seller_id = $1';
        values.push(sellerId);
      }

      query += `
        GROUP BY p.id, p.name, p.image_url
        ORDER BY total_sold DESC
        LIMIT $${values.length + 1}
      `;
      
      values.push(limit);

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem user đã mua sản phẩm này chưa
  static async hasUserPurchased(userId, productId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = $1 
        AND oi.product_id = $2 
        AND o.status IN ('delivered', 'shipped')
      `;
      
      const result = await pool.query(query, [userId, productId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderItem;
