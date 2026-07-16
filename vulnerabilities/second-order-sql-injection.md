# Second-Order SQL Injection

## Tóm tắt
Second-Order SQL Injection xảy ra khi dữ liệu độc hại được lưu vào cơ sở dữ liệu ở một bước trước, sau đó được dùng lại trong truy vấn SQL ở bước khác mà không được tham số hóa hoặc kiểm soát.

## Tác động
- Bypass các kiểm tra ở điểm nhập ban đầu vì lỗi chỉ xuất hiện ở luồng xử lý sau.
- Ảnh hưởng đến tác vụ nền, báo cáo, quản trị hoặc đồng bộ dữ liệu.
- Có thể dẫn đến rò rỉ hoặc sửa đổi dữ liệu tùy vị trí dữ liệu được tái sử dụng.

## Nguyên nhân phổ biến
- Tin tưởng dữ liệu đã lưu trong database là an toàn.
- Tạo truy vấn động từ trường cấu hình, tên người dùng, bộ lọc hoặc metadata.
- Không áp dụng cùng tiêu chuẩn bảo vệ cho tác vụ nội bộ và tác vụ nền.

## Biện pháp phòng tránh
- Tham số hóa truy vấn ở mọi nơi, kể cả khi dữ liệu đến từ database nội bộ.
- Xác thực và chuẩn hóa dữ liệu trước khi lưu và trước khi tái sử dụng.
- Rà soát các chức năng tạo báo cáo, tìm kiếm nâng cao và tác vụ batch.
- Tách quyền giữa tài khoản ứng dụng, tài khoản quản trị và tài khoản tác vụ nền.

## Ví dụ code minh họa

Ở bước đầu, ứng dụng lưu `displayName` vào database. Lỗi xuất hiện ở bước sau khi dữ liệu đã lưu được dùng lại để tạo truy vấn động.

```js
async function saveProfile(userId, displayName) {
  await db.query(
    'UPDATE users SET display_name = ? WHERE id = ?',
    [displayName, userId]
  );
}

async function buildAuditReport(userId) {
  const user = await db.query('SELECT display_name FROM users WHERE id = ?', [userId]);
  const displayName = user[0].display_name;

  // Không an toàn: dữ liệu lấy từ database vẫn có thể là dữ liệu không đáng tin cậy.
  return db.query("SELECT * FROM audit_logs WHERE actor = '" + displayName + "'");
}
```

Cần tiếp tục tham số hóa cả khi dữ liệu đến từ database nội bộ.

```js
async function buildAuditReport(userId) {
  const user = await db.query('SELECT display_name FROM users WHERE id = ?', [userId]);
  return db.query(
    'SELECT * FROM audit_logs WHERE actor = ?',
    [user[0].display_name]
  );
}
```
