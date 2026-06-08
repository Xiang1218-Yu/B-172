/**
 * RepairEngine - 水印修复引擎
 * 单一职责：基于采样的简易内容感知修复算法
 */
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
            // 边界保护：避免 getImageData 越界
            const safeX = Math.max(0, Math.floor(x));
            const safeY = Math.max(0, Math.floor(y));
            const safeW = Math.min(Math.floor(w), canvas.width - safeX);
            const safeH = Math.min(Math.floor(h), canvas.height - safeY);
            if (safeW <= 0 || safeH <= 0) return bitmap;

            const sampleY = Math.max(0, safeY - 2);
            let sampleData, imageData;
            try {
                sampleData = ctx.getImageData(safeX, sampleY, safeW, 1).data;
                imageData = ctx.getImageData(safeX, safeY, safeW, safeH);
            } catch (err) {
                // 通常由 CORS 引起的 SecurityError 等
                throw new Error('Canvas 像素读取失败：' + err.message);
            }
            const data = imageData.data;

            for (let i = 0; i < safeH; i++) {
                for (let j = 0; j < safeW; j++) {
                    const idx = (i * safeW + j) * 4;
                    data[idx]     = sampleData[j * 4];
                    data[idx + 1] = sampleData[j * 4 + 1];
                    data[idx + 2] = sampleData[j * 4 + 2];
                    data[idx + 3] = sampleData[j * 4 + 3];
                }
            }
            ctx.putImageData(imageData, safeX, safeY);
            ctx.filter = 'blur(4px)';
            ctx.drawImage(canvas, safeX, safeY, safeW, safeH, safeX, safeY, safeW, safeH);
            return await createImageBitmap(canvas);
        } catch (err) {
            console.error('[RepairEngine] 修复失败：', err);
            throw err;
        }
    }
};
