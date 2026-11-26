HabitDash icon assets

The following files are used by the application:

- icon-192.png: standard PWA icon (192 x 192)
- icon-512.png: standard PWA icon (512 x 512)
- icon-maskable-512.png: maskable PWA icon (512 x 512), with inset artwork
- apple-touch-icon.png: iOS home-screen icon (180 x 180)
- favicon.ico: multi-resolution Windows/browser favicon (16, 32 and 48 px)
- favicon-16.png, favicon-32.png, favicon-48.png: PNG favicon alternatives

Integration:
- habitdash.webmanifest declares the PWA icons.
- index.html references the SVG favicon, ICO/PNG favicons and Apple touch icon.
- habitdash-sw.js precaches the app shell and icon assets.

The icon artwork in this archive is the portrait artwork already supplied in
this project. Replace the source artwork and regenerate every size together
if a different brand image is selected. Keep the manifest, HTML paths and
service-worker precache list in sync when filenames change.
