# Thiếu Rate Limit cho thao tác SQL nặng

## Tóm tắt
Khi các endpoint kích hoạt truy vấn SQL nặng không có rate limit, một người dùng hoặc bot có thể gửi nhiều yêu cầu liên tiếp làm quá tải database. Đây là rủi ro vận hành thường gặp ở tìm kiếm, báo cáo, thống kê và export dữ liệu.

## Tác động
- Tài nguyên database bị chiếm dụng bởi một nhóm nhỏ yêu cầu.
- Người dùng hợp lệ bị chậm hoặc không thể truy cập dịch vụ.
- Tăng nguy cơ timeout, lỗi kết nối và tự động mở rộng tốn kém.
- Khó phân biệt giữa tăng trưởng thật và lạm dụng nếu thiếu quan sát.

## Nguyên nhân phổ biến
- Không giới hạn số lần gọi endpoint theo tài khoản, IP hoặc token.
- Không phân loại độ nặng của truy vấn để áp dụng quota khác nhau.
- Cho phép chạy báo cáo đồng bộ nhiều lần trong thời gian ngắn.
- Thiếu circuit breaker khi database đã quá tải.

## Biện pháp phòng tránh
- Áp dụng rate limit và quota riêng cho endpoint tốn tài nguyên.
- Dùng hàng đợi, cache hoặc lịch chạy cho báo cáo lớn.
- Từ chối hoặc trì hoãn yêu cầu khi database vượt ngưỡng tải an toàn.
- Ghi log người dùng, tham số truy vấn và thời gian thực thi để điều tra lạm dụng.

## Ví dụ code minh họa

Ví dụ **không an toàn** sau cho phép gọi báo cáo nặng liên tục. Mỗi request đều chạy truy vấn tổng hợp lớn trực tiếp trên database.

```js
app.get('/reports/revenue', async (req, res) => {
  const rows = await db.query(`
    SELECT customer_id, SUM(total) AS revenue
    FROM orders
    WHERE created_at >= ? AND created_at < ?
    GROUP BY customer_id
    ORDER BY revenue DESC
  `, [req.query.from, req.query.to]);

  res.json(rows);
});
```

Cách an toàn hơn là áp dụng rate limit, giới hạn khoảng thời gian và chuyển báo cáo nặng sang hàng đợi hoặc cache.

```js
app.get('/reports/revenue', reportRateLimit, async (req, res) => {
  const range = normalizeDateRange(req.query.from, req.query.to, { maxDays: 31 });
  const cached = await reportCache.get(range.cacheKey);
  if (cached) return res.json(cached);

  const job = await reportQueue.enqueue('revenue-report', range);
  res.status(202).json({ jobId: job.id, status: 'queued' });
});
```
