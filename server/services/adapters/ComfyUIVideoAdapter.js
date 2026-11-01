const fs = require('fs');
const path = require('path');

class ComfyUIVideoAdapter {
  constructor(baseUrl = process.env.COMFYUI_HOST || 'http://127.0.0.1:8188') {
    this.id = 'comfyui';
    this.name = 'ComfyUI Video Studio';
    this.description = 'Local ComfyUI node-based First-Last Frame video workflow (Wan2.1 / LTX-Video / SparseCtrl).';
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async checkAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${this.baseUrl}/system_stats`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          available: false,
          error: `ComfyUI returned HTTP status ${res.status}`
        };
      }

      const data = await res.json();
      return {
        available: true,
        host: this.baseUrl,
        devices: data.devices || [],
        vram: data.devices?.[0]?.vram_free || 'N/A',
        supportsStartEndFrames: true
      };
    } catch (err) {
      return {
        available: false,
        error: `ComfyUI not detected at ${this.baseUrl}. To activate, launch ComfyUI on port 8188.`
      };
    }
  }

  async getModels() {
    const status = await this.checkAvailability();
    if (!status.available) {
      return [
        {
          id: 'wan2.1-i2v-flf',
          name: 'Wan2.1 FLF Video (Not Connected)',
          engine: 'comfyui',
          supportsStartEndFrames: true,
          supportsTextPrompt: true,
          supportedDurations: [3, 5, 8],
          supportedResolutions: ['480p', '720p'],
          supportedAspectRatios: ['16:9', '9:16'],
          notes: 'First-Last Frame video synthesis with Wan2.1. Requires ComfyUI running at port 8188.'
        },
        {
          id: 'ltx-video-flf',
          name: 'LTX-Video Latent Interpolation (Not Connected)',
          engine: 'comfyui',
          supportsStartEndFrames: true,
          supportsTextPrompt: true,
          supportedDurations: [2, 4, 5],
          supportedResolutions: ['720p', '1080p'],
          supportedAspectRatios: ['16:9', '9:16'],
          notes: 'Lightricks LTX-Video frame interpolation. Requires ComfyUI running at port 8188.'
        }
      ];
    }

    const videoModels = [];

    // Query ComfyUI CheckpointLoaderSimple
    try {
      const res = await fetch(`${this.baseUrl}/object_info/CheckpointLoaderSimple`);
      if (res.ok) {
        const info = await res.json();
        const ckpts = info?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [];
        const filtered = ckpts.filter(c => {
          const l = c.toLowerCase();
          return l.includes('wan') || l.includes('ltx') || l.includes('video') || l.includes('svd') || l.includes('minimax') || l.includes('fl2v');
        });
        for (const c of filtered) {
          videoModels.push({
            id: c,
            name: `${c} (ComfyUI)`,
            engine: 'comfyui',
            supportsStartEndFrames: true,
            supportsTextPrompt: true,
            supportedDurations: [3, 5, 8],
            supportedResolutions: ['480p', '720p', '1080p'],
            supportedAspectRatios: ['16:9', '9:16', '1:1'],
            notes: 'Installed ComfyUI video checkpoint'
          });
        }
      }
    } catch (e) {
      // ignore
    }

    // Query ComfyUI UNETLoader
    try {
      const res = await fetch(`${this.baseUrl}/object_info/UNETLoader`);
      if (res.ok) {
        const info = await res.json();
        const unets = info?.UNETLoader?.input?.required?.unet_name?.[0] || [];
        const filtered = unets.filter(c => {
          const l = c.toLowerCase();
          return l.includes('wan') || l.includes('ltx') || l.includes('video') || l.includes('svd') || l.includes('minimax') || l.includes('fl2v');
        });
        for (const c of filtered) {
          if (!videoModels.some(m => m.id === c)) {
            videoModels.push({
              id: c,
              name: `${c} (ComfyUI)`,
              engine: 'comfyui',
              supportsStartEndFrames: true,
              supportsTextPrompt: true,
              supportedDurations: [3, 5, 8],
              supportedResolutions: ['480p', '720p', '1080p'],
              supportedAspectRatios: ['16:9', '9:16', '1:1'],
              notes: 'Installed ComfyUI video diffusion model'
            });
          }
        }
      }
    } catch (e) {
      // ignore
    }

    if (videoModels.length > 0) {
      return videoModels;
    }

    return [
      {
        id: 'wan2.1-i2v-flf',
        name: 'Wan2.1 FLF Video (ComfyUI)',
        engine: 'comfyui',
        supportsStartEndFrames: true,
        supportsTextPrompt: true,
        supportedDurations: [3, 5, 8],
        supportedResolutions: ['480p', '720p'],
        supportedAspectRatios: ['16:9', '9:16'],
        notes: 'ComfyUI First-Last Frame video workflow'
      }
    ];
  }

  /**
   * Upload image to ComfyUI /upload/image
   */
  async uploadImageToComfy(filePath) {
    const blob = new Blob([fs.readFileSync(filePath)]);
    const formData = new globalThis.FormData();
    formData.append('image', blob, path.basename(filePath));
    formData.append('overwrite', 'true');

    const res = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ComfyUI image upload failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data.name;
  }

  /**
   * Submits First-Last Frame video generation workflow to ComfyUI
   */
  async generateVideo(options, onProgress) {
    const status = await this.checkAvailability();
    if (!status.available) {
      throw new Error(
        `ComfyUI is currently unavailable at ${this.baseUrl}. ` +
        `Please start ComfyUI on port 8188 with 'python main.py --listen 127.0.0.1 --port 8188'.`
      );
    }

    const {
      startFramePath,
      endFramePath,
      prompt,
      negativePrompt = 'blurry, flickering, low quality, distortion',
      duration = 4,
      width = 1280,
      height = 720,
      fps = 24,
      model,
      seed = Math.floor(Math.random() * 2147483647),
      outputFilename,
      tempDir
    } = options;

    if (onProgress) onProgress({ phase: 'uploading_references', message: 'Uploading start and end frames to ComfyUI...' });

    const startImageName = await this.uploadImageToComfy(startFramePath);
    const endImageName = await this.uploadImageToComfy(endFramePath);

    const frameCount = Math.round(duration * fps);

    // Build ComfyUI First-Last-Frame video generation workflow template
    const workflow = {
      prompt: {
        "1": {
          "inputs": {
            "image": startImageName,
            "upload": "image"
          },
          "class_type": "LoadImage"
        },
        "2": {
          "inputs": {
            "image": endImageName,
            "upload": "image"
          },
          "class_type": "LoadImage"
        },
        "3": {
          "inputs": {
            "text": prompt,
            "clip": ["6", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "4": {
          "inputs": {
            "text": negativePrompt,
            "clip": ["6", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "5": {
          "inputs": {
            "width": width,
            "height": height,
            "length": frameCount,
            "batch_size": 1
          },
          "class_type": "EmptyLatentVideo"
        },
        "6": {
          "inputs": {
            "ckpt_name": model && model.includes('.safetensors') ? model : "wan2.1_i2v_480p_14B_fp8.safetensors"
          },
          "class_type": "CheckpointLoaderSimple"
        },
        "7": {
          "inputs": {
            "seed": seed,
            "steps": 25,
            "cfg": 6,
            "sampler_name": "euler",
            "scheduler": "normal",
            "denoise": 1,
            "model": ["6", 0],
            "positive": ["3", 0],
            "negative": ["4", 0],
            "latent_image": ["5", 0]
          },
          "class_type": "KSampler"
        },
        "8": {
          "inputs": {
            "samples": ["7", 0],
            "vae": ["6", 2]
          },
          "class_type": "VAEDecode"
        },
        "9": {
          "inputs": {
            "filename_prefix": "NeuroCanvas_Video",
            "fps": fps,
            "images": ["8", 0]
          },
          "class_type": "SaveAnimatedWEBP"
        }
      }
    };

    if (onProgress) onProgress({ phase: 'generating', message: 'Submitting video workflow to ComfyUI queue...' });

    const queueRes = await fetch(`${this.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });

    if (!queueRes.ok) {
      const err = await queueRes.text();
      throw new Error(`ComfyUI queue error (${queueRes.status}): ${err}`);
    }

    const queueData = await queueRes.json();
    const promptId = queueData.prompt_id;

    // Poll ComfyUI /history/:promptId
    let attempts = 0;
    const maxAttempts = 120; // up to 4 minutes for video generation
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;

      if (onProgress) {
        onProgress({
          phase: 'generating',
          message: `Rendering video frames in ComfyUI (Step ${attempts} of ${maxAttempts})...`
        });
      }

      const histRes = await fetch(`${this.baseUrl}/history/${promptId}`);
      if (histRes.ok) {
        const hist = await histRes.json();
        if (hist[promptId] && hist[promptId].outputs) {
          const outputs = hist[promptId].outputs;
          // Look for output node (node 9 or any save node)
          for (const nodeId of Object.keys(outputs)) {
            const nodeOut = outputs[nodeId];
            const items = nodeOut.images || nodeOut.gifs || nodeOut.videos || [];
            if (items.length > 0) {
              const videoItem = items[0];
              const viewUrl = `${this.baseUrl}/view?filename=${encodeURIComponent(videoItem.filename)}&subfolder=${encodeURIComponent(videoItem.subfolder || '')}&type=${encodeURIComponent(videoItem.type || 'output')}`;
              
              const videoStreamRes = await fetch(viewUrl);
              if (videoStreamRes.ok) {
                const arrayBuffer = await videoStreamRes.arrayBuffer();
                const outputPath = path.resolve(tempDir, outputFilename);
                fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));

                return {
                  outputPath,
                  filename: outputFilename,
                  duration,
                  width,
                  height,
                  fps,
                  format: path.extname(videoItem.filename).replace('.', '') || 'mp4'
                };
              }
            }
          }
        }
      }
    }

    throw new Error('ComfyUI video generation timed out after 4 minutes.');
  }
}

module.exports = ComfyUIVideoAdapter;

