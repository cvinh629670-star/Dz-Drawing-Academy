# Dz-Drawing Academy

Ứng dụng học vẽ offline-first bằng HTML, CSS và JavaScript. Dữ liệu học tập, ảnh gốc và bản nháp lưu trong IndexedDB của trình duyệt.

## Chạy trên máy

Tại thư mục dự án, chạy `py -m http.server 8000` trên Windows hoặc `python3 -m http.server 8000` trên macOS/Linux. Mở `http://localhost:8000`. Khi Service Worker cài xong, có thể tải lại trang ngoại tuyến. Hãy giữ nguyên tên máy và cổng để sử dụng cùng dữ liệu trình duyệt.

## GitHub Pages

Đưa các tệp trong thư mục này lên repository. Trong **Settings → Pages**, chọn **Deploy from a branch**, chọn nhánh chính và **/(root)**. Mọi URL nội bộ dùng đường dẫn tương đối hoặc hash nên hoạt động dưới thư mục con của repository. Khi cập nhật tài nguyên đã cache, tăng phiên bản trong `sw.js`. Các tab đang sử dụng phiên bản cũ cần được đóng để bản cập nhật kích hoạt.

## Học và thực hành

Mở một bài học, làm bài trên bàn vẽ của bài đó, lưu tác phẩm rồi quay lại chọn tác phẩm và hoàn thành checklist. `P` chọn bút, `E` chọn tẩy, `Ctrl/⌘+Z` hoàn tác và `Ctrl/⌘+Shift+Z` làm lại. Nhấn Escape để thoát chế độ toàn màn hình. Vào Hồ sơ để xuất toàn bộ dữ liệu. Bản sao lưu có ảnh được đóng gói dưới dạng ZIP.

## Nhập chương trình

Dùng `data/lesson-template.json` làm mẫu. Gói có `schemaVersion: 1` và mảng `lessons`. Mỗi bài cần ID duy nhất, trường đầy đủ như mẫu và liên kết bài học tồn tại trong gói hoặc chương trình hiện tại. Có thể dùng ID bài làm ID kỹ năng, tham chiếu kỹ năng hiện có hoặc khai báo ID trong mảng `skills`.

ZIP cần đặt `curriculum.json` ở thư mục gốc. Thêm đường dẫn ảnh PNG, JPEG, WebP hoặc GIF trong `illustrations`, ví dụ `["images/net-thang.png"]`. Bài học có thể dùng `"coreTheoryMarkdown": "notes/net-thang.md"` để lấy nội dung lý thuyết trong cùng ZIP. Ứng dụng hiển thị phần Markdown dưới dạng văn bản thuần. Chọn chế độ cập nhật để thay nội dung của cùng ID và giữ nguyên tiến độ. Sao lưu trước khi khôi phục dữ liệu.

## Kiểm tra

Chạy `npm test` để kiểm tra dữ liệu chương trình, EXP và lưu trữ ZIP. Kiểm thử trình duyệt dùng `node tests/browser.mjs <đường-dẫn-playwright-core/index.mjs> <đường-dẫn-trình-duyệt-Chromium> <URL>`. Playwright chỉ cần cho kiểm thử. Xem `DEVELOPMENT_PROGRESS.md` để biết phạm vi đã có và phần còn thiếu.

## Minh họa studio

`assets/studio.png` được tạo bằng công cụ tạo ảnh tích hợp với prompt sau.

> Wide 3:2 landscape cozy hand-drawn anime art studio environmental background for a Vietnamese artist academy web app. Warm amber sunlight through mullioned windows, wooden drafting desk with open cream sketchbook and pencils in foreground, painting easel at center-right, green plants and books, quiet sage green walls, a richly detailed hand-painted animated film background with warm earthy subdued colors and sophisticated watercolor textures. No text or graphics. Main visual interest on right half.
