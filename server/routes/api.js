const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middleware/uploadMiddleware');

// Health and System Diagnostics
router.get('/health', imageController.health);
router.get('/comfyui/status', imageController.getComfyUIStatus);

// ComfyUI Engine & Model Endpoints
router.get('/engines', imageController.getEngines);
router.get('/models', imageController.getAllModels);

// Prompt Enhancement
router.post('/prompt/enhance', imageController.enhancePrompt);

// Image Generation & Reference Endpoints
router.post('/generate', imageController.generate);
router.post('/reference/upload', upload.single('image'), imageController.uploadReference);

// Batch Download as ZIP
router.post('/images/download-all', imageController.downloadAllZip);

// Image Retrieval, Download and Gallery Management
router.get('/images', imageController.listImages);
router.delete('/images', imageController.clearAllHistory);
router.get('/images/:filename', imageController.getImage);
router.get('/download/:filename', imageController.downloadImage);
router.delete('/images/:filename', imageController.deleteImage);

// Image Editing Operations
router.post('/images/:filename/upscale', imageController.upscaleImage);
router.post('/images/:filename/variation', imageController.createVariation);

// AI Video Studio Sub-Router
const videoRoutes = require('./video');
router.use('/video', videoRoutes);

module.exports = router;
