from PIL import Image, ImageDraw
import os

# Create a 512x512 high-resolution logo image
size = 512
img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# 1. Main Teal Squircle Background (#0E7C79)
margin = 16
radius = 110
teal_color = (14, 124, 121, 255)       # #0E7C79
dark_teal_border = (10, 99, 97, 255)   # #0A6361
white_color = (255, 255, 255, 255)

# Outer Border & Fill
draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=radius, fill=teal_color, outline=dark_teal_border, width=6)

# 2. White Smartphone Outline
phone_left = 120
phone_top = 80
phone_right = 392
phone_bottom = 432
phone_radius = 48
phone_stroke = 18

draw.rounded_rectangle([phone_left, phone_top, phone_right, phone_bottom], radius=phone_radius, outline=white_color, width=phone_stroke)

# Top Speaker Bar
speaker_y = 120
draw.line([216, speaker_y, 296, speaker_y], fill=white_color, width=12)

# 3. House Icon inside Phone Screen
roof_peak_x = 256
roof_peak_y = 180
roof_left_x = 166
roof_left_y = 250
roof_right_x = 346
roof_right_y = 250

stroke_w = 16

# Roof Triangles / Lines
draw.line([(roof_left_x - 10, roof_left_y), (roof_peak_x, roof_peak_y), (roof_right_x + 10, roof_right_y)], fill=white_color, width=stroke_w, joint="round")

# House Body Rectangle
house_left = 186
house_top = 250
house_right = 326
house_bottom = 370

draw.rectangle([house_left, house_top, house_right, house_bottom], outline=white_color, width=stroke_w)

# Inner Window Grid (4 small panes)
win_left = 226
win_top = 280
win_right = 286
win_bottom = 340
win_stroke = 8

draw.rectangle([win_left, win_top, win_right, win_bottom], outline=white_color, width=win_stroke)
draw.line([256, win_top, 256, win_bottom], fill=white_color, width=win_stroke)
draw.line([win_left, 310, win_right, 310], fill=white_color, width=win_stroke)

# Save PNG
os.makedirs("d:/TapEgypt/images", exist_ok=True)
png_path = "d:/TapEgypt/images/tapegypt_app_logo.png"
img.save(png_path, "PNG")

# Also generate SVG version
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Teal Squircle Background -->
  <rect x="16" y="16" width="480" height="480" rx="110" fill="#0E7C79" stroke="#0A6361" stroke-width="6"/>
  
  <!-- Smartphone Frame -->
  <rect x="120" y="80" width="272" height="352" rx="48" fill="none" stroke="#FFFFFF" stroke-width="18"/>
  
  <!-- Speaker Notch Bar -->
  <line x1="216" y1="120" x2="296" y2="120" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/>
  
  <!-- House Roof Peak -->
  <path d="M 156 250 L 256 180 L 356 250" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- House Body -->
  <rect x="186" y="250" width="140" height="120" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linejoin="round"/>
  
  <!-- Inner Window Grid -->
  <rect x="226" y="280" width="60" height="60" fill="none" stroke="#FFFFFF" stroke-width="8"/>
  <line x1="256" y1="280" x2="256" y2="340" stroke="#FFFFFF" stroke-width="8"/>
  <line x1="226" y1="310" x2="286" y2="310" stroke="#FFFFFF" stroke-width="8"/>
</svg>'''

svg_path = "d:/TapEgypt/images/tapegypt_app_logo.svg"
with open(svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content)

print("Successfully created logo PNG and SVG image files!")
