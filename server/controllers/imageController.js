const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { ZipArchive } = require('archiver');
const aiService = require('../services/aiService');
const metadataService = require('../services/metadataService');

const generatedDir = path.resolve(__dirname, '../generated');
const uploadsDir = path.resolve(__dirname, '../uploads');

exports.health = (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`
    },
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  });
};

exports.getComfyUIStatus = async (req, res) => {
  try {
    const status = await aiService.getComfyUIStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (err) {
    res.status(502).json({
      success: false,
      available: false,
      error: err.message
    });
  }
};

exports.getEngines = async (req, res) => {
  try {
    const engines = await aiService.getEngines();
    res.json({
      success: true,
      engines
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getAllModels = async (req, res) => {
  try {
    const models = await aiService.getAllModels();
    res.json({
      success: true,
      count: models.length,
      models
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      models: [],
      error: err.message
    });
  }
};

exports.enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required for enhancement.' });
    }

    const enhanced = await aiService.enhancePrompt(prompt);
    res.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: enhanced
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.uploadReference = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please select a PNG, JPG, JPEG, or WEBP image.'
      });
    }

    const filePath = req.file.path;
    let metadata;
    try {
      metadata = await sharp(filePath).metadata();
    } catch (sharpErr) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: `Uploaded file could not be decoded as an image: ${sharpErr.message}`
      });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      url: `/api/images/${req.file.filename}`,
      originalName: req.file.originalname,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Upload processing failed: ${err.message}`
    });
  }
};

exports.generate = async (req, res) => {
  try {
    const {
      prompt,
      referenceImage,
      referenceStrength,
      referenceMode,
      resolution,
      width,
      height,
      model,
      engine,
      negativePrompt,
      seed,
      steps,
      guidanceScale,
      sampler,
      count = 1,
      allowFallback = false
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Prompt cannot be empty.'
      });
    }

    const generated = await aiService.generateImages({
      prompt,
      referenceImage,
      referenceStrength,
      referenceMode,
      resolution,
      width,
      height,
      model,
      engine,
      negativePrompt,
      seed,
      steps,
      guidanceScale,
      sampler,
      count,
      allowFallback
    });

    res.json({
      success: true,
      count: generated.length,
      images: generated
    });
  } catch (err) {
    console.error('Generation controller error:', err.message);
    res.status(400).json({
      success: false,
      error: err.message || 'Image generation failed.',
      code: err.code || 'GENERATION_ERROR'
    });
  }
};

exports.getImage = (req, res) => {
  const filename = path.basename(req.params.filename);
  const inGenerated = path.resolve(generatedDir, filename);
  const inUploads = path.resolve(uploadsDir, filename);

  let targetPath = null;
  if (fs.existsSync(inGenerated)) {
    targetPath = inGenerated;
  } else if (fs.existsSync(inUploads)) {
    targetPath = inUploads;
  }

  if (!targetPath) {
    return res.status(404).json({
      success: false,
      error: `Image '${filename}' not found.`
    });
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeMap = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  };

  res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const stream = fs.createReadStream(targetPath);
  stream.pipe(res);
};

exports.downloadImage = async (req, res) => {
  const filename = path.basename(req.params.filename);
  const format = req.query.format ? req.query.format.toLowerCase() : null; // png, jpeg, webp

  const inGenerated = path.resolve(generatedDir, filename);
  const inUploads = path.resolve(uploadsDir, filename);

  let targetPath = null;
  if (fs.existsSync(inGenerated)) {
    targetPath = inGenerated;
  } else if (fs.existsSync(inUploads)) {
    targetPath = inUploads;
  }

  if (!targetPath) {
    return res.status(404).json({
      success: false,
      error: `Image '${filename}' not found for download.`
    });
  }

  if (format && ['jpeg', 'jpg', 'webp', 'png'].includes(format)) {
    try {
      const baseName = path.basename(filename, path.extname(filename));
      const targetExt = format === 'jpg' ? 'jpeg' : format;
      const downloadName = `${baseName}.${targetExt === 'jpeg' ? 'jpg' : targetExt}`;

      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.setHeader('Content-Type', `image/${targetExt}`);

      let transformer = sharp(targetPath);
      if (format === 'webp') transformer = transformer.webp({ quality: 95 });
      else if (format === 'jpeg' || format === 'jpg') transformer = transformer.jpeg({ quality: 95 });
      else transformer = transformer.png();

      return transformer.pipe(res);
    } catch (e) {
      console.warn('Format conversion failed, falling back to direct download:', e);
    }
  }

  res.download(targetPath, filename);
};

exports.downloadAllZip = async (req, res) => {
  try {
    const { filenames } = req.body || {};
    let targetFiles = [];

    if (filenames && Array.isArray(filenames) && filenames.length > 0) {
      targetFiles = filenames.map(f => path.basename(f));
    } else {
      const all = metadataService.readAll();
      targetFiles = all.map(item => item.filename);
    }

    if (targetFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'No images available to download.' });
    }

    const archive = new ZipArchive({ zlib: { level: 6 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="neurocanvas_images_${Date.now()}.zip"`);

    archive.pipe(res);

    for (const filename of targetFiles) {
      const filePath = path.resolve(generatedDir, filename);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: filename });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('ZIP download failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.upscaleImage = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const scale = parseInt(req.body.scale, 10) || 2;
    const result = await aiService.upscale(filename, scale);

    res.json({
      success: true,
      image: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createVariation = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const existing = metadataService.getByFilename(filename);

    const prompt = req.body.prompt || existing?.prompt || 'Variation of generated artwork';
    const referenceStrength = req.body.referenceStrength || 0.65;
    const targetEngine = req.body.engine || existing?.engine || 'comfyui';

    const result = await aiService.generateImages({
      prompt: prompt,
      referenceImage: filename,
      referenceStrength: referenceStrength,
      referenceMode: 'image-variation',
      resolution: existing ? `${existing.width}x${existing.height}` : '1024x1024',
      model: existing?.model || 'sd_xl_base_1.0.safetensors',
      engine: targetEngine,
      count: 1
    });

    res.json({
      success: true,
      image: result[0]
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
      code: err.code || 'VARIATION_FAILED'
    });
  }
};

exports.deleteImage = (req, res) => {
  const filename = path.basename(req.params.filename);
  const inGenerated = path.resolve(generatedDir, filename);
  const inUploads = path.resolve(uploadsDir, filename);

  let deleted = false;
  if (fs.existsSync(inGenerated)) {
    fs.unlinkSync(inGenerated);
    deleted = true;
  }
  if (fs.existsSync(inUploads)) {
    fs.unlinkSync(inUploads);
    deleted = true;
  }

  metadataService.deleteImage(filename);

  res.json({
    success: true,
    message: `Image '${filename}' removed.`
  });
};

exports.clearAllHistory = (req, res) => {
  metadataService.clearAll();
  res.json({
    success: true,
    message: 'Session gallery cleared.'
  });
};

exports.listImages = async (req, res) => {
  try {
    const { search, model, aspectRatio, sort } = req.query;
    const images = metadataService.getImages({ search, model, aspectRatio, sort });

    res.json({
      success: true,
      count: images.length,
      images
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
