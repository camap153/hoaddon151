// receipt-generator.js - Client-side receipt generation using Canvas API

function formatMoney(amount) {
    if (typeof amount === 'number') {
        return amount.toLocaleString('vi-VN');
    }
    return amount;
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}

function generateReceiptCanvas(items, total, paid, change) {
    // Receipt dimensions (K57: 57mm ≈ 384px at 72dpi)
    const width = 384;
    let height = 260 + items.length * 40;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';

    let y = 20;

    // Store name
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOA DON', width / 2, y);
    y += 30;

    // Date and bill ID
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'left';
    const now = new Date();
    const dateStr = `Ngay: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    ctx.fillText(dateStr, 10, y);
    y += 18;
    ctx.fillText(`So HD: ${Date.now()}`, 10, y);
    y += 22;

    // Horizontal line
    ctx.font = '14px "Courier New", monospace';
    const lineChar = '-';
    const charWidth = ctx.measureText(lineChar).width;
    const lineCount = Math.floor((width - 20) / charWidth);
    const line = lineChar.repeat(lineCount);
    ctx.fillText(line, 10, y);
    y += 20;

    // Column positions
    // Fixed Column Positions (Absolute X coordinates)
    // Width = 384px
    const colQtyX = 180;    // Cột SL: Dời hẳn sang trái (180)
    const colPriceX = 280;  // Cột Đơn giá: Dời sang trái chút (280) để cách SL 100px
    const colTotalX = 380;  // Cột Thành tiền: Sát phải (380)

    // Tên hàng chỉ được phép dài đến trước cột SL một chút
    const nameMaxWidth = colQtyX - 20;

    // Headers
    ctx.fillText('TEN HANG', 10, y);
    ctx.textAlign = 'right';
    ctx.fillText('SL', colQtyX, y);
    ctx.fillText('DGIA', colPriceX, y);
    ctx.fillText('TT', colTotalX, y);
    y += 18;

    ctx.textAlign = 'left';
    ctx.fillText(line, 10, y);
    y += 20;

    // Items
    items.forEach(item => {
        const name = item.name;
        const price = formatMoney(item.price);
        const qty = item.qty || 1;

        ctx.font = '14px "Courier New", monospace';
        const nameLines = wrapText(ctx, name, nameMaxWidth);

        // First line with name + values
        ctx.textAlign = 'left';
        ctx.fillText(nameLines[0], 10, y);

        // Auto-scale font size if text is too wide
        function drawScaledText(text, x, y, maxWidth, align = 'right') {
            let fontSize = 14;
            ctx.font = `${fontSize}px "Courier New", monospace`;

            while (ctx.measureText(text).width > maxWidth && fontSize > 8) {
                fontSize--;
                ctx.font = `${fontSize}px "Courier New", monospace`;
            }

            ctx.textAlign = align;
            ctx.fillText(text, x, y);

            // Reset font
            ctx.font = '14px "Courier New", monospace';
        }

        // Column widths for checking overlap
        const maxPriceWidth = colTotalX - colPriceX - 10; // ~90px
        const maxTotalWidth = width - colTotalX + (colTotalX - colPriceX) - 10; // ~90px (estimate)

        ctx.textAlign = 'right';
        ctx.fillText(qty, colQtyX, y);

        // Draw Price and Total with auto-scaling
        drawScaledText(price, colPriceX, y, 90);
        drawScaledText(price, colTotalX, y, 90);

        y += 18;

        // Additional name lines
        ctx.textAlign = 'left';
        for (let i = 1; i < nameLines.length; i++) {
            ctx.fillText(nameLines[i], 10, y);
            y += 18;
        }
    });

    // Bottom line
    y += 6;
    ctx.fillText(line, 10, y);
    y += 22;

    // Summary
    const labels = ['TONG TIEN:', 'KHACH DUA:', 'TIEN THUA:'];
    const values = [
        formatMoney(total),
        formatMoney(paid),
        formatMoney(change)
    ];

    const labelWidths = labels.map(l => ctx.measureText(l).width);
    const valueWidths = values.map(v => ctx.measureText(v).width);
    const maxLabelWidth = Math.max(...labelWidths);
    const maxValueWidth = Math.max(...valueWidths);
    const minGap = 12;
    const rightLimit = 380;

    for (let i = 0; i < labels.length; i++) {
        ctx.textAlign = 'right';
        ctx.fillText(labels[i], rightLimit - 100, y); // Label cách giá trị một chút
        ctx.fillText(values[i], rightLimit, y);
        y += 18;
    }

    y += 12;
    ctx.textAlign = 'left';
    ctx.fillText(line, 10, y);
    y += 24;

    // Thank you
    ctx.textAlign = 'center';
    ctx.fillText('CAM ON QUY KHACH!', width / 2, y);
    y += 40;

    // Crop canvas to actual height
    if (y < height) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = y;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.fillStyle = '#ffffff';
        croppedCtx.fillRect(0, 0, width, y);
        croppedCtx.drawImage(canvas, 0, 0);
        return croppedCanvas;
    }

    return canvas;
}

function downloadReceipt(canvas) {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HD_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
    });
}
