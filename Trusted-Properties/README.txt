TRUSTED PROPERTIES — VECTOR LOGO & ANIMATION
===========================================

FILES
trusted-properties-static.svg
    Clean static logo on a transparent background. All shapes and all
    lettering are actual vector paths. Suitable for websites, design
    editors and print layouts. No embedded bitmap and no fonts to install.

trusted-properties-animated.svg
    Self-contained SVG with embedded CSS animation. 9.5-second repeating
    sequence: gold arc, building reveal, roof and windows, shield/checkmark,
    brand lettering, tagline, verification badge, subtle gold sheen,
    reading pause and soft fade. No JavaScript or external dependencies.

trusted-properties-preview.html
    Standalone offline browser preview. Includes Replay, Pause/Resume,
    static-logo mode and a transparency-grid switch. The artwork is
    embedded inline, so this HTML can be used without the other files.

trusted-properties-static.png
    High-resolution 2508 x 2508 transparent PNG exported from the vector.

trusted-properties-animation-preview.gif
    White-background animation preview. The GIF is only a preview; use
    the SVG for a sharp, scalable production asset.

HOW TO VIEW
Open the animated SVG or preview HTML in a modern browser. Some chat
thumbnails, image viewers and design editors display a still image rather
than SVG animation. Use the static SVG wherever animation is unsupported.

WEBSITE EMBED
<img
  src="trusted-properties-animated.svg"
  alt="Trusted Properties — Your dream home. Our priority."
  width="420"
  height="420"
  style="display:block;max-width:100%;height:auto"
/>

Use the static SVG for email, print and other non-animated uses. If using
inline SVG multiple times in the same document, make its tp-* IDs unique
or use separate <img> elements to avoid duplicate-ID conflicts.

ACCESSIBILITY
The animated SVG respects prefers-reduced-motion: reduce and then shows
the complete static logo. The standalone SVG requires no JavaScript.

EDITING NOTES
The source PNG was traced into paths, preserving its shapes and original
lettering. The raster's subtle navy-and-gold shading was recreated with
native SVG gradients; it is not an identical reproduction of every raster
pixel. The white backdrop was removed to make the artwork transparent.

The lettering is outlined, not live editable text. Individual letters and
logo components are separately named paths in the SVG. Adjust path fills
or the gradient stops to change colors. The animation's keyframes and
classes are contained in the <style> block. To alter the duration without
changing the timing proportions, replace every "9.5s" with a new duration.

The source's text remains:
TRUSTED PROPERTIES
YOUR DREAM HOME. OUR PRIORITY.
VERIFIED & TRUSTED
REAL ESTATE PARTNER
