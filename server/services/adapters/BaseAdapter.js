/**
 * BaseAdapter interface for image generation engines
 */
class BaseAdapter {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  async checkAvailability() {
    throw new Error('checkAvailability() must be implemented');
  }

  async getModels() {
    throw new Error('getModels() must be implemented');
  }

  async generate(options) {
    throw new Error('generate() must be implemented');
  }

  supportsImageToImage() {
    return false;
  }

  getSupportedResolutions() {
    return [
      { width: 512, height: 512, label: '512 × 512' },
      { width: 768, height: 768, label: '768 × 768' },
      { width: 1024, height: 1024, label: '1024 × 1024' },
      { width: 1024, height: 768, label: '1024 × 768 (Landscape)' },
      { width: 768, height: 1024, label: '768 × 1024 (Portrait)' },
      { width: 1280, height: 720, label: '1280 × 720 (16:9)' },
      { width: 720, height: 1280, label: '720 × 1280 (9:16)' }
    ];
  }
}

module.exports = BaseAdapter;

