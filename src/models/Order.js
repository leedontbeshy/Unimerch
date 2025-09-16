const { pool } = require('../../config/database');

class Order {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.total_amount = data.total_amount;
    this.shipping_address = data.shipping_address;
    this.payment_method = data.payment_method;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Tạo đơn hàng mới
  static async create(orderData) {
    try {
      const query = `
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        orderData.user_id,
        orderData.total_amount,
        orderData.shipping_address,
        orderData.payment_method,
        orderData.status || 'pending'
      ];

      const result = await pool.query(query, values);
      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng theo ID
  static async findById(id) {
    try {
      const query = `
        SELECT o.*, u.username, u.email, u.full_name 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả đơn hàng của user
  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT * FROM orders 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new Order(row));
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả đơn hàng (admin)
  static async findAll(limit = 50, offset = 0, status = null) {
    try {
      let query = `
        SELECT o.*, u.username, u.email, u.full_name 
        FROM orders o
        JOIN users u ON o.user_id = u.id
      `;
      
      const values = [];
      let paramIndex = 1;

      if (status) {
        query += ` WHERE o.status = $${paramIndex}`;
        values.push(status);
        paramIndex++;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      return result.rows.map(row => new Order(row));
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng của seller
  static async findBySellerId(sellerId, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT DISTINCT o.*, u.username, u.email, u.full_name 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = $1
        ORDER BY o.created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [sellerId, limit, offset]);
      return result.rows.map(row => new Order(row));
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái đơn hàng
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE orders 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật phương thức thanh toán đơn hàng
  static async updatePaymentMethod(id, paymentMethod) {
    try {
      const query = `
        UPDATE orders 
        SET payment_method = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(query, [paymentMethod, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật đơn hàng
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

      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      const query = `
        UPDATE orders 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      values.push(id);

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Xóa đơn hàng (chỉ khi status = 'pending')
  static async delete(id) {
    try {
      const query = `
        DELETE FROM orders 
        WHERE id = $1 AND status = 'pending' 
        RETURNING *
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Đếm tổng số đơn hàng
  static async count(userId = null, status = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM orders';
      const values = [];
      const conditions = [];

      if (userId) {
        conditions.push(`user_id = $${values.length + 1}`);
        values.push(userId);
      }

      if (status) {
        conditions.push(`status = $${values.length + 1}`);
        values.push(status);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

// Lấy thống kê đơn hàng
static async getStats(sellerId = null, userId = null) {
  try {
      let query = `
          SELECT 
              status,
              COUNT(*) as count,
              SUM(total_amount) as total_amount
          FROM orders
      `;

      const values = [];
      let paramIndex = 1;

      if (sellerId) {
          query += `
              JOIN order_items oi ON orders.id = oi.order_id
              JOIN products p ON oi.product_id = p.id
              WHERE p.seller_id = $${paramIndex}
          `;
          values.push(sellerId);
      } else if (userId) {
          query += ` WHERE user_id = $${paramIndex}`;
          values.push(userId);
      }

      query += ' GROUP BY status ORDER BY status';

      const result = await pool.query(query, values);
      return result.rows;
  } catch (error) {
      throw error;
  }
}
}
module.exports = Order;
