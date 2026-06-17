import { SeededNoise } from './noise';

interface Color {
  r: number;
  g: number;
  b: number;
}

const PALETTES: Color[][] = [
  // 0: Desert (Warm sand, orange, terracotta)
  [
    { r: 70, g: 30, b: 15 },    // Deep bedrock
    { r: 160, g: 80, b: 40 },   // Terracotta clay
    { r: 210, g: 130, b: 70 },  // Sandy orange
    { r: 235, g: 200, b: 160 }  // Light desert dust
  ],
  // 1: Ocean (Deep blue, aqua, teal, sand shore)
  [
    { r: 5, g: 15, b: 50 },     // Abyssal blue
    { r: 15, g: 50, b: 120 },   // Deep ocean
    { r: 35, g: 120, b: 160 },  // Shallow turquoise
    { r: 220, g: 210, b: 170 }  // Sand coastline
  ],
  // 2: Ice (Cyan, pale blue, white, gray-silver)
  [
    { r: 40, g: 60, b: 90 },    // Deep glacier ice
    { r: 90, g: 140, b: 180 },  // Cyan ice
    { r: 160, g: 210, b: 235 }, // Pale frosted ice
    { r: 245, g: 250, b: 255 }  // Fresh snow
  ],
  // 3: Lava (Obsidian, deep red, orange-lava, sulfur)
  [
    { r: 15, g: 10, b: 15 },    // Cooling obsidian
    { r: 100, g: 15, b: 5 },    // Crusty hot rock
    { r: 220, g: 60, b: 10 },   // Flowing red lava
    { r: 255, g: 190, b: 30 }   // White-hot molten sulfur
  ],
  // 4: Forest (Emerald, olive, moss green, brown earth)
  [
    { r: 35, g: 20, b: 10 },    // Dark soil
    { r: 50, g: 85, b: 40 },    // Forest canopy
    { r: 80, g: 130, b: 65 },   // Moss green
    { r: 140, g: 175, b: 100 }  // Bright grass/leaves
  ],
  // 5: Alien (Violet, magenta, neon purple, lime green)
  [
    { r: 25, g: 5, b: 40 },     // Deep purple core
    { r: 100, g: 15, b: 120 },  // Neon violet
    { r: 190, g: 25, b: 150 },  // Magenta haze
    { r: 140, g: 240, b: 80 }   // Bioluminescent lime green
  ]
];

function lerpColor(c1: Color, c2: Color, f: number): Color {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * f),
    g: Math.round(c1.g + (c2.g - c1.g) * f),
    b: Math.round(c1.b + (c2.b - c1.b) * f)
  };
}

function getPaletteColor(palette: Color[], value: number): string {
  // Clamp value between 0 and 1
  const t = Math.max(0, Math.min(1, value));
  
  // Determine which segment of the palette to interpolate
  const segments = palette.length - 1;
  const scaledT = t * segments;
  const index = Math.floor(scaledT);
  const fraction = scaledT - index;

  if (index >= segments) {
    const last = palette[palette.length - 1];
    return `rgb(${last.r}, ${last.g}, ${last.b})`;
  }

  const c1 = palette[index];
  const c2 = palette[index + 1];
  const interpolated = lerpColor(c1, c2, fraction);

  return `rgb(${interpolated.r}, ${interpolated.g}, ${interpolated.b})`;
}

export function generatePlanetCanvas(seed: number, width = 512, height = 256, isStone = false): HTMLCanvasElement | null {
  if (typeof window === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const noise = new SeededNoise(seed);
  const paletteIndex = isStone ? 6 : Math.abs(seed) % 6;
  const palette = isStone ? [
    { r: 45, g: 45, b: 45 },    // Deep charcoal
    { r: 85, g: 85, b: 85 },    // Dark grey
    { r: 125, g: 125, b: 125 }, // Light grey
    { r: 165, g: 165, b: 165 }  // Pale ash
  ] : PALETTES[paletteIndex];

  // Palette-specific styling modifiers (e.g. gas bands or craters)
  const isGasGiant = paletteIndex === 0 || paletteIndex === 5; // Desert & Alien can be gas giants

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    // Map y coordinate to latitude (0 to pi)
    const lat = (y / height) * Math.PI;
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);

    for (let x = 0; x < width; x++) {
      // Map x coordinate to longitude (0 to 2*pi)
      const lon = (x / width) * 2 * Math.PI;
      const sinLon = Math.sin(lon);
      const cosLon = Math.cos(lon);

      // Spherical coordinate transformation mapping 2D pixels to 3D sphere coordinate
      const nx = sinLat * cosLon;
      const ny = cosLat;
      const nz = sinLat * sinLon;

      let nVal = 0;

      if (isGasGiant) {
        // Gas giants: strong horizontal banding
        const bandNoise = noise.fbm2D(nx * 1.5, ny * 8.0, 3, 2.0, 0.45);
        // Blend latitude band waves with noise
        const bandPattern = Math.sin(ny * 12 + bandNoise * 4.0);
        nVal = (bandPattern + 1) / 2;
        // Add finer turbulent noise details
        const detail = noise.fbm2D(nx * 5.0, nz * 5.0, 2, 2.0, 0.5);
        nVal = nVal * 0.85 + detail * 0.15;
      } else {
        // Terrestrial/Rocky/Ice planets: organic continental shapes
        nVal = noise.fbm2D(nx * 2.5 + 4.2, ny * 2.5 + 1.7, 5, 2.1, 0.5);
        // Normalize noise output from approx [-0.6, 0.6] to [0, 1]
        nVal = (nVal + 0.5) / 1.0;
        nVal = Math.max(0, Math.min(1, nVal));

        // Add some localized "craters" or mountain ridges for rocky planets (e.g. lava/ice)
        if (paletteIndex === 3 || paletteIndex === 2) {
          const craterNoise = noise.noise2D(nx * 8.0, nz * 8.0);
          if (craterNoise > 0.35) {
            nVal = nVal * 0.8 + 0.2; // raise/brighten craters
          }
        }
      }

      // Sample color
      const t = Math.max(0, Math.min(1, nVal));
      const segments = palette.length - 1;
      const scaledT = t * segments;
      const index = Math.floor(scaledT);
      const fraction = scaledT - index;

      let r = 0, g = 0, b = 0;
      if (index >= segments) {
        const last = palette[palette.length - 1];
        r = last.r; g = last.g; b = last.b;
      } else {
        const c1 = palette[index];
        const c2 = palette[index + 1];
        const color = lerpColor(c1, c2, fraction);
        r = color.r;
        g = color.g;
        b = color.b;
      }

      const pixelIndex = (y * width + x) * 4;
      data[pixelIndex] = r;
      data[pixelIndex + 1] = g;
      data[pixelIndex + 2] = b;
      data[pixelIndex + 3] = 255; // Alpha channel
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Add polar caps (shading/whitening) for Ice & Forest planets
  if (paletteIndex === 2 || paletteIndex === 4) {
    const capHeight = Math.floor(height * 0.12);
    // North pole
    const gradNorth = ctx.createLinearGradient(0, 0, 0, capHeight);
    gradNorth.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradNorth.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = gradNorth;
    ctx.fillRect(0, 0, width, capHeight);

    // South pole
    const gradSouth = ctx.createLinearGradient(0, height - capHeight, 0, height);
    gradSouth.addColorStop(0, 'rgba(255,255,255,0.0)');
    gradSouth.addColorStop(1, 'rgba(255,255,255,0.7)');
    ctx.fillStyle = gradSouth;
    ctx.fillRect(0, height - capHeight, width, capHeight);
  }

  return canvas;
}
