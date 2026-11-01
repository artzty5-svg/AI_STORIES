export const RESOLUTION_GROUPS = [
  {
    category: 'Square',
    presets: [
      { id: 'sq-512', width: 512, height: 512, label: '512 × 512', aspect: '1:1', tag: 'Standard' },
      { id: 'sq-768', width: 768, height: 768, label: '768 × 768', aspect: '1:1', tag: 'Balanced' },
      { id: 'sq-1024', width: 1024, height: 1024, label: '1024 × 1024', aspect: '1:1', tag: 'Pro 1:1' },
      { id: 'sq-1536', width: 1536, height: 1536, label: '1536 × 1536', aspect: '1:1', tag: 'Ultra HD' },
    ]
  },
  {
    category: 'Landscape',
    presets: [
      { id: 'ls-4-3', width: 1024, height: 768, label: '1024 × 768', aspect: '4:3', tag: 'Standard 4:3' },
      { id: 'ls-3-2', width: 1536, height: 1024, label: '1536 × 1024', aspect: '3:2', tag: 'Photo 3:2' },
      { id: 'ls-16-9-hd', width: 1280, height: 720, label: '1280 × 720', aspect: '16:9', tag: 'HD 720p' },
      { id: 'ls-16-9-fhd', width: 1920, height: 1080, label: '1920 × 1080', aspect: '16:9', tag: 'FHD 1080p' },
      { id: 'ls-21-9', width: 1680, height: 720, label: '1680 × 720', aspect: '21:9', tag: 'Ultrawide' },
    ]
  },
  {
    category: 'Portrait',
    presets: [
      { id: 'pt-3-4', width: 768, height: 1024, label: '768 × 1024', aspect: '3:4', tag: 'Classic Portrait' },
      { id: 'pt-2-3', width: 1024, height: 1536, label: '1024 × 1536', aspect: '2:3', tag: 'Photo 2:3' },
      { id: 'pt-9-16-hd', width: 720, height: 1280, label: '720 × 1280', aspect: '9:16', tag: 'Vertical HD' },
      { id: 'pt-9-16-fhd', width: 1080, height: 1920, label: '1080 × 1920', aspect: '9:16', tag: 'Vertical FHD' },
      { id: 'pt-4-5', width: 1080, height: 1350, label: '1080 × 1350', aspect: '4:5', tag: 'Portrait 4:5' },
    ]
  },
  {
    category: 'Social Media',
    presets: [
      { id: 'sm-ig-sq', width: 1080, height: 1080, label: '1080 × 1080', aspect: '1:1', tag: 'Instagram Post' },
      { id: 'sm-ig-pt', width: 1080, height: 1350, label: '1080 × 1350', aspect: '4:5', tag: 'Instagram Portrait' },
      { id: 'sm-ig-story', width: 1080, height: 1920, label: '1080 × 1920', aspect: '9:16', tag: 'Instagram Story/Reel' },
      { id: 'sm-yt-thumb', width: 1280, height: 720, label: '1280 × 720', aspect: '16:9', tag: 'YouTube Thumbnail' },
      { id: 'sm-yt-video', width: 1920, height: 1080, label: '1920 × 1080', aspect: '16:9', tag: 'YouTube Video' },
      { id: 'sm-yt-shorts', width: 1080, height: 1920, label: '1080 × 1920', aspect: '9:16', tag: 'YouTube Shorts' },
      { id: 'sm-tiktok', width: 1080, height: 1920, label: '1080 × 1920', aspect: '9:16', tag: 'TikTok Video' },
      { id: 'sm-fb-post', width: 1200, height: 630, label: '1200 × 630', aspect: '1.9:1', tag: 'Facebook Post' },
      { id: 'sm-pin', width: 1000, height: 1500, label: '1000 × 1500', aspect: '2:3', tag: 'Pinterest Pin' },
    ]
  }
];

export function estimateMemory(width, height) {
  const pixels = width * height;
  const mb = Math.round((pixels * 4 * 3) / (1024 * 1024));
  return `${mb} MB RAM`;
}

