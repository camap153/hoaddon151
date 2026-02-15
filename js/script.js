document.addEventListener('DOMContentLoaded', () => {
    const items = [];
    const productNameInput = document.getElementById('product-name');
    const productQtyInput = document.getElementById('product-qty');
    const productPriceInput = document.getElementById('product-price');
    const addItemBtn = document.getElementById('add-item');
    const cartTableBody = document.querySelector('#cart-table tbody');
    const displayTotal = document.getElementById('display-total');
    const amountPaidInput = document.getElementById('amount-paid');
    const displayChange = document.getElementById('display-change');
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.getElementById('result-container');
    const receiptImage = document.getElementById('receipt-image');
    const downloadLink = document.getElementById('download-link');
    const bulkInput = document.getElementById('bulk-input');
    const bulkAddBtn = document.getElementById('bulk-add');

    function formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount);
    }

    function updateSummary() {
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        displayTotal.textContent = formatMoney(total);

        const paid = parseFloat(amountPaidInput.value) || 0;
        const change = Math.max(0, paid - total);
        displayChange.textContent = formatMoney(change);
    }

    function renderCart() {
        cartTableBody.innerHTML = '';
        items.forEach((item, index) => {
            const totalPrice = item.price * item.qty;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td style="text-align: center">${item.qty}</td>
                <td style="text-align: right">${formatMoney(item.price)}</td>
                <td style="text-align: right">${formatMoney(totalPrice)}</td>
                <td style="text-align: center"><button class="remove-btn" data-index="${index}">&times;</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        // Add remove listeners
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                items.splice(index, 1);
                renderCart();
                updateSummary();
            });
        });
    }

    addItemBtn.addEventListener('click', () => {
        const name = productNameInput.value.trim();
        const qty = parseInt(productQtyInput.value) || 1;
        const price = parseFloat(productPriceInput.value);

        if (!name || isNaN(price) || qty < 1) {
            alert('Vui lòng nhập đầy đủ thông tin hợp lệ');
            return;
        }

        items.push({ name, qty, price });
        productNameInput.value = '';
        productQtyInput.value = '1';
        productPriceInput.value = '';
        productNameInput.focus();

        renderCart();
        updateSummary();
    });

    bulkAddBtn.addEventListener('click', () => {
        const text = bulkInput.value.trim();
        if (!text) return;

        const lines = text.split('\n');
        let addedCount = 0;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Parser cải tiến đơn giản hơn:
            // Luôn lấy phần tử cuối cùng làm GIÁ.
            // Kiểm tra phần tử kế cuối: nếu là số -> SỐ LƯỢNG. Nếu không -> mặc định là 1.
            // Phần còn lại nối lại làm TÊN.

            const parts = line.split(/\s+/);

            if (parts.length >= 2) {
                // 1. Lấy giá (phần tử cuối cùng)
                let priceStr = parts.pop();
                let price = parseFloat(priceStr.replace(/[\.,]/g, '')); // Loại bỏ dấu chấm/phẩy khi parse giá

                // Nếu giá không hợp lệ, bỏ qua dòng này
                if (isNaN(price)) return;

                let qty = 1;

                // 2. Kiểm tra phần tử kế cuối để xem có phải số lượng không
                if (parts.length > 0) {
                    const lastPart = parts[parts.length - 1];
                    // Kiểm tra xem có phải số không (chấp nhận cả số thập phân như 1.5)
                    // Lưu ý: thay thế dấu phẩy bằng chấm để chuẩn hóa số thập phân
                    const possibleQty = parseFloat(lastPart.replace(',', '.'));

                    if (!isNaN(possibleQty)) {
                        qty = possibleQty; // Lấy làm số lượng
                        parts.pop();       // Xóa khỏi mảng tên
                    }
                }

                // 3. Phần còn lại là tên
                const name = parts.join(' ');

                if (name) {
                    items.push({ name, qty, price });
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            bulkInput.value = '';
            renderCart();
            updateSummary();
        } else {
            alert('Không tìm thấy sản phẩm hợp lệ. Định dạng chuẩn: Tên_sản_phẩm Giá');
        }
    });

    amountPaidInput.addEventListener('input', updateSummary);

    generateBtn.addEventListener('click', () => {
        if (items.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        const total = items.reduce((sum, item) => sum + item.price, 0);
        const paid = parseFloat(amountPaidInput.value) || 0;
        const change = paid - total;

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Đang xử lý...';

            // Generate receipt using Canvas (client-side)
            const canvas = generateReceiptCanvas(items, total, paid, change);

            // Display the canvas as image
            const imageUrl = canvas.toDataURL('image/png');
            receiptImage.src = imageUrl;
            // Note: Data URLs don't really cache the same way, but let's ensure DOM updates
            receiptImage.style.display = 'block';

            // Setup download link using Blob for better compatibility
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = `HD_${Date.now()}.png`;

                // Clean up old URL if exists
                if (downloadLink.dataset.blobUrl) {
                    URL.revokeObjectURL(downloadLink.dataset.blobUrl);
                }
                downloadLink.dataset.blobUrl = url;
            });

            resultContainer.classList.remove('hidden');
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi tạo hóa đơn!');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Xuất Hóa Đơn';
        }
    });


    // Handle Enter key on inputs
    [productNameInput, productPriceInput].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItemBtn.click();
        });
    });
});
