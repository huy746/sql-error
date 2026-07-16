# Truy vấn không giới hạn kết quả

## Tóm tắt
Truy vấn không giới hạn kết quả xảy ra khi API hoặc chức năng xuất dữ liệu cho phép trả về quá nhiều dòng cùng lúc. Điều này có thể làm cạn bộ nhớ ứng dụng, bão hòa mạng hoặc gây áp lực lớn lên cơ sở dữ liệu.

## Tác động
- Tăng độ trễ hoặc timeout cho người dùng hợp lệ.
- Cạn RAM ở ứng dụng khi cố nạp toàn bộ kết quả vào bộ nhớ.
- Làm nghẽn băng thông giữa ứng dụng và database.
- Dễ bị lạm dụng để tạo tải cao lặp lại.

## Nguyên nhân phổ biến
- Thiếu LIMIT, OFFSET hoặc cursor-based pagination.
- Endpoint export dữ liệu không có giới hạn hoặc không chạy bất đồng bộ.
- Không giới hạn tần suất gọi API theo người dùng hoặc IP.
- Không có ngưỡng tối đa cho khoảng thời gian lọc dữ liệu.

## Biện pháp phòng tránh
- Bắt buộc phân trang và đặt kích thước trang tối đa.
- Dùng streaming hoặc tác vụ nền cho export lớn thay vì trả đồng bộ.
- Giới hạn khoảng thời gian truy vấn và số bản ghi tối đa.
- Áp dụng rate limit, quota và giám sát tải theo endpoint.

## Ví dụ code minh họa

Ví dụ **không an toàn** sau trả toàn bộ dữ liệu khớp điều kiện. Nếu bảng lớn, ứng dụng có thể tiêu tốn nhiều RAM và database phải đọc quá nhiều dòng.

```js
app.get('/orders', async (req, res) => {
  const rows = await db.query(
    'SELECT * FROM orders WHERE customer_id = ?',
    [req.query.customerId]
  );
  res.json(rows);
});
```

Phiên bản an toàn đặt giới hạn trang tối đa và chỉ chọn các cột cần thiết.

```js
app.get('/orders', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const rows = await db.query(
    'SELECT id, status, total, created_at FROM orders WHERE customer_id = ? ORDER BY id LIMIT ? OFFSET ?',
    [req.query.customerId, limit, offset]
  );
  res.json(rows);
});
```
