const App = {
    init() {
        this.bindEvents();
        UI.initTheme();
    },

    bindEvents() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                Core.handleUpload(e.target.files);
                e.target.value = '';
            });
        }

        const dropzone = document.getElementById('dropzone');
        if (dropzone) {
            dropzone.addEventListener('click', () => {
                fileInput && fileInput.click();
            });

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.style.borderColor = 'var(--accent)';
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.style.borderColor = '';
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.style.borderColor = '';
                Core.handleUpload(e.dataTransfer.files);
            });
        }

        const btnRepair = document.getElementById('btnRepair');
        if (btnRepair) {
            btnRepair.addEventListener('click', () => {
                Core.processAll();
            });
        }

        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                Core.exportAll();
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
