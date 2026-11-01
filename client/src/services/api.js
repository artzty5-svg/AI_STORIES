const API_BASE = '/api';

// Health & System
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function getComfyUIStatus() {
  const res = await fetch(`${API_BASE}/comfyui/status`);
  return res.json();
}

export async function getEngines() {
  const res = await fetch(`${API_BASE}/engines`);
  return res.json();
}

export async function getAllModels() {
  const res = await fetch(`${API_BASE}/models`);
  return res.json();
}

export async function enhancePrompt(prompt) {
  const res = await fetch(`${API_BASE}/prompt/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Prompt enhancement failed');
  }
  return data.enhancedPrompt;
}

// Image Studio Endpoints
export async function uploadReference(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/reference/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload reference image');
  }
  return data;
}

export async function generateImage(payload, signal) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const error = new Error(data.error || 'Image generation failed');
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function upscaleImage(filename, scale = 2) {
  const res = await fetch(`${API_BASE}/images/${encodeURIComponent(filename)}/upscale`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scale })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Upscaling failed');
  }
  return data.image;
}

export async function createVariation(filename, prompt, referenceStrength = 0.65) {
  const res = await fetch(`${API_BASE}/images/${encodeURIComponent(filename)}/variation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, referenceStrength })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Variation creation failed');
  }
  return data.image;
}

export async function deleteImage(filename) {
  const res = await fetch(`${API_BASE}/images/${encodeURIComponent(filename)}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/images`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function listImages(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/images${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  return res.json();
}

export async function downloadAllZip(filenames = []) {
  const res = await fetch(`${API_BASE}/images/download-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filenames })
  });

  if (!res.ok) throw new Error('ZIP download failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neurocanvas_export_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function triggerDownload(url, filename, format = null) {
  const downloadUrl = format ? `${url}?format=${format}` : url;
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==========================================
// AI Video Studio API Endpoints
// ==========================================

export async function getVideoHealth() {
  const res = await fetch(`${API_BASE}/video/health`);
  return res.json();
}

export async function getVideoModels() {
  const res = await fetch(`${API_BASE}/video/models`);
  return res.json();
}

export async function uploadVideoFrame(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/video/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload video frame');
  }
  return data;
}

export async function createVideoJob(payload) {
  const res = await fetch(`${API_BASE}/video/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to submit video generation job');
  }
  return data;
}

export async function getVideoJobStatus(jobId) {
  const res = await fetch(`${API_BASE}/video/jobs/${encodeURIComponent(jobId)}`);
  return res.json();
}

export async function cancelVideoJob(jobId) {
  const res = await fetch(`${API_BASE}/video/jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: 'POST'
  });
  return res.json();
}

export async function listVideoJobs() {
  const res = await fetch(`${API_BASE}/video/jobs`);
  return res.json();
}

export async function deleteVideoJob(jobId) {
  const res = await fetch(`${API_BASE}/video/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE'
  });
  return res.json();
}
