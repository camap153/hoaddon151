# Receipt Generator - GitHub Pages Edition

Ứng dụng tạo hóa đơn bán lẻ hoàn toàn chạy trên trình duyệt, không cần backend.

## 🚀 Demo

Xem demo tại: `https://your-username.github.io/billoder/`

## 📋 Tính năng

- ✅ Thêm sản phẩm từng cái
- ✅ Nhập nhanh danh sách sản phẩm (bulk input)
- ✅ Tính tổng tiền và tiền thừa tự động
- ✅ Tạo hóa đơn dạng ảnh PNG
- ✅ Tải ảnh hóa đơn về máy
- ✅ Hoàn toàn miễn phí, không cần server

## 🌐 Cách deploy lên GitHub Pages

### Bước 1: Tạo repository trên GitHub

1. Đăng nhập vào [GitHub](https://github.com)
2. Click "New repository"
3. Đặt tên: `billoder` (hoặc tên khác)
4. Chọn "Public"
5. Click "Create repository"

### Bước 2: Upload code

**Cách 1: Dùng GitHub Web Interface**

1. Trong repository vừa tạo, click "Add file" → "Upload files"
2. Kéo thả các file và folder sau vào:
   - `index.html`
   - `css/` (folder)
   - `js/` (folder)
3. Click "Commit changes"

**Cách 2: Dùng Git Command Line**

```bash
cd d:\billoder
git init
git add index.html css/ js/
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/billoder.git
git push -u origin main
```

### Bước 3: Bật GitHub Pages

1. Vào repository → "Settings"
2. Sidebar bên trái → "Pages"
3. Trong phần "Source":
   - Branch: chọn `main`
   - Folder: chọn `/ (root)`
4. Click "Save"
5. Đợi 1-2 phút, GitHub sẽ deploy tự động
6. Link sẽ hiện ra: `https://your-username.github.io/billoder/`

## 📁 Cấu trúc file cần upload

```
billoder/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── receipt-generator.js
    └── script.js
```

**Lưu ý:** 
- ❌ KHÔNG cần upload: `app.py`, `generate.php`, `receipt_generator.php`, `Procfile`, `requirements.txt`
- ❌ KHÔNG cần upload folder: `static/`, `templates/`, `receipts/`, `fonts/`
- ✅ Chỉ cần: `index.html`, `css/`, `js/`

## 💡 Cách sử dụng

1. Truy cập link GitHub Pages của bạn
2. Nhập tên sản phẩm và giá (hoặc dùng bulk input)
3. Click "Thêm vào giỏ" hoặc "Thêm toàn bộ"
4. Nhập số tiền khách đưa
5. Click "Xuất Hóa Đơn"
6. Ảnh hóa đơn sẽ hiện ra, click "Tải Ảnh Về" để download

## 🔧 Chỉnh sửa thông tin cửa hàng

Mở file `js/receipt-generator.js` và tìm đoạn:

```javascript
ctx.fillText('TAP HOA TRANG', width / 2, y);
// ...
ctx.fillText('DC: 59 Thoai Ngoc Hau, Dong Son 1, Thoai Son, AG', 10, y);
ctx.fillText('DT: 0819906706', 10, y);
```

Thay đổi thông tin theo nhu cầu của bạn.

## ❓ FAQ

**Q: Có mất phí không?**  
A: Hoàn toàn miễn phí. GitHub Pages free cho public repository.

**Q: Ảnh hóa đơn lưu ở đâu?**  
A: Tạo ngay trên trình duyệt, không lưu trên server. Bạn cần tải về nếu muốn giữ lại.

**Q: Có chạy được trên điện thoại không?**  
A: Có, giao diện responsive, chạy tốt trên mọi thiết bị.

**Q: Có thể dùng domain riêng không?**  
A: Có, GitHub Pages hỗ trợ custom domain. Xem [hướng dẫn](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa
