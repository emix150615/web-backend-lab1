const mysql = require("mysql2/promise");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Naiu150615@",
  database: "store_transaction_db",
};

async function processOrder(customerId, productId, quantity) {
  const pool = mysql.createPool(dbConfig);
  const conn = await pool.getConnection();

  console.log(`\n==================================================`);
  console.log(
    `[BẮT ĐẦU TRANSACTION] Mua SP ID=${productId}, SL=${quantity} cho Khách ID=${customerId}`,
  );
  console.log(`==================================================`);

  try {
    await conn.beginTransaction();

    console.log("-> Step 1: Kiểm tra Số dư khách hàng & Tồn kho...");

    const [customers] = await conn.query(
      "SELECT * FROM customers WHERE id = ? FOR UPDATE",
      [customerId],
    );
    if (customers.length === 0) throw new Error("Khách hàng không tồn tại!");
    const customer = customers[0];

    const [products] = await conn.query(
      "SELECT * FROM products WHERE id = ? FOR UPDATE",
      [productId],
    );
    if (products.length === 0) throw new Error("Sản phẩm không tồn tại!");
    const product = products[0];

    const totalAmount = product.price * quantity;

    console.log(
      `   - Khách: ${customer.full_name} | Số dư: ${customer.balance} VNĐ`,
    );
    console.log(
      `   - SP: ${product.product_name} | Giá: ${product.price} VNĐ | Tồn kho: ${product.stock}`,
    );
    console.log(`   - Tổng đơn: ${totalAmount} VNĐ`);

    if (Number(customer.balance) < totalAmount) {
      throw new Error(
        `[LỖI SỐ DƯ] Số dư (${customer.balance}) không đủ thanh toán đơn (${totalAmount})!`,
      );
    }

    if (product.stock < quantity) {
      throw new Error(
        `[LỖI TỒN KHO] Tồn kho (${product.stock}) không đủ bán (${quantity})!`,
      );
    }

    console.log("-> Step 2: Trừ tiền khách hàng...");
    await conn.query(
      "UPDATE customers SET balance = balance - ? WHERE id = ?",
      [totalAmount, customerId],
    );

    console.log("-> Step 3: Giảm tồn kho...");
    await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
      quantity,
      productId,
    ]);

    console.log("-> Step 4: Tạo đơn hàng (orders)...");
    const [orderResult] = await conn.query(
      "INSERT INTO orders (customer_id, total_amount, created_at) VALUES (?, ?, NOW())",
      [customerId, totalAmount],
    );
    const orderId = orderResult.insertId;

    console.log("-> Step 5: Thêm chi tiết đơn hàng (order_items)...");
    await conn.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
      [orderId, productId, quantity, product.price],
    );

    await conn.commit();
    console.log(
      ">>> SUCCESS: Transaction COMMIT thành công! Mã đơn #" + orderId,
    );
  } catch (error) {
    await conn.rollback();
    console.error(">>> FAILED: Transaction ROLLBACK!");
    console.error("    Nguyên nhân:", error.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

async function runTests() {
  await processOrder(1, 1, 1);
  await processOrder(1, 2, 10);
  await processOrder(2, 1, 1);
}

runTests();
