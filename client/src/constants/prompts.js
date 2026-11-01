export const CATEGORIES = [
  {
    id: 'photography',
    name: 'Photography',
    icon: 'Camera',
    description: 'High-end portraiture, editorial lighting, and street photography',
    prompt: 'Cinematic street portrait of a woman in Tokyo at twilight, neon reflections in rain puddles, 85mm f/1.4 lens, natural skin texture, bokeh, photorealistic',
    negativePrompt: 'blurry, artificial plastic look, deformed eyes, extra fingers'
  },
  {
    id: 'nature',
    name: 'Nature & Landscapes',
    icon: 'Mountain',
    description: 'Dramatic mountain vistas, sunsets, cascading waterfalls, and oceans',
    prompt: 'Majestic alpine mountain peak surrounded by morning mist, golden hour sunlight breaking through clouds, crystal clear glacial lake reflection, hyper-detailed nature photography',
    negativePrompt: 'oversaturated, artificial, smog, blurry'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: 'Building2',
    description: 'Contemporary villas, organic brutalism, and futuristic skyscrapers',
    prompt: 'Ultra-modern minimalist concrete villa cantilevered over a cliff edge at dusk, floor-to-ceiling glass walls, warm interior architectural lighting, infinity pool, architectural digest photography',
    negativePrompt: 'crooked lines, distorted perspective, blurry, low resolution'
  },
  {
    id: 'fashion',
    name: 'Fashion & Editorial',
    icon: 'Sparkles',
    description: 'Haute couture runway, elegant fabrics, and editorial magazine styling',
    prompt: 'High-fashion editorial portrait of a model wearing an avant-garde iridescent silk gown, minimalist studio background, sculptural lighting, elegant pose, Vogue magazine aesthetic',
    negativePrompt: 'sloppy clothing, distorted anatomy, poor lighting'
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Sci-Fi',
    icon: 'Wand2',
    description: 'Mythical worlds, glowing bioluminescence, cybernetics, and space',
    prompt: 'Bioluminescent ancient fantasy temple hidden inside a crystalline cavern, glowing floating spores, ethereal teal and violet lighting, concept art masterpiece, 8k resolution',
    negativePrompt: 'muddy colors, low quality, flat lighting'
  },
  {
    id: 'anime',
    name: 'Anime & Manga',
    icon: 'Palette',
    description: 'Vibrant cel-shaded characters, expressive emotions, and dynamic action',
    prompt: 'Anime hero standing on a rooftop overlooking Neo-Tokyo under a starry night sky, wind blowing through hair, glowing cyberpunk visor, crisp cel-shaded anime aesthetic, Makoto Shinkai style',
    negativePrompt: 'western cartoon, messy linework, 3d render, distorted face'
  },
  {
    id: 'product',
    name: 'Product Design',
    icon: 'Box',
    description: 'Luxury packaging, electronics, cosmetics, and sleek commercial renders',
    prompt: 'Minimalist luxury matte black fragrance bottle resting on wet obsidian stone, subtle water droplets, dramatic side softbox lighting, high-end commercial advertising photography',
    negativePrompt: 'cheap plastic, dirty surface, blurry text, harsh shadows'
  },
  {
    id: 'social',
    name: 'Social Media & Graphics',
    icon: 'Share2',
    description: 'Eye-catching YouTube thumbnails, Instagram reels, and viral posters',
    prompt: 'Vibrant high-energy YouTube thumbnail concept, futuristic gamer setup with floating 3D holographic icons, neon rim lighting, expressive composition, 4k ultra-crisp',
    negativePrompt: 'boring, washed out, low contrast, text errors'
  },
  {
    id: 'animals',
    name: 'Animals & Wildlife',
    icon: 'Cat',
    description: 'Expressive wildlife portraits, majestic predators, and macro nature',
    prompt: 'Close-up portrait of a majestic snow leopard perched on a snowy Himalayan ridge, piercing blue eyes, individual fur detail, soft snowflakes falling, National Geographic wildlife photography',
    negativePrompt: 'taxidermy, cartoon, fake fur, extra paws'
  },
  {
    id: 'food',
    name: 'Food & Culinary',
    icon: 'Utensils',
    description: 'Artisanal culinary plating, gourmet dishes, and warm ambient cafes',
    prompt: 'Artisanal gourmet ramen bowl with tender pork chashu, soft-boiled egg, fresh scallions, steaming broth glistening in warm Japanese izakaya lighting, food photography magazine',
    negativePrompt: 'unappetizing, cold, plastic food, dull colors'
  },
  {
    id: 'interior',
    name: 'Interior Design',
    icon: 'Home',
    description: 'Scandinavian lofts, Japandi living rooms, and cozy study spaces',
    prompt: 'Serene Japandi style living room with light oak wood furniture, beige linen sofa, bonsai tree, warm afternoon sunlight casting soft shadows through shoji screens, architectural rendering',
    negativePrompt: 'cluttered, dirty, mismatched styles, harsh light'
  },
  {
    id: 'abstract',
    name: 'Abstract Art',
    icon: 'Shapes',
    description: 'Fluid chromatic ribbons, geometric sculptures, and optical forms',
    prompt: 'Flowing sculptural ribbons of liquid iridescent glass swirling in zero gravity, vibrant refraction, prismatic spectrum of light, clean dark background, 3D modern art piece',
    negativePrompt: 'dull, noisy, artifacting, chaotic mess'
  }
];

export const PROMPT_SUGGESTIONS = {
  lighting: [
    'Cinematic Golden Hour',
    'Volumetric Fog & God Rays',
    'Studio Softbox Rim Light',
    'Cyberpunk Neon Glow',
    'Dramatic Moody Chiaroscuro',
    'Natural Diffused Daylight'
  ],
  camera: [
    '85mm Portrait Lens f/1.4',
    '24mm Wide Angle',
    'Macro Close-Up',
    'Aerial Drone Perspective',
    'Low-Angle Hero Shot',
    'Cinematic 35mm Film'
  ],
  composition: [
    'Rule of Thirds',
    'Symmetrical Balance',
    'Minimalist Negative Space',
    'Dynamic Diagonal Leading Lines',
    'Centered Frame Focus'
  ],
  style: [
    'Photorealistic 8K',
    'Anime Cel-Shading',
    'Oil Painting Masterpiece',
    'Octane 3D Render',
    'Watercolor Wash',
    'Futuristic Concept Art'
  ],
  materials: [
    'Polished Chrome & Glass',
    'Matte Ceramic Texture',
    'Iridescent Silk',
    'Natural Weathered Wood',
    'Brushed Titanium'
  ]
};

