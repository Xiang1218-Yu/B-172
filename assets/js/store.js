const Store = {
    items: [],
    theme: 'macaron',

    addItem(item) {
        this.items.push(item);
        return item;
    },

    getItemById(id) {
        return this.items.find(item => item.id === id);
    },

    getAnnotatedItems() {
        return this.items.filter(item => item.status === 'annotated');
    },

    getDoneItems() {
        return this.items.filter(item => item.status === 'done');
    },

    updateItemStatus(id, status) {
        const item = this.getItemById(id);
        if (item) {
            item.status = status;
        }
        return item;
    },

    setTheme(theme) {
        this.theme = theme;
    }
};
