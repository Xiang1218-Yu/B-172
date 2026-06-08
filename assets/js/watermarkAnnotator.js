class WatermarkAnnotator {
    constructor(canvas, bitmap, onUpdate) {
        this.canvas = canvas;
        this.ctx = null;
        this.bitmap = bitmap;
        this.onUpdate = onUpdate;
        this.rect = null;
        this.isDrawing = false;
        this.moveHandler = null;
        this.upHandler = null;
        
        this.init();
    }

    init() {
        try {
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('无法获取 Canvas 上下文');
            }

            let startX, startY;
            const getCoords = (e) => {
                const bc = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / bc.width;
                const scaleY = this.canvas.height / bc.height;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return [ (clientX - bc.left) * scaleX, (clientY - bc.top) * scaleY ];
            };

            const start = (e) => {
                this.isDrawing = true;
                [startX, startY] = getCoords(e);
            };

            const move = (e) => {
                if (!this.isDrawing) return;
                const [curX, curY] = getCoords(e);
                this.rect = { 
                    x: Math.min(startX, curX), 
                    y: Math.min(startY, curY), 
                    w: Math.abs(curX - startX), 
                    h: Math.abs(curY - startY) 
                };
                this.render();
            };

            const end = () => {
                if (this.isDrawing) {
                    this.isDrawing = false;
                    if (this.onUpdate) {
                        this.onUpdate(this.rect);
                    }
                }
            };

            this.moveHandler = move;
            this.upHandler = end;

            this.canvas.onmousedown = start;
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', end);
            
            this.render();
        } catch (error) {
            console.error('水印标注器初始化失败:', error);
            if (this.onUpdate) {
                this.onUpdate(null, error);
            }
        }
    }

    render() {
        try {
            if (!this.ctx) {
                throw new Error('Canvas 上下文不可用');
            }

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
            console.error('Canvas 渲染失败:', error);
        }
    }

    destroy() {
        if (this.moveHandler) {
            window.removeEventListener('mousemove', this.moveHandler);
        }
        if (this.upHandler) {
            window.removeEventListener('mouseup', this.upHandler);
        }
    }
}
