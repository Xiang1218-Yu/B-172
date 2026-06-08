const RepairEngine = {
    async repair(bitmap, rect) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('无法获取 Canvas 2D 上下文');
            }
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            ctx.drawImage(bitmap, 0, 0);
            if (!rect) return bitmap;

            const { x, y, w, h } = rect;
            const safeX = Math.max(0, Math.min(x, canvas.width - 1));
            const safeY = Math.max(0, Math.min(y, canvas.height - 1));
            const safeW = Math.min(w, canvas.width - safeX);
            const safeH = Math.min(h, canvas.height - safeY);
            if (safeW <= 0 || safeH <= 0) {
                console.warn('修复区域无效，跳过修复');
                return bitmap;
            }

            const sampleY = Math.max(0, safeY - 2);
            const sampleData = ctx.getImageData(safeX, sampleY, safeW, 1).data;
            const imageData = ctx.getImageData(safeX, safeY, safeW, safeH);
            const data = imageData.data;

            for (let i = 0; i < safeH; i++) {
                for (let j = 0; j < safeW; j++) {
                    const idx = (i * safeW + j) * 4;
                    data[idx] = sampleData[j * 4];
                    data[idx + 1] = sampleData[j * 4 + 1];
                    data[idx + 2] = sampleData[j * 4 + 2];
                    data[idx + 3] = sampleData[j * 4 + 3];
                }
            }
            ctx.putImageData(imageData, safeX, safeY);
            ctx.filter = 'blur(4px)';
            ctx.drawImage(canvas, safeX, safeY, safeW, safeH, safeX, safeY, safeW, safeH);
            return await createImageBitmap(canvas);
        } catch (error) {
            console.error('图像修复失败:', error);
            throw new Error('图像修复失败: ' + error.message);
        }
    }
};
