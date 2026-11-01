const sharp = require('sharp');

/**
 * Image processing service using Sharp for high-fidelity resizing and upscaling.
 */
class ImageProcessingService {
  /**
   * 2x Super-Resolution Upscaling using Lanczos3 resampling and unsharp mask.
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {number} scale - Scaling factor (default: 2)
   * @returns {Promise<{buffer: Buffer, width: number, height: number, scale: number}>}
   */
  async upscaleImage(imageBuffer, scale = 2) {
    const meta = await sharp(imageBuffer).metadata();
    const newWidth = Math.min(3840, Math.round((meta.width || 1024) * scale));
    const newHeight = Math.min(3840, Math.round((meta.height || 1024) * scale));

    const upscaled = await sharp(imageBuffer)
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({
        sigma: 1.2,
        m1: 1.5,
        m2: 2.0
      })
      .png({ quality: 98 })
      .toBuffer();

    return {
      buffer: upscaled,
      width: newWidth,
      height: newHeight,
      scale
    };
  }
}

module.exports = new ImageProcessingService();

