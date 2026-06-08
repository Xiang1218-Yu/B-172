const RepairEngine = {
    async repair(bitmap, rect) {
        try {
            if (!bitmap) {
                throw new Error('无效的图像数据');
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                throw new Error('无法获取Canvas 2D上下文');
            }

            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            
            ctx.drawImage(bitmap, 0, 0);
            
            if (!rect) {
                return createImageBitmap(canvas);
            }

            const { x, y, w, h } = rect;
            
            if (w <= 0 || h <= 0) {
                throw new Error('无效的选择区域尺寸');
            }

            const sampleY = Math.max(0, y - 2);
            const sampleData = ctx.getImageData(x, sampleY, w, 1).data;
            const imageData = ctx.getImageData(x, y, w, h);
            const data = imageData.data;

            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    const idx = (i * w + j) * 4;
                    data[idx] = sampleData[j * 4];
                    data[idx+1] = sampleData[j * 4 + 1];
                    data[idx+2] = sampleData[j * 4 + 2];
                    data[idx+3] = sampleData[j * 4 + 3];
                }
            }
            
            ctx.putImageData(imageData, x, y);
            ctx.filter = 'blur(4px)';
            ctx.drawImage(canvas, x, y, w, h, x, y, w, h);
            
            return await createImageBitmap(canvas);
        } catch (error) {
            console.error('图像修复失败:', error);
            throw new Error(`修复处理失败: ${error.message}`);
        }
    }
};
