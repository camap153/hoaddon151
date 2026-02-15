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
                <td>${item.qty}</td>
                <td>${formatMoney(item.price)}</td>
                <td>${formatMoney(totalPrice)}</td>
                <td><button class="remove-btn" data-index="${index}">&times;</button></td>
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

            // Simple parser: last word as price, rest as name
            // Or handle formats like "Name 10.000" or "Name 10000"
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const priceStr = parts.pop();
                const name = parts.join(' ');

                // Remove formatting from price string (like dots or commas)
                const price = parseFloat(priceStr.replace(/[\.,]/g, ''));

                if (!isNaN(price)) {
                    items.push({ name, price });
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
