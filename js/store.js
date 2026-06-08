const Store = {
    items: [],
    theme: 'macaron',

    addItem(item) {
        this.items.push(item);
    },

    getAnnotated() {
        return this.items.filter(i => i.status === 'annotated');
    },

    getDone() {
        return this.items.filter(i => i.status === 'done');
    },

    updateItem(id, updates) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
        }
        return item;
    }
};
