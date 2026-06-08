(function () {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.onchange = (e) => Core.handleUpload(e.target.files);
    }

    const dz = document.getElementById('dropzone');
    if (dz) {
        dz.onclick = () => fileInput && fileInput.click();
        dz.ondragover = (e) => {
            e.preventDefault();
            dz.style.borderColor = 'var(--accent)';
        };
        dz.ondragleave = () => {
            dz.style.borderColor = '';
        };
        dz.ondrop = (e) => {
            e.preventDefault();
            dz.style.borderColor = '';
            Core.handleUpload(e.dataTransfer.files);
        };
    }

    const btnRepair = document.getElementById('btnRepair');
    if (btnRepair) {
        btnRepair.onclick = () => Core.processAll();
    }

    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.onclick = () => Core.exportAll();
    }

    UI.initTheme();
})();
