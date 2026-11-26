# Tiến độ Dz-Drawing Academy

## Đã triển khai

- **Học viện lõi** có studio cá nhân, điều hướng desktop và mobile, 33 bài học tiếng Việt với sơ đồ, bài tập, tiêu chí tự đánh giá và liên kết tới bàn vẽ. Hoàn thành bài thực hành cần tác phẩm đã lưu.
- **Bàn vẽ** có chuột, Pointer Events, độ nhạy lực bút, bút chì, bút mực, cọ, tẩy, zoom, pan, lưới, đối xứng, bốn lớp, undo/redo, tự lưu và PNG không kèm ảnh mẫu. Timer tính thời gian đang chạy và có thể đổi ảnh mẫu khi hết giờ.
- **Kho tham chiếu và Portfolio** có quản lý ảnh Blob, tìm kiếm, bộ sưu tập theo tên, moodboard từ kết quả lọc, yêu thích, crop preview theo tỷ lệ, điều chỉnh ảnh khi xem, metadata tác phẩm, rubric, sổ lỗi và hai chế độ so sánh.
- **Xưởng chuyên đề** có lưới phối cảnh 1–3 điểm tụ, bảng màu theo quy tắc, mô phỏng chiếu sáng đơn giản, phân tích sắc độ, đề thiết kế nhân vật, mẫu Character Sheet tải được, dáng mẫu gesture và xem sprite theo vùng cắt với JSON metadata.
- **Tiến độ** có EXP chống ghi trùng, Level, Rank nội bộ, gợi ý nhiệm vụ hằng ngày, cây kỹ năng theo nhóm, SRS flashcard, lịch ôn bài và kế hoạch luyện tập tùy chỉnh. Dự án có checklist, deadline, ghi chú, phiên bản liên kết Portfolio. Thống kê đọc từ dữ liệu học tập.
- **Dữ liệu** có IndexedDB, nhập JSON hoặc ZIP chứa giáo trình, Markdown nguồn hiển thị dạng văn bản và ảnh raster nhúng. Khôi phục tiến độ và Blob bằng JSON/ZIP có kiểm tra định dạng và xác nhận. Có manifest và Service Worker, đường dẫn tương đối và hướng dẫn GitHub Pages.

## Phần triển khai ở mức cơ bản

- Cây kỹ năng dùng các bài hiện có làm node, có phân nhóm và zoom. Chưa có trình sửa cây, bộ đánh giá đầu vào hoặc đồ thị điều kiện mở khóa độc lập.
- Moodboard sắp theo kết quả lọc, chưa có bố cục kéo thả. Phiên bản trong dự án dùng các mục Portfolio. So sánh 7/30/90 ngày được thực hiện bằng cách tự chọn tác phẩm.
- Một số chế độ bàn vẽ có hướng dẫn và thiết lập phù hợp như trace và gesture. Chưa có quy trình riêng hoàn chỉnh cho từng chế độ, kết nối challenge/dự án với bản vẽ, hoặc thống kê số sketch gesture. Nét vẽ tự lưu khi kết thúc nét hoặc khi chuyển trang trong ứng dụng.
- Lịch luyện tập tính tỷ lệ thời gian, còn nhật ký tự đánh giá, sổ lỗi và lịch ôn nằm ở các mục riêng. Lịch ôn thực hành hiện theo mốc cố định.
- Thống kê có số liệu tổng, theo kỹ năng, heatmap, radar, tiến độ thành thạo và danh sách điểm. Biểu đồ cột hiển thị tối đa 30 ngày trong mỗi kỳ. Chưa có lịch sử rubric kèm biểu đồ.
- Các nhánh hiện có bài cơ bản và ứng dụng. Ngân hàng dáng nâng cao, giải phẫu cơ/xương chuyên sâu, worldbuilding và giáo trình Game Art mở rộng chưa được biên soạn đầy đủ. Mẫu giáo trình dùng sơ đồ véc-tơ do dự án tạo.
- Hiện có một số thành tựu dựa trên dữ liệu thực. Các vật phẩm trang trí mở khóa, phần thưởng EXP Skill Challenge và bộ thành tựu đầy đủ chưa có.
- PWA đã qua kiểm thử offline trên Chrome và Edge. Edge được kiểm tra dưới thư mục con mô phỏng URL GitHub Pages. Chưa xuất bản GitHub Pages hoặc kiểm thử cài đặt và lực bút trên thiết bị thật.

## Kiểm thử đã chạy

- `npm test` qua 3 bài kiểm thử về schema, EXP và ZIP. Kiểm tra cú pháp JavaScript đã qua.
- Chrome và Edge đã qua các luồng vẽ chuột và giả lập cảm ứng, undo/redo, reload bản nháp, tạm dừng timer, lưu tác phẩm, hoàn thành bài, cập nhật cây kỹ năng, EXP không trùng, nhập JSON và ZIP chứa Markdown/ảnh, khôi phục ZIP, đổi giao diện và mở offline. Bài kiểm thử xác nhận không có lỗi console mức error trong các luồng desktop được chạy.

## Mở rộng sau

Tách chi tiết lưu trữ và migration khi có phiên bản schema tiếp theo. Tích hợp gia sư AI hoặc đồng bộ đa thiết bị thuộc Phase 4.
