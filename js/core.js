const Core = {
    async handleUpload(files) {
        try {
            if (!files || files.length === 0) {
                UI.toast("请选择要处理的图片");
                return;
            }
            await FileHandler.handleFiles(files);
        } catch (error) {
            console.error('上传处理失败:', error);
            UI.toast(`上传失败: ${error.message}`);
        }
    },

    onRectAnnotated(itemId, rect) {
        try {
            const item = Store.updateItemStatus(itemId, 'annotated', { rect });
            if (item) {
                UI.updateCard(item);
            }
        } catch (error) {
            console.error('更新标注状态失败:', error);
        }
    },

    async processAll() {
        const queue = Store.getItemsByStatus('annotated');
        
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
                Store.updateItemStatus(item.id, 'done');
                UI.updateCard(item);
                successCount++;
            } catch (error) {
                console.error(`处理图片失败: ${item.file.name}`, error);
                Store.updateItemStatus(item.id, 'error');
                UI.updateCard(item);
                failCount++;
            }
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
        try {
            const checkZip = document.getElementById('checkZip');
            const checkPdf = document.getElementById('checkPdf');
            
            const options = {
                zip: checkZip ? checkZip.checked : false,
                pdf: checkPdf ? checkPdf.checked : false
            };

            if (!options.zip && !options.pdf) {
                UI.toast("请选择至少一种导出格式");
                return;
            }

            await Exporter.exportAll(options);
        } catch (error) {
            console.error('导出失败:', error);
            UI.toast(`导出失败: ${error.message}`);
        }
    }
};
