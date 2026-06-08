const UI = {
    renderCard(item) {
        try {
            const gallery = document.getElementById('gallery');
            if (!gallery) {
                throw new Error('找不到画廊容器');
            }

            const card = document.createElement('div');
            card.className = 'image-card';
            card.id = `card-${item.id}`;
            card.innerHTML = `
                <div class="canvas-container"><canvas id="canvas-${item.id}"></canvas></div>
                <div class="card-body">
                    <span class="status-badge" id="badge-${item.id}">待标注</span>
                    <p style="font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.escapeHtml(item.file.name)}</p>
                </div>
            `;
            gallery.prepend(card);
            
            const canvas = document.getElementById(`canvas-${item.id}`);
            canvas.width = item.original.width;
            canvas.height = item.original.height;
            
            item.annotator = new WatermarkAnnotator(canvas, item.original, (rect) => {
                Core.onRectAnnotated(item.id, rect);
            });
        } catch (error) {
            console.error('渲染卡片失败:', error);
            this.toast(`渲染卡片失败: ${error.message}`);
        }
    },

    updateCard(item) {
        try {
            const badge = document.getElementById(`badge-${item.id}`);
            if (!badge) return;

            if (item.status === 'annotated') {
                badge.innerText = "已标注";
                badge.className = "status-badge status-annotated";
            } else if (item.status === 'done') {
                badge.innerText = "完成";
                badge.className = "status-badge status-done";
                const canvas = document.getElementById(`canvas-${item.id}`);
                if (canvas && item.processed) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(item.processed, 0, 0);
                    }
                }
            } else if (item.status === 'error') {
                badge.innerText = "错误";
                badge.className = "status-badge";
                badge.style.color = '#ef4444';
            }
        } catch (error) {
            console.error('更新卡片失败:', error);
        }
    },

    toast(msg, duration = 2500) {
        try {
            const t = document.getElementById('toast');
            if (!t) return;
            
            t.innerText = msg;
            t.style.transform = 'translate(-50%, 0)';
            t.style.opacity = '1';
            
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
                t.style.transform = 'translate(-50%, 100px)';
                t.style.opacity = '0';
            }, duration);
        } catch (error) {
            console.error('显示提示失败:', error);
        }
    },

    progress(val, show) {
        try {
            const wrap = document.getElementById('progress-wrap');
            const bar = document.getElementById('progress-bar');
            if (!wrap || !bar) return;
            
            wrap.style.display = show ? 'block' : 'none';
            bar.style.width = val + '%';
        } catch (error) {
            console.error('更新进度条失败:', error);
        }
    },

    download(blob, name) {
        try {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(a.href), 100);
        } catch (error) {
            console.error('下载失败:', error);
            this.toast('下载失败');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    clearGallery() {
        const gallery = document.getElementById('gallery');
        if (gallery) {
            gallery.innerHTML = '';
        }
    }
};
