from PIL import Image

img = Image.open("d:/TapEgypt/images/tapegyptlogo.jpg").convert("RGBA")
width, height = img.size

# Flood fill outer white border starting from top-left (0,0)
# Pixels with R,G,B > 230 get alpha=0
new_img = Image.new("RGBA", (width, height))
pix = img.load()
new_pix = new_img.load()

for x in range(width):
    for y in range(height):
        r, g, b, a = pix[x, y]
        # Outer background white (skip inner white house icon by checking bounding circle or distance from center)
        # Center is (width/2, height/2)
        cx, cy = width / 2.0, height / 2.0
        dist_from_center = ((x - cx)**2 + (y - cy)**2)**0.5
        
        if r > 225 and g > 225 and b > 225 and dist_from_center > 320:
            new_pix[x, y] = (0, 0, 0, 0)
        else:
            new_pix[x, y] = (r, g, b, a)

# Crop tight transparent margin
# Squircle squircle bounds roughly x:165 to 795, y:165 to 795
bbox = new_img.getbbox()
if bbox:
    cropped = new_img.crop(bbox)
    cropped.save("d:/TapEgypt/images/tapegypt_logo_transparent.png", "PNG")
else:
    new_img.save("d:/TapEgypt/images/tapegypt_logo_transparent.png", "PNG")

print("Successfully cropped & removed outer white background!")
