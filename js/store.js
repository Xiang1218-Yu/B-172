const Store = {
    items: [],
    theme: 'macaron',

    addItem(item) {
        this.items.push(item);
        return item;
    },

    getItemsByStatus(status) {
        return this.items.filter(i => i.status === status);
    },

    updateItemStatus(id, status, additionalData = {}) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.status = status;
            Object.assign(item, additionalData);
        }
        return item;
    },

    clear() {
        this.items = [];
    },

    setTheme(theme) {
        this.theme = theme;
    }
};
