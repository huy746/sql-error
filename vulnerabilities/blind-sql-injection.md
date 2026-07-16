# Blind SQL Injection

## Tóm tắt
Blind SQL Injection là biến thể của SQL Injection trong đó ứng dụng không trả trực tiếp dữ liệu hoặc lỗi SQL, nhưng phản hồi vẫn để lộ tín hiệu gián tiếp như đúng/sai, thời gian phản hồi hoặc khác biệt nội dung trang.

## Tác động
- Trích xuất dữ liệu từng phần thông qua quan sát phản hồi.
- Gây chậm hệ thống bằng các truy vấn có điều kiện tốn thời gian.
- Khó phát hiện hơn SQL Injection thông thường vì không nhất thiết sinh lỗi rõ ràng.

## Nguyên nhân phổ biến
- Vẫn tồn tại truy vấn động không tham số hóa.
- Cơ chế xử lý lỗi bị ẩn nhưng logic phản hồi vẫn phụ thuộc vào kết quả SQL.
- Thiếu giới hạn thời gian thực thi truy vấn và giám sát bất thường.

## Biện pháp phòng tránh
- Dùng parameterized query cho mọi dữ liệu đầu vào.
- Chuẩn hóa phản hồi lỗi để không tiết lộ trạng thái truy vấn.
- Đặt timeout cho truy vấn và giới hạn tài nguyên mỗi phiên/kết nối.
- Theo dõi các mẫu truy vấn lặp lại, phản hồi chậm bất thường hoặc tỷ lệ lỗi cao.

## Ví dụ code minh họa

Ví dụ **không an toàn** sau không trả lỗi SQL trực tiếp, nhưng phản hồi `exists` vẫn phụ thuộc vào truy vấn được ghép chuỗi từ input. Khác biệt đúng/sai trong phản hồi có thể trở thành tín hiệu gián tiếp.

```js
app.get('/check-user', async (req, res) => {
  const username = req.query.username;
  const sql = "SELECT id FROM users WHERE username = '" + username + "'";
  const rows = await db.query(sql);
  res.json({ exists: rows.length > 0 });
});
```

Phiên bản an toàn dùng tham số hóa và phản hồi được chuẩn hóa theo nhu cầu nghiệp vụ.

```js
app.get('/check-user', async (req, res) => {
  const username = req.query.username;
  const rows = await db.query(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );
  res.json({ exists: rows.length > 0 });
});
```
