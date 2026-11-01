const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const aiService = require('../services/aiService');
const videoJobService = require('../services/videoJobService');

describe('NeuroCanvas AI — ComfyUI Sole Engine Architecture Suite', () => {

  test('1. Ollama and legacy adapters are completely removed from filesystem and service', () => {
    const ollamaAdapterPath = path.resolve(__dirname, '../services/adapters/OllamaAdapter.js');
    const localNeuralAdapterPath = path.resolve(__dirname, '../services/adapters/LocalNeuralAdapter.js');
    const localVideoAdapterPath = path.resolve(__dirname, '../services/adapters/LocalVideoAdapter.js');

    assert.strictEqual(fs.existsSync(ollamaAdapterPath), false, 'OllamaAdapter.js must not exist');
    assert.strictEqual(fs.existsSync(localNeuralAdapterPath), false, 'LocalNeuralAdapter.js must not exist');
    assert.strictEqual(fs.existsSync(localVideoAdapterPath), false, 'LocalVideoAdapter.js must not exist');

    const registeredEngines = Object.keys(aiService.adapters);
    assert.deepStrictEqual(registeredEngines, ['comfyui'], 'aiService adapters must contain only comfyui');
    assert.strictEqual('ollama' in aiService.adapters, false, 'ollama must not be in adapters');
    assert.strictEqual('local-neural' in aiService.adapters, false, 'local-neural must not be in adapters');
    assert.strictEqual(aiService.defaultEngine, 'comfyui', 'Default image engine must be comfyui');
  });

  test('2. getEngines() returns only ComfyUI as the sole generation engine', async () => {
    const engines = await aiService.getEngines();
    assert.strictEqual(engines.length, 1, 'Must have exactly 1 engine registered');

    const comfyui = engines[0];
    assert.strictEqual(comfyui.id, 'comfyui');
    assert.strictEqual(comfyui.name, 'ComfyUI');
    assert.strictEqual(comfyui.isPrimary, true);
    assert.strictEqual(comfyui.isDefault, true);

    const hasOllama = engines.some(e => e.id === 'ollama' || e.name.toLowerCase().includes('ollama'));
    assert.strictEqual(hasOllama, false, 'Ollama must not appear in engine list');
  });

  test('3. Video studio uses ComfyUI as the sole video generation engine', async () => {
    const videoEngines = Object.keys(videoJobService.adapters);
    assert.deepStrictEqual(videoEngines, ['comfyui'], 'videoJobService adapters must contain only comfyui');
    assert.strictEqual(videoJobService.defaultEngine, 'comfyui', 'Default video engine must be comfyui');

    const health = await videoJobService.getHealth();
    assert.ok(health.engines.comfyui, 'ComfyUI must be the engine in video health');
    assert.strictEqual('local-video' in health.engines, false, 'local-video must not appear in video health');

    const models = await videoJobService.getModels();
    assert.ok(models.length > 0, 'Video models should be returned');
    assert.ok(models.every(m => m.engine === 'comfyui'), 'All video models must belong to comfyui engine');
  });

  test('4. Attempting generation with removed engines throws unrecognized engine error', async () => {
    assert.throws(
      () => aiService.getAdapter('ollama'),
      /not recognized/,
      'Requesting ollama adapter must throw an unrecognized engine error'
    );
    assert.throws(
      () => aiService.getAdapter('local-neural'),
      /not recognized/,
      'Requesting local-neural adapter must throw an unrecognized engine error'
    );

    let thrownError = null;
    try {
      await aiService.generateImages({
        prompt: 'a picturesque mountain scene',
        engine: 'ollama'
      });
    } catch (err) {
      thrownError = err;
    }
    assert.ok(thrownError, 'Generating with engine=ollama must throw an error');
    assert.match(thrownError.message, /not recognized/, 'Error must state engine adapter is not recognized');
  });

  test('5. ComfyUI supports reference-image conditioning (Image-to-Image)', () => {
    const comfy = aiService.getAdapter('comfyui');
    assert.strictEqual(comfy.supportsImageToImage(), true, 'ComfyUI must support Image-to-Image');
  });

  test('6. Prompt enhancement works without Ollama via heuristic prompt engineering', async () => {
    const basePrompt = 'a futuristic cyberpunk alley';
    const enhanced = await aiService.enhancePrompt(basePrompt);
    assert.ok(enhanced, 'Enhanced prompt should be returned');
    assert.ok(enhanced.startsWith(basePrompt), 'Enhanced prompt must contain the original prompt');
    assert.ok(enhanced.length > basePrompt.length, 'Enhanced prompt should expand the original prompt');
  });

  test('7. Calling ComfyUI status returns valid connectivity data', async () => {
    const status = await aiService.getComfyUIStatus();
    assert.ok(typeof status.available === 'boolean', 'Status must return boolean available');
    assert.strictEqual(status.host, 'http://127.0.0.1:8188');
  });

  test('8. getAllModels returns ComfyUI diffusion models', async () => {
    const models = await aiService.getAllModels();
    assert.ok(Array.isArray(models), 'Models must be an array');
    if (models.length > 0) {
      assert.ok(models.every(m => m.engine === 'comfyui'), 'All models must be ComfyUI models');
      assert.ok(models.every(m => m.supportsImageGeneration === true), 'Models must support image generation');
    }
  });
});
