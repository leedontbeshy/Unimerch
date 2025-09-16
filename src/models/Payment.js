const { pool } = require('../../config/database');

class Payment {
  constructor(data = {}) {
    this.id = data.id;
    this.order_id = data.order_id;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status || 'pending';
    this.transaction_id = data.transaction_id;
    this.amount = data.amount;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Tạo payment mới
  static async create(paymentData) {
    try {
      const query = `
        INSERT INTO payments (order_id, payment_method, payment_status, transaction_id, amount)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        paymentData.order_id,
        paymentData.payment_method,
        paymentData.payment_status || 'pending',
        paymentData.transaction_id,
        paymentData.amount
      ];

      const result = await pool.query(query, values);
      return new Payment(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Lấy payment theo ID
  static async findById(id) {
    try {
      const query = `
        SELECT p.*, o.user_id, o.total_amount as order_total
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE p.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Payment(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Lấy payment theo order ID
  static async findByOrderId(orderId) {
    try {
      const query = `
        SELECT * FROM payments 
        WHERE order_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [orderId]);
      return result.rows.map(row => new Payment(row));
    } catch (error) {
      throw error;
    }
  }

  // Lấy payment mới nhất của order
  static async findLatestByOrderId(orderId) {
    try {
      const query = `
        SELECT * FROM payments 
        WHERE order_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [orderId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Payment(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái payment
  static async updateStatus(id, status, transactionId = null) {
    try {
      const query = `
        UPDATE payments 
        SET payment_status = $1, 
            transaction_id = COALESCE($2, transaction_id),
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $3 
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, transactionId, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Payment(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật payment
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
        UPDATE payments 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      values.push(id);

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Payment(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả payments của user
  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT p.*, o.user_id, o.total_amount as order_total
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new Payment(row));
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả payments (admin)
  static async findAll(limit = 50, offset = 0, status = null) {
    try {
      let query = `
        SELECT p.*, o.user_id, o.total_amount as order_total, u.username, u.email
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN users u ON o.user_id = u.id
      `;

      const values = [];
      let paramIndex = 1;

      if (status) {
        query += ` WHERE p.payment_status = $${paramIndex}`;
        values.push(status);
        paramIndex++;
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      return result.rows.map(row => new Payment(row));
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem order đã có payment thành công chưa
  static async hasSuccessfulPayment(orderId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM payments 
        WHERE order_id = $1 AND payment_status = 'completed'
      `;
      
      const result = await pool.query(query, [orderId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê payments
  static async getStats(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          payment_status,
          payment_method,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM payments
      `;

      const values = [];
      const conditions = [];

      if (startDate) {
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${values.length + 1}`);
        values.push(endDate);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' GROUP BY payment_status, payment_method ORDER BY payment_status, payment_method';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

// Lấy doanh thu theo thời gian
static async getRevenueByPeriod(period = 'day', limit = 30) {
  try {
    // BƯỚC 1: Validation và mapping an toàn với hardcoded values
    const periodMapping = {
      'hour': { 
        interval: '1 HOUR', 
        format: 'YYYY-MM-DD HH24:00:00',
        maxLimit: 168 // 1 tuần
      },
      'day': { 
        interval: '1 DAY', 
        format: 'YYYY-MM-DD',
        maxLimit: 365 // 1 năm
      },
      'week': { 
        interval: '1 WEEK', 
        format: 'YYYY-"W"WW',
        maxLimit: 52 // 52 tuần
      },
      'month': { 
        interval: '1 MONTH', 
        format: 'YYYY-MM',
        maxLimit: 24 // 2 năm
      },
      'year': { 
        interval: '1 YEAR', 
        format: 'YYYY',
        maxLimit: 10 // 10 năm
      }
    };

    if (!periodMapping[period]) {
      throw new Error(`Invalid period. Must be one of: ${Object.keys(periodMapping).join(', ')}`);
    }

    const { interval, format, maxLimit } = periodMapping[period];

    // BƯỚC 2: Validation cho limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > maxLimit) {
      throw new Error(`Invalid limit. Must be a positive integer between 1 and ${maxLimit}`);
    }

    // BƯỚC 3: Sử dụng JavaScript để tính toán start date
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - (parsedLimit * 60 * 60 * 1000));
        break;
      case 'day':
        startDate = new Date(now.getTime() - (parsedLimit * 24 * 60 * 60 * 1000));
        break;
      case 'week':
        startDate = new Date(now.getTime() - (parsedLimit * 7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        const monthsAgo = new Date(now);
        monthsAgo.setMonth(monthsAgo.getMonth() - parsedLimit);
        startDate = monthsAgo;
        break;
      case 'year':
        const yearsAgo = new Date(now);
        yearsAgo.setFullYear(yearsAgo.getFullYear() - parsedLimit);
        startDate = yearsAgo;
        break;
    }

    // BƯỚC 4: Query an toàn - chỉ startDate được parameterized
    const query = `
      SELECT 
        TO_CHAR(created_at, '${format}') as period,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as successful_count,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as successful_revenue
      FROM payments
      WHERE created_at >= $1
      GROUP BY TO_CHAR(created_at, '${format}')
      ORDER BY period DESC
    `;

    const result = await pool.query(query, [startDate]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

  // Đếm tổng số payments
  static async count(status = null, startDate = null, endDate = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM payments';
      const values = [];
      const conditions = [];

      if (status) {
        conditions.push(`payment_status = $${values.length + 1}`);
        values.push(status);
      }

      if (startDate) {
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${values.length + 1}`);
        values.push(endDate);
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
}

module.exports = Payment;
