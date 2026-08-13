import qrcode
import qrcode.image.svg

# Smart 2-in-1 Universal Redirect URL (Detects iOS vs Android)
url = "https://tap-egypt.vercel.app/download.html"

# Generate PNG QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=10,
    border=2,
)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
img.save("d:/TapEgypt/images/tap_egypt_app_qr.png")

# Generate SVG QR code
factory = qrcode.image.svg.SvgPathImage
svg_img = qrcode.make(url, image_factory=factory)
svg_img.save("d:/TapEgypt/images/tap_egypt_app_qr.svg")

print("Successfully generated Smart Universal 2-in-1 QR Code PNG and SVG!")
