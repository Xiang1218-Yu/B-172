const ThemeManager = {
    icons: {
        macaron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
        deepBlue: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    },

    init(defaultTheme = 'macaron') {
        try {
            this.updateThemeUI(defaultTheme);
            Store.setTheme(defaultTheme);
            
            document.querySelectorAll('.color-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const theme = e.target.dataset.theme;
                    this.switchTheme(theme);
                });
            });
        } catch (error) {
            console.error('初始化主题失败:', error);
        }
    },

    switchTheme(theme) {
        try {
            if (!this.icons[theme]) {
                console.warn('未知主题:', theme);
                return;
            }
            this.updateThemeUI(theme);
            Store.setTheme(theme);
        } catch (error) {
            console.error('切换主题失败:', error);
        }
    },

    updateThemeUI(theme) {
        try {
            document.body.setAttribute('data-theme', theme);
            const iconEl = document.getElementById('currentThemeIcon');
            if (iconEl) {
                iconEl.innerHTML = this.icons[theme];
            }
            document.querySelectorAll('.color-dot').forEach(d => {
                d.classList.toggle('active', d.dataset.theme === theme);
            });
        } catch (error) {
            console.error('更新主题UI失败:', error);
        }
    }
};
