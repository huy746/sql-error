# SQL Injection

## Tóm tắt
SQL Injection xảy ra khi ứng dụng ghép trực tiếp dữ liệu người dùng vào câu lệnh SQL mà không kiểm soát đúng cách. Kẻ tấn công có thể làm thay đổi ý nghĩa truy vấn, đọc dữ liệu trái phép, sửa dữ liệu hoặc bỏ qua cơ chế xác thực.

## Tác động
- Rò rỉ dữ liệu nhạy cảm như tài khoản, email, token hoặc thông tin thanh toán.
- Thay đổi, xóa hoặc chèn dữ liệu trái phép.
- Vượt qua đăng nhập nếu truy vấn xác thực bị thao túng.
- Làm gián đoạn dịch vụ khi truy vấn bị biến thành tác vụ tốn tài nguyên.

## Nguyên nhân phổ biến
- Nối chuỗi SQL bằng input từ người dùng.
- Không dùng prepared statement hoặc parameterized query.
- Tài khoản kết nối cơ sở dữ liệu có quyền quá rộng.
- Thông báo lỗi SQL trả về quá chi tiết cho người dùng cuối.

## Biện pháp phòng tránh
- Luôn dùng prepared statement, parameterized query hoặc ORM an toàn.
- Kiểm tra kiểu dữ liệu, độ dài và định dạng input ở tầng ứng dụng.
- Áp dụng nguyên tắc đặc quyền tối thiểu cho tài khoản cơ sở dữ liệu.
- Ẩn chi tiết lỗi SQL khỏi phản hồi công khai; ghi log nội bộ có kiểm soát.
- Bổ sung kiểm thử bảo mật cho các endpoint nhận input động.

## Ví dụ code minh họa

Ví dụ dưới đây **không an toàn** vì giá trị `email` được ghép trực tiếp vào chuỗi SQL. Nếu input chứa ký tự điều khiển SQL, cấu trúc truy vấn có thể bị thay đổi ngoài ý muốn.

```js
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const sql = "SELECT id, email, role FROM users WHERE email = '" + email + "'";
  const rows = await db.query(sql);
  res.json(rows);
});
```

Cách viết an toàn hơn là dùng tham số hóa để database driver xử lý input như dữ liệu, không phải một phần của câu lệnh SQL.

```js
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const rows = await db.query(
    'SELECT id, email, role FROM users WHERE email = ?',
    [email]
  );
  res.json(rows);
});
```
