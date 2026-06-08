/**
 * Exporter - 导出器
 * 单一职责：将已处理图片打包导出为 ZIP 或 PDF
 */
const Exporter = {
    _toCanvas(bitmap) {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
        ctx.drawImage(bitmap, 0, 0);
        return canvas;
    },

    async exportZip(items) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip 未加载');
        }
        const zip = new JSZip();
        items.forEach(item => {
            try {
                const canvas = this._toCanvas(item.processed);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                zip.file(`fixed_${item.file.name}`, dataUrl.split(',')[1], { base64: true });
            } catch (err) {
                console.error('[Exporter] ZIP 单项失败：', item.file.name, err);
            }
        });
        return await zip.generateAsync({ type: 'blob' });
    },

    exportPdf(items) {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error('jsPDF 未加载');
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        items.forEach((item, i) => {
            try {
                const canvas = this._toCanvas(item.processed);
                if (i > 0) doc.addPage();
                doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 10, 10, 190, 110);
            } catch (err) {
                console.error('[Exporter] PDF 单项失败：', item.file.name, err);
            }
        });
        doc.save('report.pdf');
    }
};
