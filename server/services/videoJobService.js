const fs = require('fs');
const path = require('path');
const ComfyUIVideoAdapter = require('./adapters/ComfyUIVideoAdapter');

const dataDir = path.resolve(__dirname, '../data');
const jobsFile = path.resolve(dataDir, 'video-jobs.json');
const videosDir = path.resolve(__dirname, '../videos');
const uploadsDir = path.resolve(__dirname, '../uploads');

class VideoJobService {
  constructor() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    if (!fs.existsSync(jobsFile)) {
      fs.writeFileSync(jobsFile, JSON.stringify([], null, 2), 'utf8');
    }

    this.adapters = {
      'comfyui': new ComfyUIVideoAdapter()
    };
    this.defaultEngine = 'comfyui';

    this.isProcessing = false;
    this.activeJobId = null;
    this.activeAbortController = null;
  }

  readAllJobs() {
    try {
      if (!fs.existsSync(jobsFile)) return [];
      const content = fs.readFileSync(jobsFile, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error('Error reading video jobs metadata:', err.message);
      return [];
    }
  }

  saveAllJobs(jobs) {
    try {
      fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing video jobs metadata:', err.message);
    }
  }

  getJob(jobId) {
    const jobs = this.readAllJobs();
    return jobs.find(j => j.id === jobId);
  }

  updateJob(jobId, updates) {
    const jobs = this.readAllJobs();
    const idx = jobs.findIndex(j => j.id === jobId);
    if (idx !== -1) {
      jobs[idx] = { ...jobs[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveAllJobs(jobs);
      return jobs[idx];
    }
    return null;
  }

  async getHealth() {
    const comfyStatus = await this.adapters['comfyui'].checkAvailability();
    return {
      status: 'online',
      activeJobId: this.activeJobId,
      isProcessing: this.isProcessing,
      engines: {
        'comfyui': comfyStatus
      }
    };
  }

  async getModels() {
    const models = [];
    for (const adapter of Object.values(this.adapters)) {
      try {
        const adapterModels = await adapter.getModels();
        models.push(...adapterModels);
      } catch (e) {
        // ignore
      }
    }
    return models;
  }

  /**
   * Enqueues a new video generation job
   */
  async createJob(payload) {
    const {
      prompt,
      negativePrompt = '',
      startFrame,
      endFrame,
      model = 'wan2.1-i2v-flf',
      engine = 'comfyui',
      duration = 4,
      resolution = '720p',
      aspectRatio = '16:9',
      fps = 24,
      seed = Math.floor(Math.random() * 2147483647),
      steps = 25,
      guidanceScale = 7.5
    } = payload;

    // Validation
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('A descriptive motion prompt is required for video generation.');
    }
    if (!startFrame) {
      throw new Error('Start frame image reference is required.');
    }
    if (!endFrame) {
      throw new Error('End frame image reference is required.');
    }

    const startPath = path.resolve(uploadsDir, path.basename(startFrame));
    const endPath = path.resolve(uploadsDir, path.basename(endFrame));

    if (!fs.existsSync(startPath)) {
      throw new Error(`Start frame '${startFrame}' not found in uploads directory.`);
    }
    if (!fs.existsSync(endPath)) {
      throw new Error(`End frame '${endFrame}' not found in uploads directory.`);
    }

    // Determine dimensions from resolution & aspect ratio
    let width = 1280;
    let height = 720;

    if (resolution === '1080p') {
      if (aspectRatio === '9:16') { width = 1080; height = 1920; }
      else if (aspectRatio === '1:1') { width = 1080; height = 1080; }
      else if (aspectRatio === '4:3') { width = 1440; height = 1080; }
      else { width = 1920; height = 1080; }
    } else if (resolution === '480p') {
      if (aspectRatio === '9:16') { width = 480; height = 854; }
      else if (aspectRatio === '1:1') { width = 480; height = 480; }
      else { width = 854; height = 480; }
    } else {
      // 720p Default
      if (aspectRatio === '9:16') { width = 720; height = 1280; }
      else if (aspectRatio === '1:1') { width = 720; height = 720; }
      else if (aspectRatio === '4:3') { width = 960; height = 720; }
      else { width = 1280; height = 720; }
    }

    const timestamp = Date.now();
    const jobId = `vjob_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

    const cleanSlug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32) || 'video';

    const outputFilename = `neurocanvas_${cleanSlug}_${width}x${height}_${timestamp}.mp4`;

    const job = {
      id: jobId,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim(),
      startFrame: path.basename(startFrame),
      endFrame: path.basename(endFrame),
      model,
      engine,
      duration: parseInt(duration, 10) || 4,
      resolution,
      aspectRatio,
      width,
      height,
      fps: parseInt(fps, 10) || 24,
      seed: parseInt(seed, 10) || Math.floor(Math.random() * 2147483647),
      steps,
      guidanceScale,
      status: 'queued', // queued -> preparing -> generating -> processing_output -> completed / failed / cancelled
      progressPhase: 'queued',
      progressMessage: 'Job is queued in background scheduler...',
      outputFilename,
      outputUrl: null,
      posterUrl: null,
      videoMetadata: null,
      error: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    const jobs = this.readAllJobs();
    jobs.unshift(job);
    this.saveAllJobs(jobs);

    // Trigger process loop asynchronously
    setImmediate(() => this.processNextInQueue());

    return job;
  }

  /**
   * Process next queued job sequentially (1 active job to respect 16GB memory)
   */
  async processNextInQueue() {
    if (this.isProcessing) return;

    const jobs = this.readAllJobs();
    const nextJob = jobs.find(j => j.status === 'queued');
    if (!nextJob) return;

    this.isProcessing = true;
    this.activeJobId = nextJob.id;

    try {
      this.updateJob(nextJob.id, {
        status: 'preparing',
        progressPhase: 'preparing',
        progressMessage: 'Initializing video model and normalizing reference frames...'
      });

      const adapter = this.adapters[nextJob.engine] || this.adapters['comfyui'];
      const startPath = path.resolve(uploadsDir, nextJob.startFrame);
      const endPath = path.resolve(uploadsDir, nextJob.endFrame);

      const result = await adapter.generateVideo({
        startFramePath: startPath,
        endFramePath: endPath,
        prompt: nextJob.prompt,
        negativePrompt: nextJob.negativePrompt,
        duration: nextJob.duration,
        width: nextJob.width,
        height: nextJob.height,
        fps: nextJob.fps,
        model: nextJob.model,
        seed: nextJob.seed,
        outputFilename: nextJob.outputFilename,
        tempDir: videosDir
      }, (prog) => {
        // Progress hook
        this.updateJob(nextJob.id, {
          status: prog.phase || 'generating',
          progressPhase: prog.phase || 'generating',
          progressMessage: prog.message || 'Generating video frames...'
        });
      });

      // Generation successful
      this.updateJob(nextJob.id, {
        status: 'completed',
        progressPhase: 'completed',
        progressMessage: 'Video generated successfully.',
        outputUrl: `/api/video/stream/${encodeURIComponent(nextJob.outputFilename)}`,
        posterUrl: result.posterFilename ? `/api/video/stream/${encodeURIComponent(result.posterFilename)}` : null,
        videoMetadata: {
          width: result.width,
          height: result.height,
          duration: result.duration,
          fps: result.fps,
          size: result.size,
          format: result.format
        },
        completedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(`Video job ${nextJob.id} failed:`, err.message);
      this.updateJob(nextJob.id, {
        status: 'failed',
        progressPhase: 'failed',
        progressMessage: 'Generation failed',
        error: err.message || 'Video generation failed.',
        completedAt: new Date().toISOString()
      });
    } finally {
      this.isProcessing = false;
      this.activeJobId = null;

      // Check for more queued jobs
      setImmediate(() => this.processNextInQueue());
    }
  }

  /**
   * Cancels a queued or active job
   */
  async cancelJob(jobId) {
    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job '${jobId}' not found.`);

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    if (this.activeJobId === jobId && this.activeAbortController) {
      this.activeAbortController.abort();
    }

    const updated = this.updateJob(jobId, {
      status: 'cancelled',
      progressPhase: 'cancelled',
      progressMessage: 'Job was cancelled by user.',
      completedAt: new Date().toISOString()
    });

    if (this.activeJobId === jobId) {
      this.isProcessing = false;
      this.activeJobId = null;
      setImmediate(() => this.processNextInQueue());
    }

    return updated;
  }

  /**
   * Deletes a job and its associated video output
   */
  async deleteJob(jobId) {
    const job = this.getJob(jobId);
    if (!job) throw new Error(`Job '${jobId}' not found.`);

    if (job.outputFilename) {
      const vidPath = path.resolve(videosDir, job.outputFilename);
      if (fs.existsSync(vidPath)) {
        try { fs.unlinkSync(vidPath); } catch (e) { /* ignore */ }
      }
    }

    const jobs = this.readAllJobs();
    const filtered = jobs.filter(j => j.id !== jobId);
    this.saveAllJobs(filtered);
    return true;
  }
}

module.exports = new VideoJobService();

