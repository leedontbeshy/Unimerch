// src/controllers/orderController.js

// Lấy tất cả đơn hàng của user hoặc admin
const getOrders = (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";

    if (isAdmin) {
      // TODO: query DB lấy tất cả đơn hàng
      return res.json([
        { id: 1, status: "pending" },
        { id: 2, status: "completed" },
      ]);
    }

    // TODO: query DB lấy đơn hàng theo user
    return res.json([
      { id: 3, userId: req.user.id, status: "pending" },
      { id: 4, userId: req.user.id, status: "shipped" },
    ]);
  } catch (error) {
    console.error("getOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy đơn hàng theo ID
const getOrderById = (req, res) => {
  try {
    const { id } = req.params;
    // TODO: query DB
    res.json({ id, userId: req.user.id, status: "pending", items: [] });
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Tạo đơn hàng mới
const createOrder = (req, res) => {
  try {
    const { items, total, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // TODO: lưu DB
    const newOrder = {
      id: Date.now(),
      userId: req.user.id,
      items,
      total,
      address,
      status: "pending",
      createdAt: new Date(),
    };

    res.status(201).json({ message: "Order created", order: newOrder });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // TODO: update DB
    res.json({ message: "Order status updated", order: { id, status } });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hủy đơn hàng
const cancelOrder = (req, res) => {
  try {
    const { id } = req.params;
    // TODO: update DB
    res.json({ message: `Order ${id} cancelled` });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy items trong đơn hàng
const getOrderItems = (req, res) => {
  try {
    const { id } = req.params;
    // TODO: query DB
    res.json({
      orderId: id,
      items: [
        { productId: 1, name: "Product A", quantity: 2 },
        { productId: 2, name: "Product B", quantity: 1 },
      ],
    });
  } catch (error) {
    console.error("getOrderItems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Thanh toán đơn hàng
const processPayment = (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body;

    // TODO: tích hợp cổng thanh toán
    res.json({
      message: "Payment processed",
      orderId: id,
      method,
      status: "paid",
    });
  } catch (error) {
    console.error("processPayment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy đơn hàng của seller
const getSellerOrders = (req, res) => {
  try {
    const { sellerId } = req.params;
    // TODO: query DB
    res.json([
      { id: 10, sellerId, status: "pending" },
      { id: 11, sellerId, status: "shipped" },
    ]);
  } catch (error) {
    console.error("getSellerOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy đơn hàng theo trạng thái
const getOrdersByStatus = (req, res) => {
  try {
    const { status } = req.params;
    // TODO: query DB
    res.json([
      { id: 20, status },
      { id: 21, status },
    ]);
  } catch (error) {
    console.error("getOrdersByStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderItems,
  processPayment,
  getSellerOrders,
  getOrdersByStatus,
};
