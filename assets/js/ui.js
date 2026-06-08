const UI = {
    icons: {
        macaron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
        deepBlue: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    },

    initTheme() {
        this.updateThemeUI('macaron');
        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.updateThemeUI(theme);
                Store.setTheme(theme);
            });
        });
    },

    updateThemeUI(theme) {
        try {
            document.body.setAttribute('data-theme', theme);
            const iconElement = document.getElementById('currentThemeIcon');
            if (iconElement) {
                iconElement.innerHTML = this.icons[theme] || '';
            }
            document.querySelectorAll('.color-dot').forEach(d => {
                d.classList.toggle('active', d.dataset.theme === theme);
            });
        } catch (error) {
            console.error('更新主题UI失败:', error);
        }
    },

    renderCard(item) {
        try {
            const gallery = document.getElementById('gallery');
            if (!gallery) {
                throw new Error('找不到画廊容器');
            }

            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <div class="canvas-container" id="container-${item.id}">
                    <canvas id="canvas-${item.id}"></canvas>
                </div>
                <div class="card-body">
                    <span class="status-badge" id="badge-${item.id}">待标注</span>
                    <p class="file-name">${item.file.name}</p>
                </div>
            `;
            gallery.prepend(card);

            const canvas = document.getElementById(`canvas-${item.id}`);
            if (!canvas) {
                throw new Error('Canvas 元素创建失败');
            }

            canvas.width = item.original.width;
            canvas.height = item.original.height;

            new WatermarkAnnotator(canvas, item.original, (rect, error) => {
                if (error) {
                    this.showCanvasError(item.id, error.message);
                    return;
                }
                item.rect = rect;
                item.status = 'annotated';
                this.updateCard(item);
            });
        } catch (error) {
            console.error('渲染卡片失败:', error);
            this.showCanvasError(item.id, error.message);
        }
    },

    showCanvasError(id, message) {
        try {
            const container = document.getElementById(`container-${id}`);
            const badge = document.getElementById(`badge-${id}`);
            
            if (container) {
                container.innerHTML = `<div class="canvas-error">⚠️ 图片加载失败<br>${message || '未知错误'}</div>`;
            }
            if (badge) {
                badge.innerText = "加载失败";
                badge.className = "status-badge status-error";
            }

            const item = Store.getItemById(id);
            if (item) {
                item.status = 'error';
            }
        } catch (e) {
            console.error('显示错误状态失败:', e);
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
                badge.innerText = "处理失败";
                badge.className = "status-badge status-error";
            }
        } catch (error) {
            console.error('更新卡片失败:', error);
        }
    },

    toast(msg) {
        try {
            const t = document.getElementById('toast');
            if (!t) return;

            t.innerText = msg;
            t.style.transform = 'translate(-50%, 0)';
            t.style.opacity = '1';
            setTimeout(() => {
                t.style.transform = 'translate(-50%, 100px)';
                t.style.opacity = '0';
            }, 2500);
        } catch (error) {
            console.error('显示提示失败:', error);
        }
    },

    progress(val, show) {
        try {
            const wrap = document.getElementById('progress-wrap');
            if (!wrap) return;

            wrap.style.display = show ? 'block' : 'none';
            const bar = document.getElementById('progress-bar');
            if (bar) {
                bar.style.width = val + '%';
            }
        } catch (error) {
            console.error('更新进度条失败:', error);
        }
    },

    download(blob, name) {
        try {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name;
            a.click();
            setTimeout(() => {
                URL.revokeObjectURL(a.href);
            }, 1000);
        } catch (error) {
            console.error('下载失败:', error);
            this.toast('下载失败: ' + error.message);
        }
    }
};
