const { pool } = require('../../config/database');

class ShoppingCart {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.quantity = data.quantity;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Thông tin từ join với products
    this.product_name = data.product_name;
    this.product_price = data.product_price;
    this.product_discount_price = data.product_discount_price;
    this.product_image = data.product_image;
    this.product_status = data.product_status;
    this.available_quantity = data.available_quantity;
  }

  // Thêm sản phẩm vào giỏ hàng
  static async addToCart(userId, productId, quantity) {
    try {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingQuery = `
        SELECT * FROM shopping_cart 
        WHERE user_id = $1 AND product_id = $2
      `;
      
      const existingResult = await pool.query(existingQuery, [userId, productId]);
      
      if (existingResult.rows.length > 0) {
        // Nếu đã có, cập nhật số lượng
        const updateQuery = `
          UPDATE shopping_cart 
          SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $2 AND product_id = $3 
          RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [quantity, userId, productId]);
        return new ShoppingCart(result.rows[0]);
      } else {
        // Nếu chưa có, thêm mới
        const insertQuery = `
          INSERT INTO shopping_cart (user_id, product_id, quantity)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [userId, productId, quantity]);
        return new ShoppingCart(result.rows[0]);
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy giỏ hàng của user
  static async getCartByUserId(userId) {
    try {
      const query = `
        SELECT 
          sc.*,
          p.name as product_name,
          p.price as product_price,
          p.discount_price as product_discount_price,
          p.image_url as product_image,
          p.status as product_status,
          p.quantity as available_quantity
        FROM shopping_cart sc
        JOIN products p ON sc.product_id = p.id
        WHERE sc.user_id = $1
        ORDER BY sc.created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new ShoppingCart(row));
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  static async updateQuantity(cartId, userId, quantity) {
    try {
      const query = `
        UPDATE shopping_cart 
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND user_id = $3 
        RETURNING *
      `;
      
      const result = await pool.query(query, [quantity, cartId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new ShoppingCart(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeFromCart(cartId, userId) {
    try {
      const query = `
        DELETE FROM shopping_cart 
        WHERE id = $1 AND user_id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(query, [cartId, userId]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa toàn bộ giỏ hàng
  static async clearCart(userId) {
    try {
      const query = `
        DELETE FROM shopping_cart 
        WHERE user_id = $1 
        RETURNING *
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.length;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tổng số lượng items trong giỏ
  static async getCartItemCount(userId) {
    try {
      const query = `
        SELECT SUM(quantity) as total_items
        FROM shopping_cart 
        WHERE user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].total_items) || 0;
    } catch (error) {
      throw error;
    }
  }

  // Tính tổng tiền giỏ hàng
  static async getCartTotal(userId) {
    try {
      const query = `
        SELECT 
          SUM(
            sc.quantity * 
            COALESCE(p.discount_price, p.price)
          ) as total_amount
        FROM shopping_cart sc
        JOIN products p ON sc.product_id = p.id
        WHERE sc.user_id = $1 AND p.status = 'available'
      `;
      
      const result = await pool.query(query, [userId]);
      return parseFloat(result.rows[0].total_amount) || 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra tính khả dụng của sản phẩm trong giỏ
  static async validateCartItems(userId) {
    try {
      const query = `
        SELECT 
          sc.*,
          p.name as product_name,
          p.quantity as available_quantity,
          p.status as product_status,
          CASE 
            WHEN p.status != 'available' THEN 'unavailable'
            WHEN p.quantity < sc.quantity THEN 'insufficient_stock'
            ELSE 'valid'
          END as validation_status
        FROM shopping_cart sc
        JOIN products p ON sc.product_id = p.id
        WHERE sc.user_id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        ...new ShoppingCart(row),
        validation_status: row.validation_status
      }));
    } catch (error) {
      throw error;
    }
  }

  // Lấy cart item theo ID
  static async findById(cartId, userId) {
    try {
      const query = `
        SELECT 
          sc.*,
          p.name as product_name,
          p.price as product_price,
          p.discount_price as product_discount_price,
          p.image_url as product_image,
          p.status as product_status,
          p.quantity as available_quantity
        FROM shopping_cart sc
        JOIN products p ON sc.product_id = p.id
        WHERE sc.id = $1 AND sc.user_id = $2
      `;
      
      const result = await pool.query(query, [cartId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new ShoppingCart(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Chuyển giỏ hàng thành order items
  static async convertToOrderItems(userId) {
    try {
      const query = `
        SELECT 
          sc.product_id,
          sc.quantity,
          COALESCE(p.discount_price, p.price) as price
        FROM shopping_cart sc
        JOIN products p ON sc.product_id = p.id
        WHERE sc.user_id = $1 AND p.status = 'available'
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Xóa các sản phẩm đã được order
  static async removeOrderedItems(userId, productIds) {
    try {
      const query = `
        DELETE FROM shopping_cart 
        WHERE user_id = $1 AND product_id = ANY($2::int[])
        RETURNING *
      `;
      
      const result = await pool.query(query, [userId, productIds]);
      return result.rows.length;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ShoppingCart;
