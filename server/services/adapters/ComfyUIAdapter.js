const BaseAdapter = require('./BaseAdapter');
const fs = require('fs');
const path = require('path');

class ComfyUIAdapter extends BaseAdapter {
  constructor(baseUrl = process.env.COMFYUI_HOST || 'http://127.0.0.1:8188') {
    super('comfyui', 'ComfyUI', 'Primary local node-based diffusion engine');
    this.baseUrl = (baseUrl || '').replace(/\/$/, '');
  }

  async checkAvailability() {
    if (!this.baseUrl) {
      return {
        available: false,
        status: 'not_configured',
        error: 'ComfyUI host URL is not configured.'
      };
    }

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
          status: 'unavailable',
          host: this.baseUrl,
          error: `ComfyUI returned HTTP status ${res.status}`
        };
      }

      const data = await res.json();
      return {
        available: true,
        status: 'connected',
        host: this.baseUrl,
        devices: data.devices || [],
        vram: data.devices?.[0]?.vram_free || 'N/A'
      };
    } catch (err) {
      return {
        available: false,
        status: 'unavailable',
        host: this.baseUrl,
        error: `ComfyUI not detected at ${this.baseUrl}. Make sure ComfyUI is running with 'python main.py --listen 127.0.0.1 --port 8188'.`
      };
    }
  }

  async getModels() {
    const status = await this.checkAvailability();
    if (!status.available) {
      return [];
    }

    const models = [];

    // 1. Check all-in-one diffusion checkpoints (MODEL + CLIP + VAE) via CheckpointLoaderSimple
    try {
      const res = await fetch(`${this.baseUrl}/object_info/CheckpointLoaderSimple`);
      if (res.ok) {
        const info = await res.json();
        const ckpts = info?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [];
        for (const ckpt of ckpts) {
          models.push({
            id: ckpt,
            name: ckpt,
            engine: 'comfyui',
            supportsImageGeneration: true,
            supportsImageToImage: true,
            type: 'checkpoint',
            notes: 'Installed ComfyUI Checkpoint'
          });
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Also check UNET / Diffusion Models via UNETLoader
    try {
      const res = await fetch(`${this.baseUrl}/object_info/UNETLoader`);
      if (res.ok) {
        const info = await res.json();
        const unets = info?.UNETLoader?.input?.required?.unet_name?.[0] || [];
        for (const unet of unets) {
          if (!models.some(m => m.id === unet)) {
            models.push({
              id: unet,
              name: unet,
              engine: 'comfyui',
              supportsImageGeneration: true,
              supportsImageToImage: true,
              type: 'diffusion_model',
              notes: 'Installed ComfyUI Diffusion Model'
            });
          }
        }
      }
    } catch (e) {
      // ignore
    }

    if (models.length > 0) {
      return models;
    }

    return [
      {
        id: 'sd_xl_base_1.0.safetensors',
        name: 'SDXL Base (Awaiting .safetensors in models/checkpoints/)',
        engine: 'comfyui',
        supportsImageGeneration: true,
        supportsImageToImage: true,
        type: 'checkpoint',
        notes: 'No checkpoint found in /Users/oswaldo/ComfyUI-Shared/models/checkpoints/. Place an SDXL or SD1.5 model there.'
      }
    ];
  }

  supportsImageToImage() {
    return true;
  }

  async enhancePrompt(rawPrompt) {
    if (!rawPrompt || typeof rawPrompt !== 'string') return '';
    const lightingEnhancers = ['cinematic golden hour lighting', 'subtle volumetric fog', 'studio softbox rim light', 'hyper-detailed 8k resolution'];
    const qualityEnhancers = ['award-winning composition', 'masterpiece', 'natural textures', 'depth of field'];
    const chosenLight = lightingEnhancers[Math.floor(Math.random() * lightingEnhancers.length)];
    const chosenQuality = qualityEnhancers[Math.floor(Math.random() * qualityEnhancers.length)];
    return `${rawPrompt.trim()}, ${chosenLight}, ${chosenQuality}, shot on 35mm lens, photorealistic fidelity`;
  }

  /**
   * Determine the model type ('checkpoint' or 'diffusion_model') by consulting
   * the model registry. Falls back to 'checkpoint' when ComfyUI is unreachable.
   */
  async _resolveModelType(modelId) {
    try {
      const models = await this.getModels();
      const found = models.find(m => m.id === modelId);
      return found?.type || 'checkpoint';
    } catch {
      return 'checkpoint';
    }
  }

  /**
   * Build a CheckpointLoaderSimple workflow (for .safetensors checkpoints that
   * bundle model + CLIP + VAE, e.g. SDXL, SD 1.5).
   */
  _buildCheckpointWorkflow({ model, prompt, negativePrompt, width, height, referenceImagePath }) {
    const wf = {
      "3": {
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000000),
          "steps": 20,
          "cfg": 7,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": referenceImagePath ? 0.65 : 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": referenceImagePath ? ["12", 0] : ["5", 0]
        },
        "class_type": "KSampler"
      },
      "4": {
        "inputs": { "ckpt_name": model || "sd_xl_base_1.0.safetensors" },
        "class_type": "CheckpointLoaderSimple"
      },
      "5": {
        "inputs": { "width": width, "height": height, "batch_size": 1 },
        "class_type": "EmptyLatentImage"
      },
      "6": {
        "inputs": { "text": prompt, "clip": ["4", 1] },
        "class_type": "CLIPTextEncode"
      },
      "7": {
        "inputs": {
          "text": negativePrompt || "low quality, blurry, distorted, watermark",
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "8": {
        "inputs": { "samples": ["3", 0], "vae": ["4", 2] },
        "class_type": "VAEDecode"
      },
      "9": {
        "inputs": { "filename_prefix": "NeuroStudio", "images": ["8", 0] },
        "class_type": "SaveImage"
      }
    };
    return wf;
  }

  /**
   * Build a UNETLoader workflow for standalone diffusion models that ship
   * without a bundled CLIP/VAE (e.g. Z-Image Turbo bf16, Flux, HunyuanDiT).
   * Uses ModelSamplingAuraFlow + CLIPLoader(lumina2) — matches the installed
   * z_image_turbo_bf16.safetensors architecture.
   */
  _buildDiffusionWorkflow({ model, prompt, negativePrompt, width, height }) {
    return {
      "1": {
        "class_type": "UNETLoader",
        "inputs": {
          "unet_name": model || "z_image_turbo_bf16.safetensors",
          "weight_dtype": "default"
        }
      },
      "2": {
        "class_type": "ModelSamplingAuraFlow",
        "inputs": {
          "model": ["1", 0],
          "shift": 3.0
        }
      },
      "3": {
        "class_type": "CLIPLoader",
        "inputs": {
          "clip_name": "qwen_3_4b.safetensors",
          "type": "lumina2"
        }
      },
      "4": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "clip": ["3", 0],
          "text": prompt
        }
      },
      "5": {
        "class_type": "ConditioningZeroOut",
        "inputs": {
          "conditioning": ["4", 0]
        }
      },
      "6": {
        "class_type": "EmptySD3LatentImage",
        "inputs": {
          "width": width,
          "height": height,
          "batch_size": 1
        }
      },
      "7": {
        "class_type": "KSampler",
        "inputs": {
          "model": ["2", 0],
          "positive": ["4", 0],
          "negative": ["5", 0],
          "latent_image": ["6", 0],
          "seed": Math.floor(Math.random() * 1000000000),
          "steps": 8,
          "cfg": 1.0,
          "sampler_name": "res_multistep",
          "scheduler": "simple",
          "denoise": 1.0
        }
      },
      "8": {
        "class_type": "VAELoader",
        "inputs": {
          "vae_name": "ae.safetensors"
        }
      },
      "9": {
        "class_type": "VAEDecode",
        "inputs": {
          "samples": ["7", 0],
          "vae": ["8", 0]
        }
      },
      "10": {
        "class_type": "SaveImage",
        "inputs": {
          "images": ["9", 0],
          "filename_prefix": "NeuroStudio"
        }
      }
    };
  }

  async generate(options) {
    const status = await this.checkAvailability();
    if (!status.available) {
      throw new Error(
        `ComfyUI is currently unavailable at ${this.baseUrl}. ` +
        `Please start your local ComfyUI server with 'python main.py --listen 127.0.0.1 --port 8188' to generate images.`
      );
    }

    const { prompt, referenceImagePath, width, height, model, negativePrompt } = options;

    // Determine model type to select the correct workflow
    const modelType = await this._resolveModelType(model);
    const isDiffusionModel = modelType === 'diffusion_model';

    let uploadedImageName = null;

    if (referenceImagePath && fs.existsSync(referenceImagePath) && !isDiffusionModel) {
      // Reference image conditioning only supported in checkpoint workflow for now
      const blob = new Blob([fs.readFileSync(referenceImagePath)]);
      const formData = new globalThis.FormData();
      formData.append('image', blob, path.basename(referenceImagePath));
      formData.append('overwrite', 'true');

      const uploadRes = await fetch(`${this.baseUrl}/upload/image`, {
        method: 'POST',
        body: formData
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        uploadedImageName = uploadData.name;
      }
    }

    // Select and build the appropriate workflow
    let promptNodes;
    let saveNodeId;

    if (isDiffusionModel) {
      promptNodes = this._buildDiffusionWorkflow({ model, prompt, negativePrompt, width, height });
      saveNodeId = "10";
    } else {
      promptNodes = this._buildCheckpointWorkflow({ model, prompt, negativePrompt, width, height, referenceImagePath: uploadedImageName ? referenceImagePath : null });
      saveNodeId = "9";
    }

    // Add image-to-image nodes for checkpoint workflows with a reference image
    if (!isDiffusionModel && uploadedImageName) {
      promptNodes["11"] = {
        "inputs": { "image": uploadedImageName },
        "class_type": "LoadImage"
      };
      promptNodes["12"] = {
        "inputs": { "pixels": ["11", 0], "vae": ["4", 2] },
        "class_type": "VAEEncode"
      };
    }

    const workflow = { prompt: promptNodes };

    const startTime = Date.now();
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
    const promptIdFromComfy = queueData.prompt_id;

    // Poll for completion (90s max; diffusion models can be slower on first load)
    let attempts = 0;
    while (attempts < 90) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;

      const historyRes = await fetch(`${this.baseUrl}/history/${promptIdFromComfy}`);
      if (historyRes.ok) {
        const hist = await historyRes.json();
        if (hist[promptIdFromComfy] && hist[promptIdFromComfy].outputs) {
          const outputs = hist[promptIdFromComfy].outputs;
          // saveNodeId is "9" for checkpoint workflows, "11" for diffusion model workflows
          const saveNode = outputs[saveNodeId];
          if (saveNode && saveNode.images && saveNode.images.length > 0) {
            const imgInfo = saveNode.images[0];
            const viewRes = await fetch(`${this.baseUrl}/view?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder || '')}&type=${encodeURIComponent(imgInfo.type || 'output')}`);
            if (viewRes.ok) {
              const arrayBuffer = await viewRes.arrayBuffer();
              return {
                buffer: Buffer.from(arrayBuffer),
                format: 'png',
                durationMs: Date.now() - startTime
              };
            }
          }
        }
      }
    }

    throw new Error('ComfyUI generation timed out waiting for output.');
  }
}

module.exports = ComfyUIAdapter;
