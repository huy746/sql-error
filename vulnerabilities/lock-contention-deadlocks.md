# Lock Contention và Deadlock trong SQL

## Tóm tắt
Lock contention xảy ra khi nhiều giao dịch tranh chấp cùng tài nguyên dữ liệu. Deadlock xảy ra khi các giao dịch chờ lẫn nhau và không thể tiếp tục nếu hệ quản trị cơ sở dữ liệu không hủy một giao dịch. Cả hai đều có thể làm giảm hiệu năng hoặc gây gián đoạn dịch vụ.

## Tác động
- Tăng thời gian phản hồi của truy vấn và giao dịch.
- Giao dịch hợp lệ bị rollback do deadlock.
- Hàng đợi kết nối tăng, làm ứng dụng chậm hoặc lỗi timeout.
- Người dùng gặp lỗi không ổn định khi tải cao.

## Nguyên nhân phổ biến
- Giao dịch giữ khóa quá lâu do xử lý nhiều logic trong transaction.
- Cập nhật bảng theo thứ tự không nhất quán giữa các luồng nghiệp vụ.
- Thiếu index khiến lệnh cập nhật phải quét và khóa phạm vi lớn.
- Mức cô lập giao dịch quá cao so với nhu cầu thực tế.

## Biện pháp phòng tránh
- Giữ transaction ngắn và tránh gọi dịch vụ bên ngoài trong transaction.
- Cập nhật tài nguyên theo thứ tự nhất quán trong toàn hệ thống.
- Bổ sung index cho điều kiện WHERE trong UPDATE và DELETE.
- Thiết kế cơ chế retry an toàn cho lỗi deadlock có thể khôi phục.
- Theo dõi lock wait, deadlock report và truy vấn giữ khóa lâu.

## Ví dụ code minh họa

Ví dụ **không an toàn** sau giữ transaction trong lúc thực hiện logic chậm. Khóa dữ liệu có thể bị giữ lâu hơn cần thiết và làm các giao dịch khác phải chờ.

```js
async function updateInventory(orderId) {
  await db.beginTransaction();
  const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);

  for (const item of items) {
    await db.query(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [item.quantity, item.product_id]
    );
    await callExternalWarehouseApi(item.product_id); // Không nên gọi dịch vụ ngoài trong transaction.
  }

  await db.commit();
}
```

Cách tốt hơn là chuẩn bị dữ liệu trước, cập nhật theo thứ tự nhất quán và giữ transaction ngắn.

```js
async function updateInventory(orderId) {
  const items = await db.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id = ? ORDER BY product_id',
    [orderId]
  );

  await db.beginTransaction();
  for (const item of items) {
    await db.query(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [item.quantity, item.product_id]
    );
  }
  await db.commit();

  await notifyWarehouseAfterCommit(items);
}
```
