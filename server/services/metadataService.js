const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../data');
const galleryFile = path.resolve(dataDir, 'gallery.json');

class MetadataService {
  constructor() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(galleryFile)) {
      fs.writeFileSync(galleryFile, JSON.stringify([], null, 2), 'utf8');
    }
  }

  readAll() {
    try {
      if (!fs.existsSync(galleryFile)) return [];
      const content = fs.readFileSync(galleryFile, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error('Error reading gallery metadata:', err.message);
      return [];
    }
  }

  saveAll(records) {
    try {
      fs.writeFileSync(galleryFile, JSON.stringify(records, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing gallery metadata:', err.message);
    }
  }

  addImage(item) {
    const list = this.readAll();
    // Prepend new image
    list.unshift(item);
    this.saveAll(list);
    return item;
  }

  addBatch(items) {
    const list = this.readAll();
    const updated = [...items, ...list];
    this.saveAll(updated);
    return items;
  }

  getImages({ search, model, aspectRatio, sort = 'newest' } = {}) {
    let list = this.readAll();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item => 
        (item.prompt && item.prompt.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q)) ||
        (item.filename && item.filename.toLowerCase().includes(q))
      );
    }

    if (model && model !== 'all') {
      list = list.filter(item => item.model === model || item.engine === model);
    }

    if (aspectRatio && aspectRatio !== 'all') {
      list = list.filter(item => item.aspectRatio === aspectRatio);
    }

    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }

  getByFilename(filename) {
    const list = this.readAll();
    return list.find(item => item.filename === filename);
  }

  deleteImage(filename) {
    const list = this.readAll();
    const filtered = list.filter(item => item.filename !== filename);
    this.saveAll(filtered);
    return filtered.length < list.length;
  }

  clearAll() {
    this.saveAll([]);
    return true;
  }
}

module.exports = new MetadataService();

