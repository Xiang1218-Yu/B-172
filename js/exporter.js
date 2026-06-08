const Exporter = {
    async exportZip(items) {
        try {
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip库未加载');
            }

            const zip = new JSZip();
            
            for (const item of items) {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = item.processed.width;
                    canvas.height = item.processed.height;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        console.warn('无法获取Canvas上下文，跳过:', item.file.name);
                        continue;
                    }
                    
                    ctx.drawImage(item.processed, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const base64Data = dataUrl.split(',')[1];
                    zip.file(`fixed_${item.file.name}`, base64Data, { base64: true });
                } catch (itemError) {
                    console.error('处理图片失败:', item.file.name, itemError);
                }
            }
            
            const blob = await zip.generateAsync({ type: "blob" });
            UI.download(blob, "images.zip");
            return true;
        } catch (error) {
            console.error('导出ZIP失败:', error);
            throw new Error(`导出ZIP失败: ${error.message}`);
        }
    },

    async exportPdf(items) {
        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF库未加载');
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
                        console.warn('无法获取Canvas上下文，跳过:', item.file.name);
                        return;
                    }
                    
                    ctx.drawImage(item.processed, 0, 0);
                    
                    if (i > 0) {
                        doc.addPage();
                    }
                    
                    const imgData = canvas.toDataURL('image/jpeg');
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const imgRatio = canvas.width / canvas.height;
                    
                    let drawWidth = pageWidth - 20;
                    let drawHeight = drawWidth / imgRatio;
                    
                    if (drawHeight > pageHeight - 20) {
                        drawHeight = pageHeight - 20;
                        drawWidth = drawHeight * imgRatio;
                    }
                    
                    const x = (pageWidth - drawWidth) / 2;
                    const y = 10;
                    
                    doc.addImage(imgData, 'JPEG', x, y, drawWidth, drawHeight);
                } catch (itemError) {
                    console.error('添加图片到PDF失败:', item.file.name, itemError);
                }
            });
            
            doc.save("report.pdf");
            return true;
        } catch (error) {
            console.error('导出PDF失败:', error);
            throw new Error(`导出PDF失败: ${error.message}`);
        }
    },

    async exportAll(options = {}) {
        const done = Store.getItemsByStatus('done');
        if (done.length === 0) {
            UI.toast("没有可导出的图片");
            return false;
        }

        const results = { zip: false, pdf: false };

        try {
            if (options.zip) {
                await this.exportZip(done);
                results.zip = true;
            }
            
            if (options.pdf) {
                await this.exportPdf(done);
                results.pdf = true;
            }

            if (results.zip || results.pdf) {
                UI.toast("导出完成");
            }
            
            return results;
        } catch (error) {
            UI.toast(error.message);
            return results;
        }
    }
};
