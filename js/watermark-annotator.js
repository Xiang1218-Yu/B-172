class WatermarkAnnotator {
    constructor(canvas, bitmap, onUpdate) {
        try {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            if (!this.ctx) {
                throw new Error('无法获取Canvas 2D上下文');
            }
            
            this.bitmap = bitmap;
            this.onUpdate = onUpdate;
            this.rect = null;
            this.isDrawing = false;
            this.init();
        } catch (error) {
            console.error('初始化标注器失败:', error);
            throw error;
        }
    }

    init() {
        let startX, startY;
        
        const getCoords = (e) => {
            try {
                const bc = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / bc.width;
                const scaleY = this.canvas.height / bc.height;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return [ (clientX - bc.left) * scaleX, (clientY - bc.top) * scaleY ];
            } catch (error) {
                console.error('获取坐标失败:', error);
                return [0, 0];
            }
        };

        const start = (e) => {
            e.preventDefault();
            this.isDrawing = true;
            [startX, startY] = getCoords(e);
        };
        
        const move = (e) => {
            if (!this.isDrawing) return;
            e.preventDefault();
            try {
                const [curX, curY] = getCoords(e);
                this.rect = { 
                    x: Math.max(0, Math.min(startX, curX)), 
                    y: Math.max(0, Math.min(startY, curY)), 
                    w: Math.abs(curX - startX), 
                    h: Math.abs(curY - startY) 
                };
                this.render();
            } catch (error) {
                console.error('绘制选框失败:', error);
            }
        };
        
        const end = () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                if (this.rect && this.rect.w > 5 && this.rect.h > 5) {
                    this.onUpdate(this.rect);
                }
            }
        };

        this.canvas.onmousedown = start;
        this.canvas.ontouchstart = start;
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move);
        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
        
        this.render();
    }

    render() {
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.bitmap, 0, 0);
            
            if (this.rect) {
                this.ctx.strokeStyle = '#ec4899';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
                this.ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
                this.ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
            }
        } catch (error) {
            console.error('渲染Canvas失败:', error);
        }
    }

    destroy() {
        this.canvas.onmousedown = null;
        this.canvas.ontouchstart = null;
    }
}
