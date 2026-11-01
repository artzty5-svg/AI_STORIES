# NeuroCanvas AI — Local Studio
## Production-Ready General-Purpose AI Image & Video Studio

A complete, polished, locally hosted AI creative suite built with the **MERN** stack (React + Vite + Tailwind CSS + Lucide Icons + Node.js + Express + Sharp + FFmpeg) powered by **ComfyUI** and hardware-accelerated local engines on Apple Silicon (MacBook Pro M5 Pro with 16 GB unified memory).

The platform features two fully integrated creative studios:
1. **AI Image Studio**: Multi-genre text-to-image and reference-based image-to-image generation with batch output, super-resolution upscaling, variation creation, and format export.
2. **AI Video Studio**: Professional AI video generation featuring independent **Start Frame** and **End Frame** conditioning, motion prompt engineering, duration/resolution control, seekable HTTP 206 video streaming, and persistent video job history.

---

## 1. Key Features

### 🎬 AI Video Studio
- **First-Last-Frame Motion Generation**: Upload independent **Start Frame (Frame A)** and **End Frame (Frame B)** to create smooth, coherent transitions, morphs, camera movements, and subject transformations.
- **Single-Frame Image-to-Video & Text-to-Video**: Supply only a Start Frame for forward motion simulation, or enter a text prompt alone for direct synthesis.
- **Motion Prompt Editor**: Dedicated video motion prompts with preset inspirations (camera pans, zooms, dynamic lighting, fluid morphs), negative prompt support, and character counters.
- **Granular Video Settings**:
  - **Durations**: `2s`, `4s`, `5s`, `8s`, `10s`
  - **Resolutions**: `480p (854×480)`, `540p (960×540)`, `720p HD (1280×720)`, `1080p FHD (1920×1080)`
  - **Aspect Ratios**: `16:9` (Cinematic Landscape), `9:16` (Shorts/Reels/TikTok), `1:1` (Square), `4:3` (Standard), `3:2` (Photography)
  - **Framerate**: `24 FPS` (Cinematic) or `30 FPS` (Smooth)
  - **Seed Lock, Inference Steps (15-50), and CFG Motion Guidance (1.0-15.0)**.
- **Asynchronous Queue & Job Polling**:
  - Background execution model with job status progression: `queued` → `preparing` → `generating` → `completed` / `failed` / `cancelled`.
  - Concurrency management strictly capped at 1 active job to prevent 16 GB unified memory exhaustion.
  - Non-blocking UI with live elapsed time, percentage progress, step counts, and one-click job cancellation.
- **Professional HTML5 Video Player**:
  - Full HTTP 206 Partial Content Range streaming for instantaneous scrubbing and seeking.
  - Controls: Play/Pause, Seek scrubber with buffered ranges, Time display (`00:00 / 00:05`), Volume & Mute, Playback speed (`0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`), and Fullscreen.
  - Video poster frames automatically extracted for instant preview.
  - One-click full-resolution MP4 video download.
- **Persistent Video Job History**:
  - Job history stored locally in `server/data/video-jobs.json` with video assets in `server/videos/`.
  - History drawer with thumbnail posters, execution metadata, replay, download, and delete.
- **ComfyUI Video Studio**:
  - **ComfyUI First-Last-Frame Video Engine**: Connects seamlessly to a local ComfyUI server at `http://127.0.0.1:8188` supporting Wan2.1 and LTX-Video workflows.

---

### 🎨 AI Image Studio
- **General-Purpose Multi-Genre Studio**: Photography, Portraits, Landscapes, Architecture, Anime, Products, Sci-Fi, Concept Art, Animals, Food, Interior Design, and Abstract Art.
- **Text-to-Image & Image-to-Image (Img2Img)**: Upload PNG, JPG, JPEG, or WEBP reference images with an adjustable **Reference Strength** (0% to 100%) and multiple conditioning modes (*Image-to-Image*, *Style Reference*, *Character Reference*, *Image Variation*).
- **Multi-Output Batch Generation (1 to 4 Images)**: Generate 1, 2, 3, or 4 distinct outputs simultaneously with independent seeds, variations, and actions.
- **7-Theme Design System (Light Default)**:
  1. **Light Studio** (Default clean, warm light surface)
  2. **Dark Studio**
  3. **Midnight Blue**
  4. **Warm Sand**
  5. **Lavender Mist**
  6. **Ocean Breeze**
  7. **Emerald Forest**
- **AI Prompt Enhancement**: One-click prompt expansion powered by the local prompt assistant.
- **Categorized Aspect Ratio & Social Media Presets**:
  - **Square**: `512×512`, `768×768`, `1024×1024`, `1536×1536`
  - **Landscape**: 4:3 (`1024×768`), 3:2 (`1536×1024`), 16:9 (`1280×720`), 16:9 (`1920×1080`), 21:9 (`1680×720`)
  - **Portrait**: 3:4 (`768×1024`), 2:3 (`1024×1536`), 9:16 (`720×1280`), 9:16 (`1080×1920`), 4:5 (`1080×1350`)
  - **Social Media**: Instagram Posts, Instagram Stories/Reels, YouTube Thumbnails, YouTube Shorts, TikTok, Facebook Posts, Pinterest Pins.
  - **Custom Dimensions**: Width & Height inputs, Aspect ratio lock, Memory estimation.
- **Image Editing & Super-Resolution**:
  - **2x Super-Resolution Upscaling** with Lanczos3 resampling and unsharp mask.
  - **Image Variation Generator**.
- **Export & Downloads**:
  - Original full-resolution image downloads (PNG, JPEG, WEBP) with descriptive filenames.
  - **Batch ZIP Export** for downloading all or selected outputs in one click.
- **Local Storage & Gallery**:
  - Zero external databases (no MongoDB/Mongoose).
  - Images stored in `server/generated/` and `server/uploads/`.
  - Metadata persisted in `server/data/gallery.json`.
- **Zero Cloud Transmission**: All prompts, uploaded references, and generated artworks remain strictly on your Mac.

---

## 2. One-Command Startup

Start the entire platform from the project root using a single command:

```bash
cd /Users/oswaldo/website
npm run dev
```

This single command automatically:
1. Verifies that **ComfyUI** is running on port `8188` (`http://127.0.0.1:8188`).
2. Checks for **FFmpeg** with Apple Silicon VideoToolbox acceleration.
3. Starts the **Express Backend** on port `5000` (`http://127.0.0.1:5000`).
4. Starts the **Vite React Client** on port `5173` (`http://localhost:5173`).
5. Opens your default browser to `http://localhost:5173`.
6. Handles graceful shutdown of all processes when interrupted (`Ctrl + C`).

---

## 3. Installation & Setup

If setting up on a new environment:

```bash
# 1. Install all dependencies for root, backend, and frontend
npm run install:all

# 2. Verify FFmpeg installation (for local video rendering)
which ffmpeg  # Expected: /opt/homebrew/bin/ffmpeg or similar

# 3. Start the studio
npm run dev
```

---

## 4. Application Architecture

```
website/
├── client/                      # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation (Image Studio, Video Studio, Gallery, Settings)
│   │   │   ├── PromptInput.jsx         # Image prompt editor, prompt enhancer, tags
│   │   │   ├── ReferenceUpload.jsx     # Img2Img drag-drop, strength slider, modes
│   │   │   ├── ModelSelector.jsx       # Modular engine & model selector
│   │   │   ├── ResolutionPicker.jsx    # Square, Landscape, Portrait, Social, Custom
│   │   │   ├── GenerationControls.jsx  # Batch (1x-4x), Seed lock, Steps, CFG, Cancel
│   │   │   ├── ImagePreview.jsx        # Center stage, zoom, upscale, variation, export
│   │   │   ├── ImageGallery.jsx        # Right collapsible image history sidebar
│   │   │   ├── FullscreenModal.jsx     # Image Lightbox with zoom and download
│   │   │   └── video/                  # Dedicated Video Studio Components
│   │   │       ├── StartFrameUpload.jsx   # Frame A uploader (drag & drop, dimensions, preview)
│   │   │       ├── EndFrameUpload.jsx     # Frame B uploader (drag & drop, dimensions, preview)
│   │   │       ├── VideoPromptEditor.jsx  # Motion prompts, negative prompts, inspirations
│   │   │       ├── VideoSettings.jsx      # Duration, resolution, aspect ratio, FPS, seed, CFG
│   │   │       ├── VideoPlayer.jsx        # HTML5 seekable player, playback rate, full-res MP4 download
│   │   │       └── VideoHistory.jsx       # Collapsible video history, posters, retry, delete
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Welcome hero, spotlight cards & genre inspirations
│   │   │   ├── VideoStudioPage.jsx     # AI Video Studio workspace (3-column layout)
│   │   │   ├── ExplorePage.jsx         # Categorized prompt library
│   │   │   ├── HistoryPage.jsx         # Full local gallery, search, filters, ZIP export
│   │   │   └── SettingsPage.jsx        # Diagnostics, engine connections, storage paths
│   │   ├── constants/
│   │   │   ├── themes.js               # 7 themes definition
│   │   │   ├── prompts.js              # Creative genres & style tags
│   │   │   └── resolutions.js          # Aspect ratio & social media presets
│   │   └── services/
│   │       └── api.js                  # Frontend API client (Image & Video endpoints)
├── server/                      # Node.js + Express + Sharp + Multer + Archiver + FFmpeg
│   ├── controllers/
│   │   ├── imageController.js          # Image REST endpoints
│   │   └── videoController.js          # Video REST endpoints (create, status, stream, cancel, delete)
│   ├── middleware/
│   │   └── uploadMiddleware.js         # Multer validation for reference images and video frames
│   ├── routes/
│   │   ├── api.js                      # Main API route aggregator
│   │   └── video.js                    # Video Studio router (/api/video/...)
│   ├── services/
│   │   ├── adapters/
│   │   │   ├── BaseAdapter.js          # Modular engine interface
│   │   │   ├── ComfyUIAdapter.js       # ComfyUI image diffusion adapter (:8188)
│   │   │   └── ComfyUIVideoAdapter.js  # ComfyUI First-Last-Frame video adapter (:8188)
│   │   ├── imageProcessingService.js   # Sharp-based Lanczos3 upscaling and transformations
│   │   ├── videoJobService.js          # Video queue manager (concurrency=1, state machine)
│   │   ├── metadataService.js          # Lightweight gallery metadata in server/data/
│   │   └── aiService.js                # AI generation & batch orchestration
│   ├── generated/                      # Generated image output folder
│   ├── videos/                         # Generated MP4 videos & poster JPEGs
│   ├── uploads/                        # Uploaded reference frames & images
│   ├── data/                           # video-jobs.json & gallery.json persistence
│   └── server.js                       # Express app (127.0.0.1:5000) with /static/videos
├── scripts/
│   └── start.js                        # Single-command startup supervisor
├── package.json
└── README.md
```


## 5. First-Last-Frame Video Workflow

1. **Upload Start Frame (Frame A)**:
   - Drag and drop or browse any PNG, JPG, or WEBP image up to 25MB.
   - NeuroCanvas inspects and displays the image dimensions and aspect ratio.
2. **Upload End Frame (Frame B)** *(Optional)*:
   - Upload the target destination frame.
   - The studio automatically normalizes dimensions and aspect ratios to match your selected video resolution.
3. **Specify Motion Prompt**:
   - Describe the camera motion or subject transformation (e.g., *"Cinematic slow push-in, water ripples, golden sunset glow"*).
   - Use quick motion inspiration chips (*Camera Push In*, *Smooth Morph*, *Slow Motion Pan*, etc.).
4. **Configure Settings**:
   - Choose duration (`2s`, `4s`, `5s`, `8s`, `10s`), resolution (`480p`, `540p`, `720p`, `1080p`), aspect ratio, and framerate (`24` or `30` FPS).
5. **Generate Video**:
   - Click **Generate Video** or press `Cmd + Enter`.
   - The task enters the background queue (`queued` → `preparing` → `generating`).
   - Monitor real-time progress percentage, elapsed time, and step progression.
6. **Playback & Export**:
   - Scrub smoothly using the seek bar powered by HTTP 206 range streaming.
   - Adjust playback rate or enter fullscreen.
   - Download the full-resolution `.mp4` file directly.

---

## 6. ComfyUI First-Last-Frame Video Integration

If you have ComfyUI installed (e.g. `/Applications/Comfy Desktop.app` or standalone git checkout):

1. **Launch ComfyUI**:
   ```bash
   # Launch ComfyUI on default port 8188
   python main.py --listen 127.0.0.1 --port 8188
   ```
2. **Supported Video Models**:
   - **Wan2.1 (First-to-Last Frame)**
   - **LTX-Video (First-Last Interpolation)**
   - **AnimateDiff / SVD**
3. **Automatic Detection**:
   - NeuroCanvas AI queries `http://127.0.0.1:8188/system_stats` automatically.
   - When detected, the ComfyUI video models become selectable in the Video Studio settings panel.
   - Uploaded start and end frames are transferred directly into ComfyUI via `/upload/image` and queued using `/prompt`.
4. **Sole Generation Engine**:
   - ComfyUI is the sole engine for image and video synthesis. Ensure your ComfyUI server is running on port 8188.

---

## 7. Backend REST API

### Video Studio Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/video/health` | Video subsystem status, queue state, and active engines |
| `GET` | `/api/video/models` | List available video generation models across engines |
| `POST` | `/api/video/frame/upload` | Upload a starting or ending reference frame (multipart) |
| `POST` | `/api/video/generate` | Queue an asynchronous video generation job (returns 202 with `jobId`) |
| `GET` | `/api/video/jobs/:jobId` | Poll video job status, progress percentage, and metadata |
| `POST` | `/api/video/jobs/:jobId/cancel`| Cancel a queued or active video generation job |
| `GET` | `/api/video/stream/:filename` | Stream generated video with HTTP 206 Partial Content range seeking |
| `GET` | `/api/video/jobs/:jobId/download`| Download full-resolution MP4 video file |
| `GET` | `/api/video/jobs` | List persistent video job history |
| `DELETE` | `/api/video/jobs/:jobId` | Delete video job, MP4 video, and poster frame |

### Image Studio Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, uptime, and memory usage |
| `GET` | `/api/comfyui/status` | ComfyUI connectivity check (`:8188`) |
| `GET` | `/api/engines` | List available engine adapters |
| `GET` | `/api/models` | List models across active adapters |
| `POST` | `/api/prompt/enhance` | Enhance prompt with studio assistant |
| `POST` | `/api/generate` | Text-to-image or img2img batch generation (1-4 outputs) |
| `POST` | `/api/reference/upload` | Upload PNG/JPG/WEBP reference image |
| `GET` | `/api/images` | List and filter gallery images (`?search=`, `?model=`, `?aspectRatio=`) |
| `DELETE` | `/api/images` | Clear local session history |
| `GET` | `/api/images/:filename` | Stream local image file |
| `GET` | `/api/download/:filename` | Download full-resolution image (`?format=png|jpeg|webp`) |
| `POST` | `/api/images/download-all` | Download selected or all images as a `.zip` archive |
| `POST` | `/api/images/:filename/upscale` | 2x Super-resolution upscale |
| `POST` | `/api/images/:filename/variation`| Generate variation from existing image |
| `DELETE` | `/api/images/:filename` | Delete image and metadata |

---

## 8. Generation Engine Architecture

### ComfyUI Sole Engine
- **ComfyUI (`:8188`)** is the sole generation engine for image and video synthesis.
- Connects directly to local node-based diffusion workflows and checkpoints.
- Supports text-to-image and reference-image conditioning (Image-to-Image).
- No external cloud services or secondary daemons required.

---

## 9. Troubleshooting

- **Port 5000 Conflict (macOS ControlCenter / AirPlay)**:
  The backend binds explicitly to `127.0.0.1:5000` to prevent collisions with Apple AirPlay Receiver on `0.0.0.0`.
- **Unified Memory Management (16 GB Apple Silicon)**:
  Video synthesis requires significant RAM. The backend restricts concurrent video jobs to 1 (`MAX_CONCURRENT_JOBS = 1`) and cleans up intermediate buffer allocations immediately.
- **HTTP 206 Video Scrubbing**:
  The streaming endpoint `/api/video/stream/:filename` implements HTTP 206 Range headers so browser HTML5 `<video>` players can scrub backwards and forwards without redownloading the entire file.
- **ComfyUI Connection**:
  Verify ComfyUI is running on port 8188. Launch with:
  `python main.py --listen 127.0.0.1 --port 8188`
# AI_GEN
