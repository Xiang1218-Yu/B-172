/**
 * UI - 视图渲染层
 * 单一职责：负责 DOM 渲染、卡片更新、主题切换、Toast、进度条等视觉反馈
 */
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
            });
        });
    },

    updateThemeUI(theme) {
        document.body.setAttribute('data-theme', theme);
        document.getElementById('currentThemeIcon').innerHTML = this.icons[theme];
        document.querySelectorAll('.color-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.theme === theme);
        });
        Store.theme = theme;
    },

    renderCard(item) {
        const gallery = document.getElementById('gallery');
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <div class="canvas-container"><canvas id="canvas-${item.id}"></canvas></div>
            <div class="card-body">
                <span class="status-badge" id="badge-${item.id}">待标注</span>
                <p style="font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.file.name}</p>
            </div>
        `;
        gallery.prepend(card);

        const canvas = document.getElementById(`canvas-${item.id}`);
        try {
            canvas.width = item.original.width;
            canvas.height = item.original.height;
            new WatermarkAnnotator(canvas, item.original, (rect) => {
                item.rect = rect;
                item.status = 'annotated';
                this.updateCard(item);
            });
        } catch (err) {
            console.error('[UI] 卡片初始化失败：', err);
            item.status = 'error';
            this.updateCard(item);
            this.toast(`图片 ${item.file.name} 初始化失败`);
        }
    },

    updateCard(item) {
        const badge = document.getElementById(`badge-${item.id}`);
        if (!badge) return;
        if (item.status === 'annotated') {
            badge.innerText = '已标注';
            badge.className = 'status-badge status-annotated';
        } else if (item.status === 'done') {
            badge.innerText = '完成';
            badge.className = 'status-badge status-done';
            try {
                const canvasEl = document.getElementById(`canvas-${item.id}`);
                const ctx = canvasEl && canvasEl.getContext('2d');
                if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
                ctx.drawImage(item.processed, 0, 0);
            } catch (err) {
                console.error('[UI] 绘制处理结果失败：', err);
                this.toast(`绘制 ${item.file.name} 结果失败`);
            }
        } else if (item.status === 'error') {
            badge.innerText = '错误';
            badge.className = 'status-badge status-error';
        }
    },

    toast(msg) {
        const t = document.getElementById('toast');
        if (!t) return;
        t.innerText = msg;
        t.style.transform = 'translate(-50%, 0)';
        t.style.opacity = '1';
        setTimeout(() => {
            t.style.transform = 'translate(-50%, 100px)';
            t.style.opacity = '0';
        }, 2500);
    },

    progress(val, show) {
        const wrap = document.getElementById('progress-wrap');
        if (!wrap) return;
        if (typeof show === 'boolean') {
            wrap.style.display = show ? 'block' : 'none';
        }
        document.getElementById('progress-bar').style.width = val + '%';
    },

    download(blob, name) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
    }
};
