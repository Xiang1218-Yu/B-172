const FileHandler = {
    validImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],

    async loadImageFile(file) {
        return new Promise((resolve, reject) => {
            try {
                if (!file) {
                    reject(new Error('无效的文件对象'));
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    reject(new Error(`文件 "${file.name}" 不是有效的图片格式`));
                    return;
                }

                if (!this.validImageTypes.includes(file.type) && !file.type.startsWith('image/')) {
                    console.warn(`文件类型 "${file.type}" 可能不受支持，尝试加载: ${file.name}`);
                }

                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const img = new Image();
                    
                    img.onload = () => {
                        try {
                            createImageBitmap(file)
                                .then(bitmap => resolve(bitmap))
                                .catch(err => {
                                    console.warn('createImageBitmap失败，改用Image元素:', err);
                                    resolve(this.createBitmapFromImage(img));
                                });
                        } catch (err) {
                            reject(new Error(`处理图片失败: ${err.message}`));
                        }
                    };
                    
                    img.onerror = () => {
                        reject(new Error(`图片加载失败: "${file.name}"，文件可能已损坏或格式不支持`));
                    };
                    
                    img.src = e.target.result;
                };
                
                reader.onerror = () => {
                    reject(new Error(`读取文件失败: "${file.name}"`));
                };
                
                reader.readAsDataURL(file);
            } catch (error) {
                reject(new Error(`加载图片异常: ${error.message}`));
            }
        });
    },

    createBitmapFromImage(img) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    reject(new Error('无法创建Canvas上下文'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0);
                
                createImageBitmap(canvas)
                    .then(bitmap => resolve(bitmap))
                    .catch(err => reject(new Error(`从Canvas创建位图失败: ${err.message}`)));
            } catch (error) {
                reject(error);
            }
        });
    },

    async handleFiles(files) {
        const results = [];
        
        for (const file of files) {
            try {
                const bitmap = await this.loadImageFile(file);
                const id = 'img_' + Math.random().toString(36).slice(2, 9);
                const item = {
                    id,
                    file,
                    original: bitmap,
                    processed: null,
                    rect: null,
                    status: 'pending',
                    annotator: null
                };
                Store.addItem(item);
                UI.renderCard(item);
                results.push({ success: true, item, file });
            } catch (error) {
                console.error('处理文件失败:', file.name, error);
                UI.toast(`跳过 "${file.name}": ${error.message}`);
                results.push({ success: false, error: error.message, file });
            }
        }
        
        return results;
    },

    isFileImage(file) {
        return file && file.type.startsWith('image/');
    }
};
