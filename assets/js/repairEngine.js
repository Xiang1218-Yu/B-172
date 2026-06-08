const RepairEngine = {
    async repair(bitmap, rect) {
        try {
            if (!bitmap) {
                throw new Error('无效的图片数据');
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                throw new Error('无法获取 Canvas 上下文');
            }

            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            
            ctx.drawImage(bitmap, 0, 0);
            
            if (!rect) {
                return bitmap;
            }

            const { x, y, w, h } = rect;
            const sampleY = Math.max(0, y - 2);

            let sampleData;
            try {
                sampleData = ctx.getImageData(x, sampleY, w, 1).data;
            } catch (e) {
                throw new Error('获取采样像素数据失败: ' + e.message);
            }

            let imageData;
            try {
                imageData = ctx.getImageData(x, y, w, h);
            } catch (e) {
                throw new Error('获取水印区域像素数据失败: ' + e.message);
            }

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

            try {
                ctx.putImageData(imageData, x, y);
            } catch (e) {
                throw new Error('写入像素数据失败: ' + e.message);
            }

            ctx.filter = 'blur(4px)';
            ctx.drawImage(canvas, x, y, w, h, x, y, w, h);
            ctx.filter = 'none';

            return createImageBitmap(canvas);
        } catch (error) {
            console.error('图片修复失败:', error);
            throw error;
        }
    }
};
