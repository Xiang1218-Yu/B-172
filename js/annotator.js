class WatermarkAnnotator {
    constructor(canvas, bitmap, onUpdate) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('无法获取 Canvas 2D 上下文');
        }
        this.bitmap = bitmap;
        this.onUpdate = onUpdate;
        this.rect = null;
        this.isDrawing = false;
        this._boundMove = null;
        this._boundEnd = null;
        this.init();
    }

    init() {
        let startX, startY;
        const getCoords = (e) => {
            const bc = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / bc.width;
            const scaleY = this.canvas.height / bc.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return [(clientX - bc.left) * scaleX, (clientY - bc.top) * scaleY];
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
                this.onUpdate(this.rect);
            }
        };

        this.canvas.onmousedown = start;
        this._boundMove = move;
        this._boundEnd = end;
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
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
            console.error('Canvas 渲染失败:', error);
        }
    }

    destroy() {
        if (this._boundMove) {
            window.removeEventListener('mousemove', this._boundMove);
        }
        if (this._boundEnd) {
            window.removeEventListener('mouseup', this._boundEnd);
        }
        this.canvas.onmousedown = null;
    }
}
