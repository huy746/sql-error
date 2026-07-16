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
