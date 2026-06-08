const Core = {
    async handleUpload(files) {
        if (!files || files.length === 0) {
            UI.toast('请选择要上传的图片');
            return;
        }

        for (const file of files) {
            try {
                if (!file.type.startsWith('image/')) {
                    console.warn(`跳过非图片文件: ${file.name}`);
                    continue;
                }

                const id = 'img_' + Math.random().toString(36).slice(2, 9);
                
                let bitmap;
                try {
                    bitmap = await createImageBitmap(file);
                } catch (e) {
                    throw new Error('图片解码失败: ' + e.message);
                }

                if (!bitmap || bitmap.width === 0 || bitmap.height === 0) {
                    throw new Error('图片数据无效');
                }

                const item = { 
                    id, 
                    file, 
                    original: bitmap, 
                    processed: null, 
                    rect: null, 
                    status: 'pending' 
                };
                
                Store.addItem(item);
                UI.renderCard(item);
            } catch (error) {
                console.error(`处理文件 ${file.name} 失败:`, error);
                const id = 'img_' + Math.random().toString(36).slice(2, 9);
                const item = { 
                    id, 
                    file, 
                    original: null, 
                    processed: null, 
                    rect: null, 
                    status: 'error',
                    errorMessage: error.message 
                };
                Store.addItem(item);
                this.renderErrorCard(item);
            }
        }
    },

    renderErrorCard(item) {
        try {
            const gallery = document.getElementById('gallery');
            if (!gallery) return;

            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <div class="canvas-container" id="container-${item.id}">
                    <div class="canvas-error">⚠️ 图片加载失败<br>${item.errorMessage || '未知错误'}</div>
                </div>
                <div class="card-body">
                    <span class="status-badge status-error" id="badge-${item.id}">加载失败</span>
                    <p class="file-name">${item.file.name}</p>
                </div>
            `;
            gallery.prepend(card);
        } catch (e) {
            console.error('渲染错误卡片失败:', e);
        }
    },

    async processAll() {
        const queue = Store.getAnnotatedItems();
        if (queue.length === 0) {
            UI.toast("请先框选水印区域");
            return;
        }

        UI.progress(0, true);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            try {
                item.processed = await RepairEngine.repair(item.original, item.rect);
                item.status = 'done';
                successCount++;
            } catch (error) {
                console.error(`处理图片 ${item.file.name} 失败:`, error);
                item.status = 'error';
                item.errorMessage = error.message;
                failCount++;
            }
            UI.updateCard(item);
            UI.progress(((i + 1) / queue.length) * 100);
        }

        UI.progress(100, false);
        
        if (failCount === 0) {
            UI.toast(`处理完成，共 ${successCount} 张图片`);
        } else {
            UI.toast(`处理完成: 成功 ${successCount} 张，失败 ${failCount} 张`);
        }
    },

    async exportAll() {
        const done = Store.getDoneItems();
        if (done.length === 0) {
            UI.toast("没有可导出的图片");
            return;
        }

        try {
            if (document.getElementById('checkZip').checked) {
                await this.exportZip(done);
            }
        } catch (error) {
            console.error('导出ZIP失败:', error);
            UI.toast('导出ZIP失败: ' + error.message);
        }

        try {
            if (document.getElementById('checkPdf').checked) {
                await this.exportPdf(done);
            }
        } catch (error) {
            console.error('导出PDF失败:', error);
            UI.toast('导出PDF失败: ' + error.message);
        }
    },

    async exportZip(items) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip 库未加载');
        }

        const zip = new JSZip();
        
        for (const item of items) {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = item.processed.width;
                canvas.height = item.processed.height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    throw new Error('无法获取 Canvas 上下文');
                }

                ctx.drawImage(item.processed, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const base64Data = dataUrl.split(',')[1];
                zip.file(`fixed_${item.file.name}`, base64Data, { base64: true });
            } catch (error) {
                console.error(`添加图片 ${item.file.name} 到ZIP失败:`, error);
            }
        }

        const blob = await zip.generateAsync({ type: "blob" });
        UI.download(blob, "images.zip");
    },

    async exportPdf(items) {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error('jsPDF 库未加载');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        items.forEach((item, i) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = item.processed.width;
                canvas.height = item.processed.height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    throw new Error('无法获取 Canvas 上下文');
                }

                ctx.drawImage(item.processed, 0, 0);
                
                if (i > 0) {
                    doc.addPage();
                }
                doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 10, 10, 190, 110);
            } catch (error) {
                console.error(`添加图片 ${item.file.name} 到PDF失败:`, error);
            }
        });

        doc.save("report.pdf");
    }
};
