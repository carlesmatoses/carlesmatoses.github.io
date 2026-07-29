---
layout: post
title:  "Color Management for Multimedia Applications"
date:   2026-07-28 20:00:00 +0200
preview: "/images/image-not-found.png"
categories: project # post, project
permalink: project/color-management-thesis
---

This is the digital version of my **bachelor's thesis**, *Development of an Application for Color Management in Multimedia Environments*. It is a from-scratch introduction to digital color science — from the physics of light to how Blender or DaVinci Resolve actually process a pixel — paired with **Study Image**, a node-based Python application I built to make color spaces, transfer functions and image formats visible and testable instead of theoretical.

<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}

{% bibliography_loader _bibliography/color_management_references.bib %}


# Motivation

Digital color science is the study of how colors are created, measured, captured, reproduced and perceived across digital systems {% cite Homann2009 %} — a field that spans far more ground than "color management" alone. Free material on it tends to be scattered and incomplete: a post explains gamma, another explains gamuts, a third explains RAW processing, and none of them connect into a full picture of what happens to an image between capture and display. Having worked as a VFX, compositing and color grading supervisor on several university productions, I kept running into the same gap — artists and generalists picking up half-explained terminology and, as a result, misconfiguring color pipelines in ways that are hard to diagnose later.

This thesis tries to close that gap with two things: a complete, ordered explanation of color management aimed at artists rather than engineers, and a piece of software, **Study Image**, that lets you *see* the concepts — color space primaries, transfer functions, dynamic range, file formats — instead of taking them on faith.

{% alert %}
A recurring theme throughout the thesis: **the render color space itself changes the final image**, independently of any later color-space conversion. Two scenes lit with identical sRGB-defined colors but rendered internally in sRGB vs. ACEScg do not converge to the same result after converting both back to sRGB — the highlights saturate and roll off differently. This is one of the most under-documented behaviors in day-to-day CG color work, and a large part of the thesis is spent making it legible.
{% endalert %}


# Scene-Referred vs. Display-Referred

Two concepts run through the whole pipeline:

- **Scene-Referred** — values that represent the linear light of a real (or simulated) scene, exactly as captured.
- **Display-Referred** — values that have been reshaped, usually with a perceptual/logarithmic curve, to be shown on a screen.

A camera (or a renderer) produces Scene-Referred data; a monitor consumes Display-Referred data. Almost every artifact and confusion in color pipelines traces back to applying an operation meant for one domain to data that is actually in the other.


# From spectra to digital RGB

Real light is rarely a single wavelength — it is a spectrum, and the surfaces it bounces off reflect a *new*, altered spectrum {% cite inbook %}: the same reason artificial lighting can make some colors glow and others go flat (a UV blacklight is the extreme case, but the effect scales down to any narrow-spectrum LED source). Light intensity itself is measured in different units depending on context — candela, nits, or the radiometric watts a render engine works in {% cite blenderlight %} — and it's worth keeping the units straight before comparing numbers across tools. To make spectra representable digitally, the CIE defined the **CIE 1931 XYZ** color space {% cite CIE015 %}: a space built from human cone-response experiments (Wright and Guild) so that any spectrum a human can perceive maps to three tristimulus values, X, Y and Z, with Y carrying luminance.

XYZ can be re-expressed as chromaticity coordinates *xy* (dropping luminance) by normalizing over X+Y+Z — this is the familiar horseshoe-shaped CIE chromaticity diagram. Every RGB color space is then just a **triangle of primaries plus a white point** carved out of that XYZ horseshoe. Two consequences of this matter a lot in practice:

- A color space with primaries closer to the edges of the horseshoe (like ACEScg) preserves saturation differences between out-of-sRGB-gamut colors that a narrower space (like sRGB) has to compress toward its own boundary — the same green patch looks more saturated in a wide-gamut space simply because there is more room to place it.
- Converting *between* well-defined color spaces (sRGB ↔ ACEScg, same white point) is a linear, information-preserving operation — chromaticity is conserved. The catch, covered below, is that **rendering directly inside a wide space is not the same operation as converting into it afterward**.


# RAW: a worked example of the full pipeline

Digital camera RAW processing is a clean, concrete example of the whole color pipeline in miniature, so the thesis walks through it step by step:

1. **Black-level subtraction** — remove the sensor's baseline noise floor, per channel.
2. **White balance** — a per-channel multiplier so a chosen reference looks neutral, correcting for the scene's illuminant.
3. **Highlight reconstruction** — after white balance, the R/B channels usually clip before G does; algorithms like *clip* or *mean-of-neighbors* recover part of that lost range.
4. **Demosaicing** — the sensor's Bayer filter (one color per photosite) is interpolated into full RGB per pixel — from simple bilinear averaging to more elaborate schemes (Malvar2004, Menon2007, DDFAPD).
5. **Color transformation** — the camera's native RGB response is mapped to a standard space (e.g. sRGB) via a 3×3 matrix derived from photographing calibrated color patches, then re-normalized so a chosen white illuminant (D65, D50…) maps to pure white.
6. **Apply the transfer function (OETF)** — only at the very end is a curve like the sRGB OETF applied, converting the Scene-Referred linear data into something a Display-Referred pipeline can show.

Camera RAW is Scene-Referred; a common misconception is that formats like `.exr` or `.bmp` are "RAW" simply because they can carry linear values — they are not. They store Scene-Referred *renders*, not sensor data, and were never subject to a demosaic step.


# Why CGI is not RAW, and why the render space matters

A renderer's "virtual sensor" is assumed lossless: whatever the simulation computes, it prints. That means the final image quality is a function of the render engine, not of any camera-like artifact — but it also means the color space chosen *for rendering itself* has a direct effect on the result, independent of any later conversion.

The thesis demonstrates this with a matched pair of renders: the same scene, same sRGB-defined material colors, rendered once entirely inside sRGB and once entirely inside ACEScg, both then converted back to sRGB for comparison. The two images are visibly different — not because the conversion is wrong, but because sRGB's narrow primaries clip and desaturate colors *during* the light transport itself, before any output transform runs. This is the basis for the thesis's argument that **ACES-like wide-gamut spaces should be the working space for computation**, with narrower spaces reserved for final display.


# Color spaces and OCIO

A color space is defined by four things: a **color model** (RGB, CMYK, HSV…), a **gamut** (its primaries), a **white point**, and a **transfer function**. Most applications don't let you choose freely — Blender defaults to sRGB D65, DaVinci Resolve works internally in its own DaVinci YRGB space. **OpenColorIO (OCIO)** {% cite OpenColorIO %} exists precisely to let different applications share a consistent, configurable color pipeline instead of each hard-coding its own.

An OCIO config declares a Profile Connection Space (PCS, usually XYZ or a linear reference space), a set of named color spaces with `to_reference`/`from_reference` transforms (implemented as LUTs, matrices, or 3D cubes), a set of *displays* and *views*, and *roles* that map generic names (`scene_linear`, `default_byte`…) to concrete spaces. Blender's stock config, examined in detail in the thesis, is a good example of how a filmic "roll-off to white" is built: an allocation transform into log space, a 3D LUT that desaturates highlights, and a final display OETF.


# Dynamic range and bit depth are not the same thing

**Dynamic range** is simply the ratio between a signal's maximum and minimum value — a scene, a sensor, or a display all have one, independently of how many bits are used to store it. Confusing "range" with "bit depth" is one of the most common misunderstandings the thesis pushes back on: you *can* encode a 0–1000 range in 2 bits (4 quantization steps), it will just look terrible, because the visible artifact of too few bits — banding — comes from **too few gray levels**, not from a smaller range.

What bit depth actually buys you is enough intermediate tones to avoid visible banding, especially in the shadows where human vision is most sensitive to small steps — which is also why a RAW file's 12–14 bits {% cite Raw_bit_depth %} are not "the dynamic range," just the resolution it's stored at. This is also why float formats matter for CGI: a `.exr` half-float stores more precision near zero than near its maximum {% cite reusser_2021 %}, mirroring how humans perceive brightness — which is exactly why applying a display transfer function *before* saving to EXR (instead of after) throws away the format's main advantage.


# Image formats

The thesis surveys the common image formats used across VFX/CGI and photography pipelines, comparing channel support, compression, and whether they store Scene-Referred linear data or Display-Referred encoded data: BMP {% cite MicrosoftBMP %}, PNG {% cite PNGIntro %}, JPEG and JPEG2000 {% cite 9418160 %}, Targa {% cite TruevisionTGA %}, Cineon {% cite UnderstandingCineon %}, DPX {% cite 7291593 %}, OpenEXR {% cite Technical_Introduction_to_OpenEXR %}, Radiance HDR {% cite Guertault_Guertault_2013 %}, TIFF {% cite TIFF %}, and WebP {% cite DotWhat_net %}.

The practical takeaway: **OpenEXR** is the default choice for CGI production because of its float precision and arbitrary multi-channel layout (color, normals, cryptomatte IDs, etc. all in one file), but that flexibility comes at a real disk-space cost — a 150-frame 1080p sequence can range from tens of megabytes (WebP, JPEG) to several **gigabytes** depending on the EXR compression scheme chosen, so the "just use EXR for everything" instinct needs to be weighed against actual project needs.


# HDR displays

Consumer HDR technology (Dolby Vision, HDR10, HDR10+) typically works at 10–12 bit depth with Rec.2020 primaries and a **PQ (Perceptual Quantizer)** transfer function {% cite 8445022 %}, designed so that a fixed number of code values maps to visually even steps of *absolute* brightness — unlike SDR curves, which are relative. Since PQ is incompatible with the Rec.709 curve used by SDR displays, HDR and SDR masters are usually graded as two separate deliverables from the same source.


# A proposed open color pipeline

Building on all of the above, the thesis proposes a small, coherent color-management scheme aimed at VFX/CGI generalists: **Rec.2020** as the working (rendering) space — its gamut is close to a full spectral render {% cite Langlands %} while staying inside the CIE 1931 horseshoe (unlike ACEScg, which extends slightly beyond it) — paired with a Display Rendering Transform based on Jed Smith's **OpenDRT** {% cite Smith %}: gamut mapping from the render space to the output space, a tone scale (based on Daniele Siragusano's ACES-forum proposal), and a chroma-preserving compression toward white in the highlights.

That pipeline was turned into an actual OCIO config and a set of 3D LUTs, generated with a small Python routine that samples a 65³ cube, converts each sample from Display-Referred back to Scene-Referred, runs it through the DRT, and re-encodes the resulting table — the same kind of workflow discussed by Chris Brejon {% cite Brejon_2021 %} in the context of OCIO display transforms.


# Study Image: a node-based tool for studying color

The concrete software contribution of the thesis is **Study Image**, a lightweight, node-based application written entirely in Python (using `dearpygui`), built to fill a specific gap: none of the mainstream tools are both *fast to open* and *simple to extend*. Blender doesn't load RAW files; Nuke opens raw images and does node compositing well but has a steep learning curve for a generalist; Photoshop and Lightroom are the usual stopgap for RAW-to-standard-format conversion.

Design goals were explicit:

- **Lightweight and fast** — no heavier than it needs to be for inspecting images and color spaces.
- **Visual and step-by-step** — every operation should be inspectable, not a black box.
- **OCIO-native** — color management goes through real OCIO configs, so anything built here is portable to Blender, Nuke, or Resolve.
- **Simple, hackable code** — a new node is a Python function plus a small class; no plugin SDK to learn.

Each node follows a fixed three-part layout (header, a *static* area for custom widgets, and input/output pins), and the graph executes **synchronously, forward from modified nodes**, re-running only the downstream chain instead of re-evaluating the whole graph on every change — a deliberate trade-off against a fully async/output-driven executor, chosen because Study Image can have multiple independent output nodes rather than one single sink.

What it does today:

- RAW image processing (the pipeline described above, exposed as inspectable nodes)
- Loading a wide range of formats: JPG, PNG, HDR, TIFF, EXR, DPX, and more
- Full OCIO-based color management and transforms
- Image viewing and saving
- Tools for catching color-management artifacts before they reach a shot (false-color exposure checks, side-by-side transform comparisons)
- A simple API for adding new nodes with custom, user-defined functions

The full source is on GitHub: [Study-Image-Code](https://github.com/UPV-TFG-Carles-Matoses-Gimenez/Study-Image-Code).


# A Blender color management addon

Blender's built-in color management is intentionally minimal — one OCIO config, one input transform per image, one output space. As a companion to the thesis, I built an addon that:

- Lets you switch between custom OCIO configs stored anywhere in your Blender config, not just the bundled one.
- Adds built-in support for ACEScg/ACES, AgX base and looks, Cineon Log, and in-program switching of the *render-time* working space (sRGB vs. ACEScg primaries).
- Ships an expanded internal config (`blender_Advanced`) adding AgX and Filmic looks, the experimental OpenDRT transform from this thesis, ACES output transforms, a reorganized [sRGB, XYZ, Utils] display layout, and consistent naming between Blender's and ACES' own conventions.


# Conclusion

Unifying camera-captured and computer-generated imagery under one color pipeline is not a solved problem — it depends on the specific cameras, renderers, and delivery targets involved. But a two-stage separation, computing in a space that covers the visible spectrum and applying a single, well-understood Display Rendering Transform on the way out, gives CGI the same starting point as photographed material: comparable storage requirements, the same dynamic range characteristics, and identical behavior under color grading — turning what is usually a case-by-case integration headache into a standard, repeatable process.


# Bibliography
{% bibliography ieee %}
