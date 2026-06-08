const App = {
    init() {
        try {
            this.bindEvents();
            ThemeManager.init('macaron');
            console.log('批量去水印工具初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            UI.toast('应用初始化失败，请刷新页面重试');
        }
    },

    bindEvents() {
        try {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.onchange = (e) => {
                    Core.handleUpload(e.target.files);
                    fileInput.value = '';
                };
            }

            const dropzone = document.getElementById('dropzone');
            if (dropzone) {
                dropzone.onclick = () => {
                    fileInput && fileInput.click();
                };

                dropzone.ondragover = (e) => {
                    e.preventDefault();
                    dropzone.style.borderColor = 'var(--accent)';
                };

                dropzone.ondragleave = (e) => {
                    e.preventDefault();
                    dropzone.style.borderColor = '';
                };

                dropzone.ondrop = (e) => {
                    e.preventDefault();
                    dropzone.style.borderColor = '';
                    if (e.dataTransfer && e.dataTransfer.files) {
                        Core.handleUpload(e.dataTransfer.files);
                    }
                };
            }

            const btnRepair = document.getElementById('btnRepair');
            if (btnRepair) {
                btnRepair.onclick = () => Core.processAll();
            }

            document.addEventListener('dragover', (e) => e.preventDefault());
            document.addEventListener('drop', (e) => e.preventDefault());

            window.addEventListener('error', (e) => {
                console.error('全局错误:', e.error);
            });

            window.addEventListener('unhandledrejection', (e) => {
                console.error('未处理的Promise拒绝:', e.reason);
            });
        } catch (error) {
            console.error('绑定事件失败:', error);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
