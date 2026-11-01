const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ComfyUIAdapter = require('./adapters/ComfyUIAdapter');
const imageProcessingService = require('./imageProcessingService');
const metadataService = require('./metadataService');

class AIService {
  constructor() {
    this.adapters = {
      'comfyui': new ComfyUIAdapter()
    };
    this.defaultEngine = 'comfyui';
    this.generatedDir = path.resolve(__dirname, '../generated');
    this.uploadsDir = path.resolve(__dirname, '../uploads');

    if (!fs.existsSync(this.generatedDir)) {
      fs.mkdirSync(this.generatedDir, { recursive: true });
    }
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  getAdapter(engineId) {
    const id = engineId || this.defaultEngine;
    const adapter = this.adapters[id];
    if (!adapter) {
      throw new Error(`Engine adapter '${id}' not recognized. Available engines: ${Object.keys(this.adapters).join(', ')}`);
    }
    return adapter;
  }

  async getComfyUIStatus() {
    return await this.adapters['comfyui'].checkAvailability();
  }

  async getEngines() {
    const results = [];
    for (const [id, adapter] of Object.entries(this.adapters)) {
      let availability = { available: false, status: 'unavailable' };
      try {
        availability = await adapter.checkAvailability();
      } catch (e) {
        availability = { available: false, status: 'unavailable', error: e.message };
      }

      results.push({
        id: adapter.id,
        name: adapter.name,
        description: adapter.description,
        isDefault: true,
        isPrimary: true,
        status: availability.status || (availability.available ? 'connected' : 'unavailable'),
        available: !!availability.available,
        details: availability,
        supportsImg2Img: adapter.supportsImageToImage(),
        supportedResolutions: adapter.getSupportedResolutions()
      });
    }
    return results;
  }

  async getAllModels() {
    const models = [];
    for (const [engineId, adapter] of Object.entries(this.adapters)) {
      try {
        const engineModels = await adapter.getModels();
        models.push(...engineModels);
      } catch (err) {
        console.warn(`Could not get models for engine ${engineId}:`, err.message);
      }
    }
    return models;
  }

  async enhancePrompt(rawPrompt) {
    const comfyui = this.adapters['comfyui'];
    return await comfyui.enhancePrompt(rawPrompt);
  }

  /**
   * Generates 1, 2, 3, or 4 images based on prompt and options
   */
  async generateImages(options) {
    const {
      prompt,
      referenceImage,
      referenceStrength = 0.65,
      referenceMode = 'image-to-image',
      resolution,
      width: customWidth,
      height: customHeight,
      model,
      engine = 'comfyui',
      negativePrompt,
      seed,
      steps = 25,
      guidanceScale = 7.5,
      sampler = 'Euler a',
      count = 1,
      allowFallback = false
    } = options;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('A valid text prompt is required for image generation.');
    }

    // Determine dimensions
    let width = 1024;
    let height = 1024;

    if (resolution && typeof resolution === 'string' && resolution.includes('x')) {
      const parts = resolution.split('x').map(p => parseInt(p.trim(), 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        width = parts[0];
        height = parts[1];
      }
    } else if (customWidth && customHeight) {
      width = parseInt(customWidth, 10);
      height = parseInt(customHeight, 10);
    }

    // Dimension bounds validation
    if (isNaN(width) || width < 256 || width > 2048) {
      throw new Error(`Invalid width: ${width}. Width must be between 256 and 2048 pixels.`);
    }
    if (isNaN(height) || height < 256 || height > 2048) {
      throw new Error(`Invalid height: ${height}. Height must be between 256 and 2048 pixels.`);
    }

    // Locate reference image if specified
    let referenceImagePath = null;
    if (referenceImage) {
      const inUploads = path.resolve(this.uploadsDir, path.basename(referenceImage));
      const inGenerated = path.resolve(this.generatedDir, path.basename(referenceImage));

      if (fs.existsSync(inUploads)) {
        referenceImagePath = inUploads;
      } else if (fs.existsSync(inGenerated)) {
        referenceImagePath = inGenerated;
      } else if (fs.existsSync(referenceImage)) {
        referenceImagePath = referenceImage;
      } else {
        throw new Error(`Reference image '${referenceImage}' was not found in uploads or generated folders.`);
      }
    }

    const targetEngineId = engine || 'comfyui';
    const adapter = this.getAdapter(targetEngineId);
    const imageCount = Math.max(1, Math.min(4, parseInt(count, 10) || 1));
    const generatedItems = [];

    const cleanPromptSlug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32) || 'neurocanvas';

    const baseSeed = seed ? parseInt(seed, 10) : Math.floor(Math.random() * 2147483647);

    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    const aspectStr = `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;

    // Call ComfyUI adapter
    const rawOutputs = await adapter.generate({
      prompt: prompt.trim(),
      referenceImagePath,
      referenceStrength,
      referenceMode,
      width,
      height,
      model: model || 'sd_xl_base_1.0.safetensors',
      negativePrompt,
      seed: baseSeed,
      steps,
      guidanceScale,
      sampler,
      count: imageCount
    });

    const outputList = Array.isArray(rawOutputs) ? rawOutputs : [rawOutputs];

    for (let i = 0; i < outputList.length; i++) {
      const item = outputList[i];
      const timestamp = Date.now() + i;

      // Inspect buffer with Sharp to guarantee true physical dimensions
      let actualWidth = item.width || width;
      let actualHeight = item.height || height;
      let actualFormat = item.format || 'png';
      try {
        const imageMetadata = await sharp(item.buffer).metadata();
        if (imageMetadata.width && imageMetadata.height) {
          actualWidth = imageMetadata.width;
          actualHeight = imageMetadata.height;
        }
        if (imageMetadata.format) {
          actualFormat = imageMetadata.format;
        }
      } catch (sharpErr) {
        console.warn('Could not inspect generated image metadata with Sharp:', sharpErr.message);
      }

      const divisorActual = gcd(actualWidth, actualHeight);
      const actualAspectStr = `${Math.round(actualWidth / divisorActual)}:${Math.round(actualHeight / divisorActual)}`;

      const indexSuffix = outputList.length > 1 ? `_${String(i + 1).padStart(2, '0')}` : '';
      const filename = `neurocanvas_${cleanPromptSlug}_${actualWidth}x${actualHeight}${indexSuffix}_${timestamp}.${actualFormat}`;
      const filePath = path.resolve(this.generatedDir, filename);

      fs.writeFileSync(filePath, item.buffer);
      const stat = fs.statSync(filePath);

      const record = {
        id: `img_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
        filename: filename,
        url: `/api/images/${filename}`,
        width: actualWidth,
        height: actualHeight,
        aspectRatio: actualAspectStr,
        format: actualFormat,
        size: stat.size,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt || null,
        model: item.model || model || adapter.id,
        engine: targetEngineId,
        fallbackInfo: null,
        seed: item.seed || baseSeed + i,
        steps: steps,
        guidanceScale: guidanceScale,
        sampler: sampler,
        durationMs: item.durationMs,
        referenceImageUsed: !!referenceImagePath,
        referenceImageFilename: referenceImagePath ? path.basename(referenceImagePath) : null,
        referenceStrength: referenceImagePath ? referenceStrength : null,
        referenceMode: referenceImagePath ? referenceMode : null,
        createdAt: new Date().toISOString()
      };

      metadataService.addImage(record);
      generatedItems.push(record);
    }

    return generatedItems;
  }

  /**
   * 2x Super-Resolution Upscaling using Sharp
   */
  async upscale(filename, scale = 2) {
    const filePath = path.resolve(this.generatedDir, path.basename(filename));
    if (!fs.existsSync(filePath)) {
      throw new Error(`File '${filename}' not found for upscaling.`);
    }

    const buffer = fs.readFileSync(filePath);
    const result = await imageProcessingService.upscaleImage(buffer, scale);

    const timestamp = Date.now();
    const upscaledFilename = `upscaled_${result.scale}x_${path.basename(filename, path.extname(filename))}_${timestamp}.png`;
    const outPath = path.resolve(this.generatedDir, upscaledFilename);
    fs.writeFileSync(outPath, result.buffer);

    const stat = fs.statSync(outPath);
    const originalMeta = metadataService.getByFilename(filename) || {};

    const record = {
      id: `img_${timestamp}_upscaled`,
      filename: upscaledFilename,
      url: `/api/images/${upscaledFilename}`,
      width: result.width,
      height: result.height,
      aspectRatio: originalMeta.aspectRatio || 'custom',
      format: 'png',
      size: stat.size,
      prompt: `${originalMeta.prompt || 'Artwork'} (Upscaled ${result.scale}x)`,
      model: originalMeta.model || 'sharp-lanczos3',
      engine: originalMeta.engine || 'sharp',
      durationMs: 250,
      createdAt: new Date().toISOString()
    };

    metadataService.addImage(record);
    return record;
  }
}

module.exports = new AIService();
