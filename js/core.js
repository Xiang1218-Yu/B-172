/**
 * Core - 业务编排层
 * 单一职责：协调上传、修复、导出三大业务流程
 */
const Core = {
    /**
     * 安全地从 File 解析为 ImageBitmap
     * 对图片加载失败（解码错误、非图片文件等）做异常捕获
     */
    async _safeCreateBitmap(file) {
        try {
            return await createImageBitmap(file);
        } catch (err) {
            console.error('[Core] createImageBitmap 失败，尝试通过 Image 元素回退：', err);
            // 回退：使用 Image + objectURL，能监听 onerror
            return await new Promise((resolve, reject) => {
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = async () => {
                    try {
                        const bm = await createImageBitmap(img);
                        URL.revokeObjectURL(url);
                        resolve(bm);
                    } catch (e) {
                        URL.revokeObjectURL(url);
                        reject(e);
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error(`图片加载失败：${file.name}`));
                };
                img.src = url;
            });
        }
    },

    async handleUpload(files) {
        for (const file of files) {
            const id = 'img_' + Math.random().toString(36).slice(2, 9);
            try {
                const bitmap = await this._safeCreateBitmap(file);
                const item = { id, file, original: bitmap, processed: null, rect: null, status: 'pending' };
                Store.items.push(item);
                UI.renderCard(item);
            } catch (err) {
                console.error('[Core] 文件处理失败：', file.name, err);
                UI.toast(`图片加载失败：${file.name}`);
            }
        }
    },

    async processAll() {
        const queue = Store.items.filter(i => i.status === 'annotated');
        if (queue.length === 0) return UI.toast('请先框选水印区域');
        UI.progress(0, true);
        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            try {
                item.processed = await RepairEngine.repair(item.original, item.rect);
                item.status = 'done';
            } catch (err) {
                console.error('[Core] 修复失败：', item.file.name, err);
                item.status = 'error';
                UI.toast(`修复失败：${item.file.name}`);
            }
            UI.updateCard(item);
            UI.progress(((i + 1) / queue.length) * 100);
        }
        UI.progress(100, false);
        UI.toast('处理完成');
    },

    async exportAll() {
        const done = Store.items.filter(i => i.status === 'done');
        if (done.length === 0) return UI.toast('没有可导出的图片');

        const wantZip = document.getElementById('checkZip').checked;
        const wantPdf = document.getElementById('checkPdf').checked;

        if (wantZip) {
            try {
                const blob = await Exporter.exportZip(done);
                UI.download(blob, 'images.zip');
            } catch (err) {
                console.error('[Core] ZIP 导出失败：', err);
                UI.toast('ZIP 导出失败');
            }
        }
        if (wantPdf) {
            try {
                Exporter.exportPdf(done);
            } catch (err) {
                console.error('[Core] PDF 导出失败：', err);
                UI.toast('PDF 导出失败');
            }
        }
    }
};
