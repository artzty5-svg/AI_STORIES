const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const upload = require('../middleware/uploadMiddleware');

// Video Engine Health & Models
router.get('/health', videoController.health);
router.get('/models', videoController.getModels);

// Frame Uploads (Start Frame & End Frame)
router.post('/upload', upload.single('image'), videoController.uploadFrame);

// Job Lifecycle Endpoints
router.post('/generate', videoController.generate);
router.get('/jobs', videoController.listJobs);
router.get('/jobs/:jobId', videoController.getJobStatus);
router.post('/jobs/:jobId/cancel', videoController.cancelJob);
router.delete('/jobs/:jobId', videoController.deleteJob);
router.get('/jobs/:jobId/download', videoController.downloadVideo);

// Video Streaming Endpoint
router.get('/stream/:filename', videoController.streamVideo);

module.exports = router;

