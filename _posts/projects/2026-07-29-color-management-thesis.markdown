---
layout: post
title:  "Color Management for Multimedia Applications"
date:   2026-07-28 20:00:00 +0200
preview: "/images/color-management-thesis/header-comprobar-luz.png"
categories: project # post, project
permalink: project/color-management-thesis
---

This is the digital version of my **bachelor's thesis**, *Development of an Application for Color Management in Multimedia Environments*. It is a complete, from-scratch introduction to digital color science — how light becomes a photograph, how a photograph becomes a file, and how that file ends up looking right (or wrong) on a screen — paired with **Study Image**, a node-based Python application I built so every one of those steps can be seen and tested instead of taken on faith.

<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}

{% bibliography_loader _bibliography/color_management_references.bib %}


# Motivation

Free material on color science tends to be scattered and incomplete: a post explains gamma, another explains gamuts, a third explains RAW processing, and none of them connect into a full picture of what happens to an image between capture and display. Having worked as a VFX, compositing and color-grading supervisor on several university productions, I kept running into the same gap — artists and generalists picking up half-explained terminology and, as a result, misconfiguring color pipelines in ways that are hard to diagnose later.

This thesis tries to close that gap with two things: a complete, ordered explanation of color management aimed at artists rather than engineers, and a piece of software, **Study Image**, that lets you *see* the concepts — color space primaries, transfer functions, dynamic range, file formats — instead of taking them on faith.

{% alert %}
A recurring theme throughout: **the render color space itself changes the final image**, independently of any later color-space conversion. Two scenes lit with identical sRGB-defined colors but rendered internally in sRGB vs. ACEScg do not converge to the same result after converting both back to sRGB — the highlights saturate and roll off differently. This is one of the most under-documented behaviors in day-to-day CG color work, and a large part of the thesis is spent making it legible.
{% endalert %}


# Digital color science

Digital color science is the study of how colors are created, measured, captured, reproduced and perceived across digital systems {% cite Homann2009 %} — a field that spans far more than "color management" alone: from the physics of light, through sensors and renderers, to file formats and the screens that finally display them.

## The current paradigm

Digital color science is extensive and spans many disciplines, and it developed very quickly, chasing hardware that itself kept evolving. That history left behind a wide, inconsistent nomenclature that is a real barrier for newcomers.

A small example makes this concrete. Mobile screens, computer monitors and televisions can often all emit the *same* set of colors, called sRGB — yet the same content still looks different across them. That's because of the transfer function layered on top of the primaries: TVs typically use a curve called rec.709, while computer and phone screens use a curve called sRGB (confusingly, the same name as the color space). To complicate things further, there are *two* curves both called "sRGB": one is an exact piecewise formula, the other an approximation often written "~gamma 2.2" that differs mainly in the shadows. **A color space is defined by more than just its range of colors, and every one of those extra properties matters for correct color management** — this thesis works through them one at a time.

## Scene-Referred vs. Display-Referred

Two concepts run through the whole pipeline:

- **Scene-Referred** — values that represent the linear light of a real (or simulated) scene, exactly as captured.
- **Display-Referred** — values that have been reshaped, usually with a perceptual/logarithmic curve, to be shown on a screen, the same way our own eyes compress the light they receive.

{% figure id="scene-display" width="90%" caption="A real scene becomes a photograph via a RAW-format camera: linear, Scene-Referred light gets reshaped into Display-Referred values fit for a screen." %}
  {% fig_img src="/images/color-management-thesis/scene-to-display-pipeline.png" width="100%" %}
{% endfigure %}

## The basics of light

To understand dynamic range and primaries, it helps to start from the actual physical behavior of light. The units that matter across a digital image's lifetime:

- **Photons** — light itself, and its frequency (color). Sensors receive photons directly.
- **Candela** — the SI base unit of *luminous intensity*.
- **Nits** — one nit equals one candela per square meter; used for the light emitted by screens. Ordinary displays run around 100 nits, HDR displays at 1000–10000 nits.
- **Watts** — the unit 3D renderers and ray tracers actually compute in (0.05 W ≈ 1 candle). As reference points {% cite blenderlight %}: a clear sky ≈ 1000 W/m², an overcast sky ≈ 500 W/m², a very overcast sky ≈ 200 W/m², a full-moon night ≈ 0.001 W/m².

## From real color to digital color

Light is rarely a single wavelength (510 nm for green, say) — it's a **spectrum**, many frequencies combined, and the surfaces it bounces off reflect a *new*, altered spectrum {% cite inbook %}. The color of the light source itself has a direct effect on perceived color too: a UV blacklight is the extreme case, making some pigments fluoresce brightly while leaving others completely unaffected.

{% figure id="spectra" width="100%" caption="Left: the spectral power distribution of two standard illuminants, D65 (daylight) and D57. Right: spectra of several different real-world light sources." %}
  {% fig_img src="/images/color-management-thesis/spectra-d65-d57.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/spectral-outputs-light-sources.png" width="49%" %}
{% endfigure %}

To go from a real spectrum to something representable digitally, we lean on **metamerism**: the phenomenon where two color samples match under one set of viewing conditions (light source, observer, geometry) but not under another. Converting a spectrum into RGB means finding a *new* spectrum — one a screen's monochromatic LEDs can actually emit — that produces the same visual response.

Working from the premise that any color can be described as a mix of three primaries, the CIE defined the **CIE XYZ color space** {% cite CIE015 %}, built from human cone-response experiments (William David Wright and John Guild measured how sensitive human eyes are to monochromatic light at different wavelengths) so that it contains every color a human eye can see. Each XYZ value runs 0–100; Y carries luminance, X is roughly "red vs. green" energy, and Z is roughly "blue vs. yellow" energy.

{% figure id="xyz-transition" width="85%" caption="The sun's spectrum reduced to a single tristimulus value (X=95.047, Y=100, Z=108.883) and then to 2D chromaticity coordinates (x=0.3128, y=0.3290)." %}
  {% fig_img src="/images/color-management-thesis/spectrum-to-xyz-transition.png" width="100%" %}
{% endfigure %}

XYZ is turned into the familiar 2D chromaticity coordinates *xy* (dropping luminance) simply by normalizing:

{% equation id="xyy" %}
x = \frac{X}{X+Y+Z}, \qquad y = \frac{Y}{X+Y+Z}
{% endequation %}

Converting XYZ into an RGB working space should look *perceptually* similar no matter which space you land in. {% ref figure:colorcheckers %} shows the same real color-checker patches: their real xy positions on the left, then re-plotted inside sRGB and ACEScg. **In sRGB the patches crowd toward the center — the space physically cannot hold their real saturation — while in ACEScg they land almost exactly where their real coordinates say they should.**

{% figure id="colorcheckers" width="100%" caption="The same N Ohta color-checker patches: real xy chromaticity (left), plotted inside ACEScg (center, preserves the real color), and plotted inside sRGB (right, colors get compressed to fit the smaller gamut)." %}
  {% fig_img src="/images/color-management-thesis/colorchecker-real-xy.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/colorchecker-acescg.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/colorchecker-srgb.png" width="32%" %}
{% endfigure %}

This is why a sRGB screen, which can't reproduce every color, can still show a *difference* between two colors that are both technically outside its gamut — a green patch will look less saturated on an sRGB screen than on an ACEScg one (no screen can actually show the full ACES gamut, but the point stands for wide-gamut displays). Matching a real, known color across multiple devices is genuinely hard, and artistic decisions inevitably creep in to make the result "look more believable."

## RAW: a worked example of the full pipeline

RAW processing is a clean, concrete example of the whole color pipeline in miniature. In an **analog camera**, exposure blackens a photosensitive film; a **digital camera** replaces the film with a **sensor made of pixels**, each storing how many photons it received during the exposure. The sensor's dynamic range is limited by how many photons it can register at minimum and maximum, and by pixel noise and saturation — the camera (or the photographer) has to choose which slice of the light to keep.

{% figure id="sensor-photons" width="55%" caption="A camera sensor turning incoming photons into digital numbers (DN)." %}
  {% fig_img src="/images/color-management-thesis/sensor-photons-to-dn.png" width="100%" %}
{% endfigure %}

RAW formats vary by manufacturer (Nikon NEF, Canon CR2, Sony SR2, Pentax PTX, Olympus ORF, Fujifilm RAF, Panasonic RAW2…), but they all store the same kind of thing: a 2D matrix in **Bayer pattern**, one color per photosite, Scene-Referred. Getting from that matrix to a finished image follows a fixed sequence of steps:

**1. Black-level subtraction.** Even with zero light, a sensor's pixels register a small baseline signal specific to the camera hardware, which must be subtracted per channel before anything else.

{% figure id="raw-black-level" width="100%" caption="The raw Bayer matrix and its per-channel maximum before black-level subtraction." %}
  {% fig_img src="/images/color-management-thesis/raw-black-level-1.png" width="55%" %}
  {% fig_img src="/images/color-management-thesis/raw-black-level-2.png" width="43%" %}
{% endfigure %}

**2. White balance.** A per-channel multiplier that makes a chosen reference read as pure white, correcting for the scene's illuminant — this is usually stored right in the RAW file's metadata (e.g. `[1.74, 1, 1.58, 1]` for `[R, G, B, G]`).

{% figure id="raw-wb" width="100%" caption="White balance applied to a RAW image and its histogram — a per-channel multiplier that shifts the color balance toward neutral." %}
  {% fig_img src="/images/color-management-thesis/raw-white-balance-image.png" width="35%" %}
  {% fig_img src="/images/color-management-thesis/raw-white-balance-hist.png" width="55%" %}
{% endfigure %}

**3. Correct the light level** (only relevant in fixed-precision formats). A photographed scene's linear light typically spans about 14 EV, encoded in 14 bits. Editing that in a 16-bit-integer environment without rescaling makes the image look about 4× darker than it should — the fix is to redistribute those 14 bits of range across the full 16-bit container. (Working in float32, as most editing software does, avoids this problem entirely, since the image is normalized against its own maximum value.)

{% figure id="raw-clipping" width="100%" caption="Where the maximum representable value is set changes how bright the image looks, at the cost of losing detail in the brightest areas." %}
  {% fig_img src="/images/color-management-thesis/raw-clipped-14.png" width="35%" %}
  {% fig_img src="/images/color-management-thesis/raw-clipped-14-hist.png" width="55%" %}
  {% fig_img src="/images/color-management-thesis/raw-clipped-5000.png" width="35%" %}
  {% fig_img src="/images/color-management-thesis/raw-clipped-5000-hist.png" width="55%" %}
{% endfigure %}

**4. Highlight reconstruction.** After white balance, the red and blue channels usually clip above the green channel's own maximum — normalizing again produces an ugly cast, since green loses information the other two channels still have.

{% figure id="raw-highlight-problem" width="100%" caption="The white-balance histogram shows the green channel clipping before red and blue — left unfixed, this produces a visible color cast in the highlights." %}
  {% fig_img src="/images/color-management-thesis/raw-highlight-clip-hist.png" width="45%" %}
  {% fig_img src="/images/color-management-thesis/raw-highlight-clip-bad.png" width="49%" %}
{% endfigure %}

The simplest fix, **clip**, just discards the overflow and loses roughly 2/3 of an EV of highlight detail. A better one, **mean**, recovers that lost range by averaging the red and blue channels back into blown-out green pixels:

{% equation id="mean-highlights" %}
pixel_{G_i} = \begin{cases} (pixel_{R_i} + pixel_{B_i}) / 2, & pixel_{G_i} > \text{threshold} \\ pixel_{G_i}, & \text{otherwise} \end{cases}
{% endequation %}

{% figure id="raw-highlight-methods" width="100%" caption="Left: the simple clip method loses highlight detail. Right: the mean method recovers roughly 2/3 EV more range (the image looks darker only because the full dynamic range is now being shown)." %}
  {% fig_img src="/images/color-management-thesis/raw-highlight-method-clip.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/raw-highlight-method-mean.png" width="49%" %}
{% endfigure %}

More elaborate reconstruction methods exist too — reconstructing in LCh space from unclipped neighboring pixels, transferring color information from unclipped regions, or guided-Laplacian gradient propagation, all used by tools like darktable.

**5. Demosaicing.** The sensor is covered by a color filter that only lets specific wavelengths reach specific photosites — each pixel only ever records *one* channel natively. Demosaicing interpolates the missing two channels from neighboring pixels. The simplest scheme, **bilinear**, just averages same-channel neighbors:

{% equation id="bilinear-demosaic" %}
R_x = \tfrac{1}{4}(R_1+R_2+R_3+R_4), \quad B_x = \tfrac{1}{4}(B_1+B_2+B_3+B_4), \quad G_x = \tfrac{1}{4}(G_1+G_2+G_3+G_4)
{% endequation %}

{% figure id="demosaic" width="55%" caption="Bilinear demosaicing: each missing channel is the average of its same-channel neighbors." %}
  {% fig_img src="/images/color-management-thesis/demosaic-bilinear.png" width="100%" %}
{% endfigure %}

(More sophisticated schemes — Malvar2004, Menon2007, DDFAPD — do better by adapting to local edges and gradients instead of blindly averaging.)

**6. Color transformation and correction.** The sensor's RGB response doesn't match human perception, so the camera manufacturer photographs known color-checker patches and derives a 3×3 matrix that maps the camera's native RGB into CIE XYZ. That matrix ships in the RAW file's metadata.

{% figure id="colorchecker-patches" width="70%" caption="Reference color-checker patches — a printed chart with precisely known real-world XYZ values, and a photograph of the physical target." %}
  {% fig_img src="/images/color-management-thesis/colorchecker-chart.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/colorchecker-photo.jpg" width="49%" %}
{% endfigure %}

{% figure id="camera-matrix" width="70%" caption="The camera-to-XYZ matrix as stored in a RAW file's metadata, alongside its inverse." %}
  {% fig_img src="/images/color-management-thesis/raw-camera-matrix-metadata.png" width="100%" %}
{% endfigure %}

That raw matrix has one problem: a pure white input (R=G=B=1) needs to produce luminance Y=1, and it doesn't out of the box — so it gets renormalized against a chosen white-point illuminant (D65 for daylight, D50 for print viewing conditions, etc.) before use.

{% figure id="rgb-to-xyz" width="70%" caption="An image transformed into CIE XYZ with a D65 illuminant, working through the renormalized camera matrix." %}
  {% fig_img src="/images/color-management-thesis/raw-rgb-to-xyz.png" width="100%" %}
{% endfigure %}

Once the data sits in a standardized space, it can go anywhere — here, sRGB under both D65 and D50:

{% figure id="linear-images" width="100%" caption="The same RAW file converted to linear sRGB under two different white-point illuminants, D65 and D50." %}
  {% fig_img src="/images/color-management-thesis/raw-srgb-linear-d65.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/raw-srgb-linear-d50.png" width="49%" %}
{% endfigure %}

**7. Apply the transfer function (OETF).** Only at the very end does a curve like the sRGB OETF get applied — the sRGB space uses gamma = pixel^(1/2.2) going out to a display, and a display itself applies gamma = pixel^2.2 to invert it.

{% figure id="oetf-srgb" width="55%" caption="The sRGB OETF curve." %}
  {% fig_img src="/images/color-management-thesis/oetf-srgb-curve.png" width="100%" %}
{% endfigure %}

A **gamma function** is a pure exponential; an **OETF** is a more elaborate curve that doesn't have to follow a strict exponent, often written with a tilde (~gamma 2.2) to signal "close to, but not exactly." Applying the sRGB OETF is what turns the darker-looking linear renders above into a finished, displayable photograph:

{% figure id="raw-final" width="100%" caption="The finished, Display-Referred image — sRGB with its OETF applied, under D65 and D50 white points." %}
  {% fig_img src="/images/color-management-thesis/raw-final-srgb-d65.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/raw-final-srgb-d50.png" width="49%" %}
{% endfigure %}

## Why CGI isn't RAW

Computer-generated images work differently. There's no real light to demosaic — a renderer's "virtual sensor" is assumed lossless, printing exactly what the simulation computes, so final image quality is a function of the render engine rather than any camera-like artifact. That means CGI output can't correctly be called "RAW": there's no demosaic step, the stored values are already representable, the renderer starts from *some* declared color space with its own white point (shared by all the textures and lights in the scene), and curves are sometimes applied before storage anyway.

A common misconception is that formats like `.exr` or `.bmp` store "raw" data simply because they *can* carry linear values — they don't. They store Scene-Referred **renders**, computed inside whatever color space the renderer used, which brings us to the next point.

## Color spaces

A color space is defined by four things: a **color model** (RGB, CMYK, HSV…), a **gamut** (its primaries — the triangle of colors it can represent, plotted on a CIE diagram), a **white point** (D65, D50…), and a **transfer function**.

{% figure id="cie-diagrams" width="100%" caption="Left: the CIE 1931 chromaticity diagram with sRGB (D65) and ACEScg (D60) primaries plotted as triangles. Right: the same comparison in 3D (xyY), which reveals how highlights saturate and desaturate differently between spaces — a behavior the flat 2D diagram hides." %}
  {% fig_img src="/images/color-management-thesis/cie1931-diagram.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/xyy-3d-diagram.png" width="49%" %}
{% endfigure %}

Most applications don't let you freely choose a working color space — it comes baked into the software. Blender defaults to sRGB D65; DaVinci Resolve works in its own DaVinci YRGB space. **OpenColorIO (OCIO)** {% cite OpenColorIO %} exists to let different tools share one configurable pipeline instead of each hard-coding its own.

### How the render space itself changes the image

This is the thesis's central practical warning. Unlike a simple space-to-space conversion (which *does* preserve chromaticity), **the color space a renderer computes in has a direct effect on the final colors**, independent of anything that happens afterward.

{% figure id="tree-comparison" width="100%" caption="The same scene, sRGB-defined colors, rendered natively in ACEScg (left two) vs. natively in sRGB (right two) — both pairs shown before and after conversion to a common space. The results are visibly different even though the source colors were identical." %}
  {% fig_img src="/images/color-management-thesis/tree-acescg-native.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/tree-acescg-to-srgb.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/tree-srgb-to-acescg.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/tree-srgb-native.png" width="24%" %}
{% endfigure %}

This happens because sRGB's maximum green and ACEScg's maximum green are **not the same green** — sRGB's brightest green renders as a mid-green inside ACEScg — even though to a human viewer both still read as roughly "the same" green.

{% figure id="primaries-comparison" width="70%" caption="sRGB's maximum-saturation green, plotted inside the ACEScg gamut (left) and the sRGB gamut (right): the same nominal color sits in very different places." %}
  {% fig_img src="/images/color-management-thesis/aces-green-primary.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/srgb-green-primary.png" width="49%" %}
{% endfigure %}

This is the core argument for treating **ACES-like wide-gamut spaces as the working space for computation**: calculations happen against colors closer to what human eyes can actually see, and only get compressed down to a narrower delivery space (sRGB, Rec.709…) at the very end.

### Rolling off to white

Interpreting channel luminosity also matters — via OETFs or LUTs. What happens if a linear ACEScg image and a linear sRGB image are both converted to sRGB (OETF included)?

{% figure id="gradient-oetf" width="80%" caption="A pure sRGB OETF applied to a color gradient. Very bright colors freeze into a single hue — 'the notorious six' — instead of rolling smoothly toward white." %}
  {% fig_img src="/images/color-management-thesis/gradient-srgb-oetf.jpg" width="100%" %}
{% endfigure %}

At very high intensities, colors freeze into pure primaries instead of rolling toward white — "the notorious six" {% cite Brejon_2021 %}. The usual artistic fix is a more elaborate LUT, like the one Blender's Filmic view transform uses, that bends those highlights back toward white instead of clipping into a saturated primary:

{% figure id="gradient-filmic" width="80%" caption="The same gradient through a Filmic-style sRGB OETF — highlights now roll smoothly toward white instead of freezing into a saturated hue." %}
  {% fig_img src="/images/color-management-thesis/gradient-filmic-srgb-oetf.jpg" width="100%" %}
{% endfigure %}

A "roll-off to white" like this is usually built from three stages: an **allocation** step that reshapes Scene-Referred light into Display-Referred space with a log-like curve (log2, Cineon…); a **LUT or matrix** that actually bends the highlights toward white (Blender ships this as a 3D cube LUT; AgX uses a fixed 3×3 matrix instead); and finally a standard **OETF** like sRGB to add the contrast a display needs.

The effect is visible directly on a rendered scene, not just a gradient — the same spheres, lit identically, render noticeably differently depending on whether the computation happened in sRGB or in ACEScg:

{% figure id="spheres-comparison" width="100%" caption="The same lighting setup, rendered in sRGB (left) vs. ACEScg (right), both shown after conversion back to sRGB for comparison." %}
  {% fig_img src="/images/color-management-thesis/spheres-rendered-srgb.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/spheres-rendered-acescg.png" width="49%" %}
{% endfigure %}

### Converting between spaces

Moving data cleanly from one color space to another (assuming linear gamma) is a chain of well-defined matrix multiplications: from a working space like ACEScg into the ACES AP0 primaries, from AP0 into CIE XYZ, then — through a **Profile Connection Space (PCS)**, almost always XYZ — a chromatic-adaptation step that re-maps the white point (Bradford being the most common adaptation matrix in practice), and finally from XYZ into the destination space, such as sRGB. Every well-behaved OCIO config implements exactly this chain; the practical takeaway is less about memorizing the matrices and more about knowing *that this chain exists* and trusting your tools' bundled configs (Blender's, Nuke's, Resolve's…) rather than re-deriving it by hand.

## Dynamic range and bit depth are not the same thing

In a real scene, dynamic range is potentially **infinite**, and has to be compressed into a storable range before it can be processed at all. A RAW file stores 12–14 bits {% cite Raw_bit_depth %}, which — in a perfect noiseless sensor — corresponds almost 1:1 to 12–14 EV of dynamic range; each extra bit doubles that range, and new bits are spent on the highlights.

{% figure id="bitdepth-evs" width="90%" caption="12 bits of RAW data distributed across EVs of dynamic range — half the available codes go to the brightest single stop." %}
  {% fig_img src="/images/color-management-thesis/bitdepth-evs.png" width="100%" %}
{% endfigure %}

**Bit depth and dynamic range are not the same thing**, though it's an easy conflation to make. A signal can be encoded with a tiny number of bits and still cover a huge range — 2 bits give 4 quantization steps, and a 0–1000 range can technically be encoded correctly (if uselessly) in those 4 steps. What more bits actually buy you is enough intermediate tones to avoid visible **banding**: too few gray levels between black and white, most noticeable in the shadows where human vision is most sensitive to small steps.

{% figure id="six-grays" width="55%" caption="sRGB encoded with only six tones of gray — the same dynamic range as a normal 8-bit image, just far too few steps to look smooth." %}
  {% fig_img src="/images/color-management-thesis/gray-steps-banding.png" width="100%" %}
{% endfigure %}

For CGI it's more useful to describe a curve by its **minimum encoded value, maximum encoded value, bit depth, and whether it uses a log-like reallocation** than by "stops," since the same 8-bit container can represent wildly different dynamic ranges depending on which curve is applied:

{% figure id="dr-comparison" width="100%" caption="Three 8-bit images with identical bit depth but very different dynamic range: sRGB (0–1), Filmic sRGB (2⁻¹².⁴⁷ – 4.03), and Filmic Log (2⁻¹².⁴⁷ – 12.53)." %}
  {% fig_img src="/images/color-management-thesis/dr-srgb.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/dr-filmic-srgb.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/dr-filmic-log.png" width="32%" %}
{% endfigure %}

Formats that can only store values between 0 and 1, like PNG, get no benefit from extra bit depth for highlights — every extra bit just adds resolution to the shadows, since the highlights are already clipped at 1.0 regardless of bit depth. Push a wide dynamic range through too few bits and banding artifacts appear exactly where the display curve compresses the most:

{% figure id="png-bitdepth" width="100%" caption="The same logarithmically-encoded image at 32-bit, 16-bit and 8-bit — visible banding appears only once there aren't enough steps left to represent the curve smoothly." %}
  {% fig_img src="/images/color-management-thesis/png-32bit-log.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/png-16bit-log.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/png-8bit-log.png" width="32%" %}
{% endfigure %}

Even so, the 0–1 range by itself carries a lot of usable information — a well-exposed sRGB image still reads fine several stops under its nominal exposure:

{% figure id="ev-range" width="100%" caption="The same sRGB 8-bit image at -1 EV and -5 EV — the 0–1 range alone still holds enough detail to read the scene." %}
  {% fig_img src="/images/color-management-thesis/exposure-neg1ev.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/exposure-neg5ev.png" width="49%" %}
{% endfigure %}

For images meant for **further manipulation** — compositing, CGI integration — you generally need more headroom than a straight 0–1 image gives you, and there are three ways to get it: more bit depth (best quality and versatility, at a real disk-space cost); a specialized, non-pretty log-like OETF that trades highlight resolution for extra shadow detail; or a format built to combine both, like DPX, which supports selectable bit depth *and* an optional CINEON log curve in the same container.

## Transfer functions, OETFs and LUTs

An **OETF (Opto-Electric Transfer Function)** reshapes light so shadows get better resolution (avoiding banding) and highlights compress into the 0–1 range (tone mapping). OETFs meant for final display are usually tuned to *look* good at low bit depth — expressed as a "perceptually linear" gradient, which is not the same as a physically linear one: a purely linear gradient's darkest step reads as a huge jump from pure black, while its brightest steps are barely distinguishable from each other.

{% figure id="gray-gradients" width="55%" caption="A linear gradient reshaped by different Display-Referred OETFs — each aims for a step size that looks evenly spaced to human eyes, not evenly spaced numerically." %}
  {% fig_img src="/images/color-management-thesis/oetf-gray-gradients.png" width="100%" %}
{% endfigure %}

Other OETFs exist purely to **preserve information** for later use rather than to look pleasant — the log curves. Recovering a scene's real linear values later is dramatically easier from a log-encoded image than from a straight Display-Referred one:

{% figure id="log-vs-linear" width="80%" caption="Pushing exposure on a linear image vs. a log-encoded one — the log-encoded version holds together far better because it was built to preserve highlight detail, not to look correct as-is." %}
  {% fig_img src="/images/color-management-thesis/log-vs-linear-exposure.jpg" width="100%" %}
{% endfigure %}

A handful of well-known log curves, each trading shadow/highlight allocation slightly differently — Filmic Log, Log2, LogC (ARRI), S-Log2 (Sony):

{% figure id="log-curves" width="100%" caption="Four common log transfer curves applied to the same test image: Filmic Log, Log2, LogC800, S-Log2." %}
  {% fig_img src="/images/color-management-thesis/curve-filmiclog-render.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/curve-lg2-render.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/curve-logc800-render.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/curve-slog2-render.png" width="24%" %}
{% endfigure %}

To be precise about terms: **OETFs are the mathematical functions** applied to reshape values between linear and non-linear color — this includes gammas, LUTs, and Look Modification Transforms. The sRGB OETF, for instance, is a piecewise function rather than a single clean exponent:

{% equation id="srgb-oetf" %}
V_{out} = \begin{cases} 12.92\,V_{in}, & V_{in} \le 0.0031308 \\ 1.055\,V_{in}^{1/2.4} - 0.055, & V_{in} > 0.0031308 \end{cases}
{% endequation %}

**LUTs**, meanwhile, are just lookup tables that map inputs to outputs — the mechanism most complex OETFs and creative looks are actually *stored* as, since curves like sRGB and rec.709 rarely get re-derived from formula every time a program needs them. A 1D LUT handles the transfer curve; a 3D `.cube`/`.spi3d` LUT can additionally handle full-color creative looks by accounting for every possible input combination at once.

## Open Color IO

**OCIO** {% cite OpenColorIO %} is a complete, open-source color-management solution built for film and VFX production. It gives every compatible application a consistent user experience while allowing very sophisticated configuration underneath, and it's ACES-aware and LUT-format-agnostic.

An OCIO config is a single `config.ocio` file: it declares a Profile Connection Space, named color spaces with `to_reference`/`from_reference` transforms (LUTs, matrices, 3D cubes), a set of *displays* and *views*, and *roles* mapping generic names like `scene_linear` to a concrete space. Nuke, Blender and Resolve each ship their own config tuned to their own render space and LUTs — using one of these proven configs, rather than writing your own from scratch, avoids most conversion mistakes.

Blender's stock config is a good worked example of a "roll-off to white": its `Filmic Log` color space allocates Scene-Referred light onto a log2 curve spanning roughly -12.47 to +12.53 stops, runs it through a desaturating 3D LUT (`filmic_desat65cube.spi3d`), and only then does `Filmic sRGB` chain that log space into a final 1D LUT and display OETF.

## Image formats

The industry generally settles on high-bit-depth formats (16–32 bit) for CGI and VFX work — 16-bit PNG, 16–32-bit EXR, 16-bit TIFF — and they differ mainly in *what the stored values actually represent*:

| Format | Bit depth | Data type | Color space |
|---|---|---|---|
| BMP | 8 | uint | OETF |
| PNG | 8, 16 | uint | OETF |
| JPEG {% cite 9418160 %} | 8 | uint | OETF |
| JPEG 2000 {% cite 9418160 %} | 8, 12, 16 | uint | OETF |
| Targa {% cite TruevisionTGA %} | 8, 15, 16, 24, 32 | uint | OETF |
| Cineon {% cite UnderstandingCineon %} | 8, 10, 12, 16 | uint | linear (log-encoded) |
| DPX {% cite 7291593 %} | 8, 10, 12, 16 | uint | linear (log-encoded) |
| OpenEXR {% cite Technical_Introduction_to_OpenEXR %} | 16, 32 | float / half-float | linear |
| Radiance HDR {% cite Guertault_Guertault_2013 %} | 8 | uint (RGBE) | linear |
| TIFF {% cite TIFF %} | 8, 16 | uint | OETF |
| WebP {% cite DotWhat_net %} | 8 | uint | OETF |

**OpenEXR** is the default choice for CGI production because of its float precision and arbitrary multi-channel layout (color, normals, cryptomatte IDs, all in one file). Its half-float encoding stores more precision near zero than near its maximum {% cite reusser_2021 %}, mirroring how humans perceive brightness — which is exactly why applying a display transfer function *before* saving to EXR (instead of after) throws away the format's main advantage. That flexibility has a real disk-space cost, though: a 150-frame 1080p sequence ranges from tens of megabytes (WebP, JPEG) up to several **gigabytes**, depending on the EXR compression scheme chosen — the "just use EXR for everything" instinct needs to be weighed against actual project needs.


# Display technology

Consumer HDR technology (Dolby Vision, HDR10, HDR10+) typically works at 10–12 bit depth with Rec.2020 primaries and a **PQ (Perceptual Quantizer)** transfer function {% cite 8445022 %}, designed so a fixed number of code values maps to visually even steps of *absolute* brightness — unlike SDR curves, which are relative to a reference white. HDR10 targets 10 bits as enough to avoid visible banding; Dolby Vision uses 12. Since PQ is incompatible with the Rec.709 curve SDR displays use, HDR and SDR masters are usually graded as two separate deliverables from the same source.

{% figure id="dolby-pq" width="70%" caption="The Dolby PQ EOTF and the banding it avoids, as a function of bit depth." %}
  {% fig_img src="/images/color-management-thesis/dolby-pq-eotf.jpg" width="100%" %}
{% endfigure %}


# A proposed open color pipeline

Building on all of the above, the thesis proposes a small, coherent color-management scheme aimed at VFX/CGI generalists: **Rec.2020** as the working (rendering) space — its gamut sits close to a full spectral render {% cite Langlands %} while staying inside the CIE 1931 horseshoe (unlike ACEScg, which extends slightly beyond it) — paired with a Display Rendering Transform based on Jed Smith's **OpenDRT** {% cite Smith %}: gamut mapping from the render space to the output space, a tone scale, and chroma-preserving compression toward white in the highlights.

{% figure id="opendrt-gradient" width="100%" caption="The same color gradient run through the proposed OpenDRT-based transform from three different working-space primaries: ACEScg, Rec.2020, and Rec.709." %}
  {% fig_img src="/images/color-management-thesis/opendrt-acescg.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/opendrt-rec2020.png" width="32%" %}
  {% fig_img src="/images/color-management-thesis/opendrt-rec709.png" width="32%" %}
{% endfigure %}

That pipeline became an actual OCIO config and a set of 3D LUTs, generated with a small Python routine that samples a 65³ cube, converts each sample from Display-Referred back to Scene-Referred, runs it through the DRT, and re-encodes the resulting table — the same kind of workflow Chris Brejon discusses {% cite Brejon_2021 %} for OCIO display transforms. On a real test scene, the OpenDRT transform holds onto the best reflections and emissive-material highlights, while the other transforms give a subjectively different "sense of luminosity":

{% figure id="rec2020-comparison" width="100%" caption="The same scene, rendered in Rec.2020, run through four different display transforms: Filmic sRGB, plain sRGB, the proposed OpenDRT, and ACES sRGB." %}
  {% fig_img src="/images/color-management-thesis/rec2020-filmic.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/rec2020-srgb.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/rec2020-opendrt.png" width="24%" %}
  {% fig_img src="/images/color-management-thesis/rec2020-aces-srgb.png" width="24%" %}
{% endfigure %}


# Study Image: a node-based tool for studying color

The concrete software contribution is **Study Image**, a lightweight, node-based application written entirely in Python (`dearpygui`), built to fill a specific gap: none of the mainstream tools are both *fast to open* and *simple to extend*. Blender doesn't load RAW files; Nuke opens raw images and does node compositing well but has a steep learning curve for a generalist; Photoshop and Lightroom are the usual stopgap for RAW-to-standard-format conversion.

Design goals were explicit: lightweight and fast (no heavier than needed just to inspect images and color spaces); visual and step-by-step (every operation inspectable, not a black box); OCIO-native (color management goes through real OCIO configs, portable to Blender, Nuke or Resolve); and simple, hackable code (a new node is a plain Python function plus a small class — no plugin SDK to learn).

## How the node graph executes

Node-based applications typically execute *asynchronously*, working backward from a single output node and calling only the upstream nodes actually needed:

{% figure id="nodes-async" width="70%" caption="Asynchronous execution: nodes are called (C) from the output backward, each returning a result (R) only when needed." %}
  {% fig_img src="/images/color-management-thesis/nodes-async-execution.png" width="100%" %}
{% endfigure %}

Study Image deliberately does the opposite: it can have **multiple independent output nodes** rather than one single sink, which complicates a purely output-driven executor. Instead, it runs **synchronously, forward from any modified node** — every node caches its own output and a record of "already executed" nodes; changing a node clears that record for itself and everything downstream, and only that subgraph re-runs:

{% figure id="nodes-sync" width="100%" caption="Synchronous forward execution. Left: normal state, every node executed once. Right: after editing one node, it and everything downstream drop out of the executed list and re-run." %}
  {% fig_img src="/images/color-management-thesis/nodes-sync-execution.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/nodes-sync-modified.png" width="49%" %}
{% endfigure %}

The one wrinkle this design has to handle explicitly: a node that depends on other nodes which haven't executed yet must wait its turn rather than running with stale or missing inputs.

{% figure id="nodes-complex" width="60%" caption="A branch that depends on not-yet-executed inputs waits until they're resolved before running — no node ever executes twice in the same pass, and none runs ahead of its own dependencies." %}
  {% fig_img src="/images/color-management-thesis/nodes-sync-complex-case.png" width="100%" %}
{% endfigure %}

## Building a node

Every node follows the same three-part layout — a **header** (name, plus a shared debug line with execution time and node ID), a **static** area for custom widgets the user adds freely, and colored **pins** for inputs/outputs:

{% figure id="node-anatomy" width="55%" caption="The three parts of a node: header, static area, and pins." %}
  {% fig_img src="/images/color-management-thesis/node-anatomy.png" width="100%" %}
{% endfigure %}

A minimal new node is just a function plus a small subclass declaring its title, its input/output pin names, and any custom widgets to place in the static area — no plugin SDK, just plain Python:

```python
def exposition(val1, val2, *argss):
    return [val1 ** val2]

class Exposition(NodeV2):
    Title = "Exposition"
    def __init__(self):
        inp_list = {"val": {"slider": {"width": 120}},
                     "exp": {"value": {"width": 120, "format": '%.8f'}}}
        out_list = ["val"]
        super().__init__(exposition, inp_list, out_list, self.Title)
```

Input pins can carry small interactive widgets (a slider, a numeric field) that disappear automatically the moment another node gets connected to that pin:

{% figure id="node-inputs" width="70%" caption="Input pins with an attached widget — the slider vanishes once an upstream node is wired into that pin." %}
  {% fig_img src="/images/color-management-thesis/node-custom-inputs.png" width="100%" %}
{% endfigure %}

## What it does

- **RAW image processing** — the full pipeline described above, exposed as inspectable nodes.
- **Loading a wide range of formats** — JPG, PNG, HDR, TIFF, EXR, DPX and more.
- **Full OCIO-based color management** and transforms.
- Image viewing and saving.
- Tools for catching color-management artifacts before they reach a shot — false-color exposure checks, side-by-side transform comparisons.
- A simple API for adding new nodes with custom, user-defined functions.

{% figure id="app-screenshots-1" width="100%" caption="RAW processing exposed as a node graph (left), and loading images across a wide range of formats — JPG, PNG, HDR, TIFF, EXR, DPX and more (right)." %}
  {% fig_img src="/images/color-management-thesis/app-raw-processing.png" width="49%" %}
  {% fig_img src="/images/color-management-thesis/app-load-formats.png" width="49%" %}
{% endfigure %}

{% figure id="app-ocio" width="80%" caption="OCIO-based color transforms applied directly inside the node graph." %}
  {% fig_img src="/images/color-management-thesis/app-ocio-transforms.png" width="100%" %}
{% endfigure %}

## A worked example: building a LUT from scratch

A full color-pipeline workflow — from a loaded image through a color transform to a saved LUT — collapses into a handful of connected nodes:

{% figure id="app-workflow" width="90%" caption="A complete workflow graph: load an image, apply a saturation transform, preview it, and export the result as a LUT." %}
  {% fig_img src="/images/color-management-thesis/app-workflow-example.jpg" width="100%" %}
{% endfigure %}

{% figure id="app-lut-example" width="90%" caption="The same workflow in practice inside Study Image." %}
  {% fig_img src="/images/color-management-thesis/app-lut-creation-example.png" width="100%" %}
{% endfigure %}

## Catching problems before they reach a shot

Study Image includes a **False Color** exposure tool that segments an image's luminance into bands, making it easy to spot clipped highlights or crushed shadows at a glance — this is the screenshot used as this post's header image:

{% figure id="false-color" width="90%" caption="Exposure checking with a False Color technique — luminance bands make clipping and crushed shadows immediately visible." %}
  {% fig_img src="/images/color-management-thesis/header-comprobar-luz.png" width="100%" %}
{% endfigure %}

It also makes comparing color transforms fast — side by side, instead of one at a time:

{% figure id="drt-comparison" width="90%" caption="Comparing several Display Rendering Transforms side by side on the same source image." %}
  {% fig_img src="/images/color-management-thesis/app-drt-comparison.png" width="100%" %}
{% endfigure %}

The full source is on GitHub: [Study-Image-Code](https://github.com/UPV-TFG-Carles-Matoses-Gimenez/Study-Image-Code).


# A Blender color-management addon

Blender's built-in color management is intentionally minimal — one OCIO config, one input transform per image, one output space. As a companion to the thesis, I built an addon that lets you switch between custom OCIO configs stored anywhere in your Blender config (not just the bundled one), adds built-in support for ACEScg/ACES, AgX base and looks, Cineon Log, and in-program switching of the *render-time* working space (sRGB vs. ACEScg primaries), and ships an expanded internal config (`blender_Advanced`) adding AgX and Filmic looks, the experimental OpenDRT transform from this thesis, ACES output transforms, a reorganized [sRGB, XYZ, Utils] display layout, and naming consistent between Blender's and ACES' own conventions.

{% figure id="blender-addon" width="70%" caption="The custom OCIO config switcher addon running inside Blender." %}
  {% fig_img src="/images/color-management-thesis/blender-addon-screenshot.jpg" width="100%" %}
{% endfigure %}


# Conclusion

Unifying camera-captured and computer-generated imagery under one color pipeline is not a solved problem — it depends on the specific cameras, renderers, and delivery targets involved. But a two-stage separation, computing in a space that covers the visible spectrum and applying a single, well-understood Display Rendering Transform on the way out, gives CGI the same starting point as photographed material: comparable storage requirements, the same dynamic-range characteristics, and identical behavior under color grading — turning what is usually a case-by-case integration headache into a standard, repeatable process.


# Bibliography
{% bibliography ieee %}
