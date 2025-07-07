# Icons for Zaytoonz RSS Creator Extension

## Required Icon Sizes

The extension requires icons in the following sizes:
- `icon16.png` - 16x16 pixels (toolbar small)
- `icon32.png` - 32x32 pixels (popup header)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Generating Icons from SVG

You can use the provided `icon.svg` file to generate all required sizes:

### Using ImageMagick (Command Line)
```bash
# Install ImageMagick if you don't have it
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: Download from https://imagemagick.org/

# Generate all icon sizes
magick icon.svg -resize 16x16 icon16.png
magick icon.svg -resize 32x32 icon32.png
magick icon.svg -resize 48x48 icon48.png
magick icon.svg -resize 128x128 icon128.png
```

### Using Online Tools
1. Upload `icon.svg` to [Convertio.co](https://convertio.co/svg-png/)
2. Convert to PNG format
3. Resize to required dimensions
4. Download and rename files

### Using Inkscape (Free Software)
1. Open `icon.svg` in Inkscape
2. File → Export PNG Image
3. Set custom size (16, 32, 48, 128)
4. Export each size

### Using Figma/Sketch/Adobe Illustrator
1. Import the SVG
2. Create artboards for each size
3. Export as PNG with 2x quality

## Design Notes

The icon combines:
- **RSS symbol** (broadcast waves + dot) representing feed creation
- **Target/crosshair** representing job detection accuracy
- **Zaytoonz brand colors** (#556B2F primary, #6B8E23 accent)
- **Clean, professional look** suitable for business environments

## Alternative Icon Ideas

If you want to create custom icons, consider these concepts:
- 📡 + 🎯 (RSS + targeting)
- 🔍 + 📊 (search + data)
- 🌐 + 💼 (web + jobs)
- ⚡ + 📋 (automation + lists)

## Testing Icons

After generating the icons:
1. Place all PNG files in this `icons/` directory
2. Reload the extension in browser
3. Check if icons appear correctly in:
   - Browser toolbar
   - Extension popup
   - Extension management page
   - Context menus

## Branding Guidelines

- **Primary Color**: #556B2F (Olive Green)
- **Accent Color**: #6B8E23 (Yellow Green)
- **Background**: White or transparent
- **Style**: Modern, clean, professional
- **Avoid**: Too much detail (icons are small), multiple colors, complex gradients 