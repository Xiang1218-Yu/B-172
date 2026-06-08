const Core = {
    async handleUpload(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                UI.toast('不支持的文件类型: ' + file.name);
                continue;
            }

            try {
                const id = 'img_' + Math.random().toString(36).slice(2, 9);
                const bitmap = await createImageBitmap(file);
                const item = { id, file, original: bitmap, processed: null, rect: null, status: 'pending' };
                Store.addItem(item);
                UI.renderCard(item);
            } catch (error) {
                console.error('图片加载失败:', file.name, error);
                UI.toast('图片加载失败: ' + file.name);
            }
        }
    },

    async processAll() {
        const queue = Store.getAnnotated();
        if (queue.length === 0) return UI.toast('请先框选水印区域');
        UI.progress(0, true);
        try {
            for (let i = 0; i < queue.length; i++) {
                const item = queue[i];
                try {
                    item.processed = await RepairEngine.repair(item.original, item.rect);
                    item.status = 'done';
                    UI.updateCard(item);
                } catch (error) {
                    console.error('处理图片失败:', item.file.name, error);
                    UI.toast('处理失败: ' + item.file.name);
                }
                UI.progress(((i + 1) / queue.length) * 100);
            }
            UI.progress(100, false);
            UI.toast('处理完成');
        } catch (error) {
            console.error('批量处理异常:', error);
            UI.progress(100, false);
            UI.toast('处理过程中发生错误');
        }
    },

    async exportAll() {
        const done = Store.getDone();
        if (done.length === 0) return UI.toast('没有可导出的图片');

        try {
            if (document.getElementById('checkZip').checked) {
                await this._exportZip(done);
            }
            if (document.getElementById('checkPdf').checked) {
                this._exportPdf(done);
            }
        } catch (error) {
            console.error('导出失败:', error);
            UI.toast('导出失败: ' + error.message);
        }
    },

    async _exportZip(done) {
        const zip = new JSZip();
        for (const item of done) {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = item.processed.width;
                canvas.height = item.processed.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas 上下文获取失败');
                ctx.drawImage(item.processed, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                zip.file(`fixed_${item.file.name}`, dataUrl.split(',')[1], { base64: true });
            } catch (error) {
                console.error('打包图片失败:', item.file.name, error);
            }
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        UI.download(blob, 'images.zip');
    },

    _exportPdf(done) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            done.forEach((item, i) => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = item.processed.width;
                    canvas.height = item.processed.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Canvas 上下文获取失败');
                    ctx.drawImage(item.processed, 0, 0);
                    if (i > 0) doc.addPage();
                    doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 10, 10, 190, 110);
                } catch (error) {
                    console.error('PDF 添加图片失败:', item.file.name, error);
                }
            });
            doc.save('report.pdf');
        } catch (error) {
            console.error('PDF 导出失败:', error);
            throw error;
        }
    }
};
