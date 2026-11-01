require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

// Middlewares
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directories for direct access
app.use('/static/generated', express.static(path.resolve(__dirname, 'generated')));
app.use('/static/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/static/videos', express.static(path.resolve(__dirname, 'videos')));

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting / check
app.get('/', (req, res) => {
  res.json({
    name: 'NeuroCanvas AI Local Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      comfyuiStatus: '/api/comfyui/status',
      engines: '/api/engines',
      models: '/api/models',
      generate: 'POST /api/generate',
      uploadReference: 'POST /api/reference/upload',
      images: '/api/images'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err.message);
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start listener on 127.0.0.1:5000
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 AI Image Generation Backend running at http://${HOST}:${PORT}`);
  console.log(`📡 Connected to ComfyUI target: ${process.env.COMFYUI_HOST || 'http://127.0.0.1:8188'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shut down cleanly.');
  });
});

module.exports = app;

