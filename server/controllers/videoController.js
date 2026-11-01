const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const videoJobService = require('../services/videoJobService');

const videosDir = path.resolve(__dirname, '../videos');
const uploadsDir = path.resolve(__dirname, '../uploads');

exports.health = async (req, res) => {
  try {
    const health = await videoJobService.getHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
};

exports.getModels = async (req, res) => {
  try {
    const models = await videoJobService.getModels();
    res.json({
      success: true,
      count: models.length,
      models
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.uploadFrame = async (req, res) => {
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
      error: `Frame upload failed: ${err.message}`
    });
  }
};

exports.generate = async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt,
      startFrame,
      endFrame,
      model,
      engine,
      duration,
      resolution,
      aspectRatio,
      fps,
      seed,
      steps,
      guidanceScale
    } = req.body;

    const job = await videoJobService.createJob({
      prompt,
      negativePrompt,
      startFrame,
      endFrame,
      model,
      engine,
      duration,
      resolution,
      aspectRatio,
      fps,
      seed,
      steps,
      guidanceScale
    });

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: job.status,
      job
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create video generation job.'
    });
  }
};

exports.getJobStatus = (req, res) => {
  const { jobId } = req.params;
  const job = videoJobService.getJob(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: `Video job '${jobId}' not found.`
    });
  }

  res.json({
    success: true,
    job
  });
};

exports.cancelJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await videoJobService.cancelJob(jobId);
    res.json({
      success: true,
      message: 'Job cancelled.',
      job
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.listJobs = (req, res) => {
  try {
    const jobs = videoJobService.readAllJobs();
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    await videoJobService.deleteJob(jobId);
    res.json({
      success: true,
      message: `Video job '${jobId}' deleted.`
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.downloadVideo = (req, res) => {
  const { jobId } = req.params;
  const job = videoJobService.getJob(jobId);

  if (!job || !job.outputFilename) {
    return res.status(404).json({
      success: false,
      error: `Video for job '${jobId}' not found.`
    });
  }

  const videoPath = path.resolve(videosDir, job.outputFilename);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({
      success: false,
      error: `Video file '${job.outputFilename}' does not exist on disk.`
    });
  }

  res.download(videoPath, job.outputFilename);
};

/**
 * Streams video with HTTP 206 Partial Content (range requests) for native seekable playback
 */
exports.streamVideo = (req, res) => {
  const filename = path.basename(req.params.filename);
  const targetPath = path.resolve(videosDir, filename);

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({
      success: false,
      error: `Video file '${filename}' not found.`
    });
  }

  const stat = fs.statSync(targetPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.webm' ? 'video/webm' : 'video/mp4';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(targetPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(targetPath).pipe(res);
  }
};

