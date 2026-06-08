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
        Store.theme = theme;
        const iconEl = document.getElementById('currentThemeIcon');
        if (iconEl) {
            iconEl.innerHTML = this.icons[theme] || '';
        }
        document.querySelectorAll('.color-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.theme === theme);
        });
    },

    renderCard(item) {
        const gallery = document.getElementById('gallery');
        if (!gallery) return;

        const card = document.createElement('div');
        card.className = 'image-card';
        card.id = `card-${item.id}`;
        card.innerHTML = `
            <div class="canvas-container"><canvas id="canvas-${item.id}"></canvas></div>
            <div class="card-body">
                <span class="status-badge" id="badge-${item.id}">待标注</span>
                <p style="font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.file.name}</p>
            </div>
        `;
        gallery.prepend(card);

        const canvas = document.getElementById(`canvas-${item.id}`);
        if (!canvas) return;

        try {
            canvas.width = item.original.width;
            canvas.height = item.original.height;
            new WatermarkAnnotator(canvas, item.original, (rect) => {
                item.rect = rect;
                item.status = 'annotated';
                this.updateCard(item);
            });
        } catch (error) {
            console.error('Canvas 初始化失败:', error);
            this.toast('图片加载失败: ' + item.file.name);
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
                const canvas = document.getElementById(`canvas-${item.id}`);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(item.processed, 0, 0);
                    }
                }
            } catch (error) {
                console.error('更新画布失败:', error);
            }
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
        wrap.style.display = show ? 'block' : 'none';
        const bar = document.getElementById('progress-bar');
        if (bar) {
            bar.style.width = val + '%';
        }
    },

    download(blob, name) {
        try {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        } catch (error) {
            console.error('下载失败:', error);
            this.toast('下载失败');
        }
    }
};
