/**
 * App - 应用入口
 * 单一职责：绑定全局事件并初始化主题
 */
(function initApp() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.onchange = (e) => Core.handleUpload(e.target.files);
    }

    const dz = document.getElementById('dropzone');
    if (dz) {
        dz.ondragover = (e) => {
            e.preventDefault();
            dz.style.borderColor = 'var(--accent)';
        };
        dz.ondrop = (e) => {
            e.preventDefault();
            Core.handleUpload(e.dataTransfer.files);
        };
    }

    UI.initTheme();
})();
