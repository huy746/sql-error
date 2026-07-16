# Truy vấn SQL quá phức tạp gây quá tải

## Tóm tắt
Một hệ thống có thể bị quá tải khi cho phép người dùng tạo bộ lọc, sắp xếp, tìm kiếm hoặc báo cáo dẫn đến truy vấn SQL quá phức tạp. Dù không phải lúc nào cũng là xâm nhập dữ liệu, đây là rủi ro gây từ chối dịch vụ ở tầng cơ sở dữ liệu.

## Tác động
- CPU, RAM hoặc I/O của database tăng cao.
- Hàng đợi kết nối bị đầy, làm chậm toàn bộ ứng dụng.
- Khóa bảng hoặc khóa dòng kéo dài, ảnh hưởng tác vụ hợp lệ.
- Chi phí hạ tầng tăng do truy vấn không tối ưu.

## Nguyên nhân phổ biến
- Cho phép lọc tùy ý trên nhiều cột không có index phù hợp.
- Tìm kiếm dùng wildcard rộng trên tập dữ liệu lớn.
- JOIN nhiều bảng lớn không giới hạn phạm vi.
- Không có phân trang, giới hạn số dòng hoặc timeout truy vấn.

## Biện pháp phòng tránh
- Đặt giới hạn bắt buộc cho phân trang, kích thước kết quả và độ phức tạp bộ lọc.
- Tạo index dựa trên mẫu truy vấn thực tế và kiểm tra kế hoạch thực thi.
- Dùng cache, materialized view hoặc hàng đợi cho báo cáo nặng.
- Thiết lập statement timeout, connection pool hợp lý và rate limit theo người dùng.
- Theo dõi slow query log và cảnh báo khi tài nguyên tăng bất thường.

## Ví dụ code minh họa

Ví dụ **không an toàn** sau cho phép client gửi danh sách cột cần tìm kiếm tùy ý. Khi số cột lớn hoặc cột không có index, truy vấn có thể trở nên rất nặng.

```js
app.get('/search', async (req, res) => {
  const columns = req.query.columns.split(',');
  const keyword = `%${req.query.q}%`;
  const where = columns.map((column) => `${column} LIKE ?`).join(' OR ');
  const rows = await db.query(`SELECT * FROM products WHERE ${where}`, columns.map(() => keyword));
  res.json(rows);
});
```

Cách an toàn hơn là dùng allowlist cột được phép tìm kiếm, giới hạn số điều kiện và giới hạn kết quả.

```js
const SEARCHABLE_COLUMNS = new Set(['name', 'sku']);

app.get('/search', async (req, res) => {
  const requestedColumns = req.query.columns.split(',').slice(0, 2);
  const columns = requestedColumns.filter((column) => SEARCHABLE_COLUMNS.has(column));
  const keyword = `%${req.query.q.slice(0, 100)}%`;
  const where = columns.map((column) => `${column} LIKE ?`).join(' OR ');

  const rows = await db.query(
    `SELECT id, name, sku FROM products WHERE ${where} LIMIT 50`,
    columns.map(() => keyword)
  );
  res.json(rows);
});
```
