---
layout: post
title:  "Gaussian Splatting and Mesh Reconstruction"
date:   2026-07-24 12:00:00 +0200
preview: "/images/gaussian-splatting-mesh/hero_mesh_reconstruction.jpg"
header_video: "/images/gaussian-splatting-mesh/header_loop.mp4"
card_video: "/images/gaussian-splatting-mesh/card_loop.mp4"
header_poster: "/images/gaussian-splatting-mesh/header_poster.jpg"
categories: project # post, project
permalink: project/gaussian-splatting-mesh-reconstruction
---

This is the digital version of my **thesis**, *Geometric Mesh Reconstruction and Differentiable Smoothing for Gaussian Splatting*. It walks through how a scene captured with photos becomes a clean, low-polygon 3D mesh, and describes my two contributions:

1. **Meshfacto** — porting the state-of-the-art *Mesh-In-the-Loop* (MILo) method into the **Nerfstudio** library, cutting the polygon count of the extracted meshes dramatically.
2. **Differentiable smoothers** — extra training losses that regularize the mesh and stabilize the optimization.

<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}

{% bibliography_loader _bibliography/gaussian_splatting_references.bib %}


# Introduction

{% figure id="hero" width="100%" caption="The same surface reconstructed by MILo (left, red) and by Meshfacto (right, green). Both trace the geometry faithfully, but the wireframe insets reveal the difference this thesis is about: Meshfacto reaches the same surface with a far leaner, more regular tessellation." %}
  {% fig_img src="/images/gaussian-splatting-mesh/hero_mesh_reconstruction.jpg" width="100%" %}
{% endfigure %}

Long before computers, the *pointillists* had already discovered that a whole scene can be built from thousands of tiny, individually meaningless marks. Seurat and Signac painted with dots of pure color that the eye blends into light and form. Look closely and you see the primitives; step back and you see the picture.

{% figure id="pointillism" width="100%" caption="Pointillism: a scene emerges from thousands of small colored primitives. Paul Signac (left) and Camille Pissarro (right)." %}
  {% fig_img src="/images/gaussian-splatting-mesh/pointillism_signac.jpg" width="49%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/pointillism_pissarro.jpg" width="49%" %}
{% endfigure %}

**Gaussian Splatting** {% cite kerbl20233dgs %} is the 3D version of the same idea. A scene is represented by millions of small, semi-transparent 3D blobs (``Gaussians``). Each one carries a position, a shape, a color and an opacity, and when they are blended together from a given viewpoint they reproduce a photograph of the scene. Because the whole representation is differentiable, the blobs can be *optimized* directly against a set of input images until the rendering matches reality.

Gaussian Splatting is excellent at **novel view synthesis** — generating photorealistic images from new camera positions — but the cloud of blobs is not a *surface*. For games, VFX, simulation or 3D printing we usually want a **mesh**: a connected set of triangles. Extracting one from a splat cloud is the core problem this thesis works on.

A crucial distinction runs through the whole project:

{% alert %}
**Geometry-reconstruction quality** asks *"does the surface match the real object?"* — **mesh/tessellation quality** asks *"are the triangles themselves well-shaped and economical?"* A mesh can trace the object perfectly and still be a tangle of millions of sliver triangles. This work targets the second question without sacrificing the first.
{% endalert %}


# What is Gaussian Splatting?

Each Gaussian is an anisotropic 3D blob defined by a mean {% equation_inline \mu %} (its center) and a covariance matrix {% equation_inline \Sigma %} that controls its size and orientation. To keep the covariance valid during optimization, it is factored into a rotation {% equation_inline R %} and a per-axis scale {% equation_inline S %}:

{% equation id="covariance" %}
\Sigma = R S S^\top R^\top
{% endequation %}

Alongside {% ref equation:covariance %}, every splat stores an opacity {% equation_inline \alpha %} and a view-dependent color. To render a pixel, the Gaussians that project onto it are sorted by depth and blended front-to-back with the standard *over* operator:

{% equation id="alpha-blend" %}
C = \sum_{i} c_i\, \alpha_i \prod_{j<i} (1 - \alpha_j)
{% endequation %}

{% figure id="gaussian-splats" width="100%" caption="Left: individual Gaussian primitives with different scales, rotations and colors. Right: alpha-compositing several splats along a viewing ray." %}
  {% fig_img src="/images/gaussian-splatting-mesh/gaussian_splats.png" width="49%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/ray_marching.png" width="49%" %}
{% endfigure %}

Training is plain gradient descent on the rendered image. The 3DGS loss mixes an {% equation_inline \mathcal{L}_1 %} photometric term with a structural (D-SSIM) term:

{% equation id="gs-loss" %}
\mathcal{L} = (1 - \lambda)\,\mathcal{L}_1 + \lambda\,\mathcal{L}_{\text{D-SSIM}}, \qquad \lambda = 0.2
{% endequation %}

Two pieces of the pipeline appear repeatedly but are **context only** for this post — see the [Additional context](#additional-context) section at the end for detail:

- **Spherical harmonics** encode the *view-dependent* color of each splat, so surfaces can change appearance with the viewing angle (specular highlights, Fresnel rim light). See {% ref figure:fresnel %} for the effect they capture.
- **COLMAP** {% cite schoenberger2016sfm %} is the Structure-from-Motion tool that recovers the camera poses and an initial sparse point cloud from the raw photos, before any splatting begins.

{% figure id="fresnel" width="66%" caption="View-dependent shading (specular / Fresnel): the same surface changes appearance with the viewing angle — this is what spherical harmonics encode per splat." %}
  {% fig_img src="/images/gaussian-splatting-mesh/drag1.png" width="49%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/drag2.png" width="49%" %}
{% endfigure %}


# From splats to a mesh

To turn the cloud into a surface we need to decide *where the surface is*. The approach followed here (from GOF {% cite yu2024gaussianopacityfieldsefficient %} and MILo {% cite guedon2025milo %}) attaches geometry to the splats themselves.

Each Gaussian contributes a small set of **Delaunay vertices** — points placed around its center, offset along its own axes. If {% equation_inline \tilde{s}_k %} is the (inflated) scale of splat {% equation_inline k %} and {% equation_inline b_i %} is a fixed offset direction, vertex {% equation_inline i %} of that splat is:

{% equation id="delaunay-verts" %}
p_{k,i} = \mu_k + (b_i \odot \tilde{s}_k)
{% endequation %}

These vertices are connected by a **Delaunay tetrahedralization** {% cite 10.1093/comjnl/24.2.162 %}, and each vertex is assigned a **signed distance** value (inside vs. outside the surface). A **differentiable Marching Tetrahedra** {% cite shen2021deepmarchingtetrahedrahybrid %} step then extracts the surface: wherever an edge of a tetrahedron connects an inside vertex {% equation_inline i %} to an outside vertex {% equation_inline j %}, a mesh vertex is placed by linear interpolation of their SDF values {% equation_inline f %}:

{% equation id="dmtet" %}
v_n = \frac{f_i\, p_j - f_j\, p_i}{f_i - f_j}
{% endequation %}

{% figure id="delaunay-pipeline" width="100%" caption="The splats-to-mesh pipeline: Gaussian splats, their Delaunay vertices colored by SDF sign, the tetrahedralization, and the extracted surface mesh." %}
  {% fig_img src="/images/gaussian-splatting-mesh/delaunay_vertex4.png" width="100%" %}
{% endfigure %}

**MILo** {% cite guedon2025milo %} is the state-of-the-art method that puts this extraction *inside* the training loop (hence *Mesh-In-the-Loop*). It makes the per-Gaussian SDF **learnable** and supervises the extracted mesh directly, comparing the mesh's own rendered depth {% equation_inline D_M %} and normals {% equation_inline N_M %} against the depth {% equation_inline D %} and normals {% equation_inline N %} of the splat rendering:

{% equation id="milo-losses" %}
\mathcal{L}_{\text{MD}} = \sum \log\!\big(1 + |D - D_M|\big), \qquad
\mathcal{L}_{\text{MN}} = \sum \big(1 - N \cdot N_M\big)
{% endequation %}

Because the mesh is optimized jointly with the splats, MILo produces meshes that are far more faithful than a naive post-hoc extraction.


# Contribution 1 — Meshfacto: MILo inside Nerfstudio

MILo's reference implementation is built on the original 3DGS codebase. My first contribution re-implements its ideas as a first-class method inside **Nerfstudio** {% cite nerfstudio %}, the modular framework whose gsplat {% cite ye2024gsplatopensourcelibrarygaussian %} backend is widely used for research. The result is a new method I call **Meshfacto**, registered as a Nerfstudio entry point and extending its `splatfacto` model.

{% figure id="nerfstudio-gsplat" width="70%" caption="Meshfacto is built on top of Nerfstudio and its gsplat rendering backend." %}
  {% fig_img src="/images/gaussian-splatting-mesh/nerfstudio_logo.png" width="56%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/gsplat_logo.png" width="15%" %}
{% endfigure %}

Getting there required filling gaps in the stock gsplat backend:

- **A median-depth render kernel.** gsplat only exposes *expected* depth; MILo-style supervision needs the more surface-accurate **median** depth, so a custom backward pass was added.
- **A normal render kernel.** Surface normals are computed from the depth map with finite differences (`depths_to_points` → `point_to_normal`), with a camera-facing sign convention, making the whole normal path differentiable.
- **Densification / reinitialization.** Instead of relying only on the original adaptive density control, Meshfacto can reinitialize the splats with the depth-based strategy from **Mini-Splatting2** {% cite fang2026efficientscenemodelingstructureaware %} {% cite fang2024minisplattingrepresentingscenesconstrained %}, which redistributes Gaussians onto surfaces far more economically.

{% alert secondary %}
**An honest caveat, kept from the thesis.** The large drop in polygon count reported below comes **mostly from the densification / reinitialization strategy, not from the smoothing losses** of Contribution 2. The smoothers improve *tessellation regularity*; low-poly *and* high-quality meshes need the two together.
{% endalert %}


# Polycount results

The headline result: at the **same Gaussian count**, Meshfacto produces meshes with roughly **47% fewer vertices and 76% fewer faces** than MILo (base). With Mini-Splatting2 reinitialization enabled (*Ours + reinit*), the face count drops to about **21–24% of MILo's** while using only a fraction of the Gaussians — on MipNeRF-360, around **0.04M** Gaussians versus MILo's 0.38M.

{% figure id="gaussians-per-mesh" width="80%" caption="Vertices and faces produced per Gaussian across methods. Meshfacto sits far lower than MILo, extracting far leaner meshes for a comparable splat budget." %}
  {% fig_img src="/images/gaussian-splatting-mesh/gaussians_per_mesh.png" width="100%" %}
{% endfigure %}

The difference is easiest to *see* in the wireframes. Below, the same object (the *Caterpillar* scene from Tanks &amp; Temples {% cite knapitsch2017tanks %}) is reconstructed by MILo, by *Ours + reinit* and by Meshfacto:

{% figure id="mesh-renders" width="100%" caption="Solid mesh renders — MILo (base), Ours + reinit, and Meshfacto. Surface fidelity is preserved across all three." %}
  {% fig_img src="/images/gaussian-splatting-mesh/miloImage.jpg" width="32%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/ours_reinitImage.jpg" width="32%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/meshfactoImage.jpg" width="32%" %}
{% endfigure %}

{% figure id="mesh-wireframes" width="100%" caption="The same three meshes in wireframe. The polygon-count reduction of Ours + reinit (center) and Meshfacto (right) versus MILo (left) is now visible directly." %}
  {% fig_img src="/images/gaussian-splatting-mesh/milo_wiImage.jpg" width="32%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/ours_reinit_wiImage.jpg" width="32%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/meshfacto_wiImage.jpg" width="32%" %}
{% endfigure %}

Fewer polygons are only worth it if the surface still looks right. Using MILo's image-space **Mesh-NVS** evaluation — rendering novel views *from the extracted mesh* — the leaner meshes lose only a little quality:

{% figure id="mesh-nvs" width="90%" caption="Mesh-NVS comparison on Tanks & Temples: novel views rendered directly from the extracted meshes. The lower-poly meshes stay visually faithful." %}
  {% fig_img src="/images/gaussian-splatting-mesh/mesh_nvs_comparison.png" width="100%" %}
{% endfigure %}


# Contribution 2 — Differentiable smoothers

Extracting a mesh inside the training loop has a downside: nothing stops the tetrahedralization from producing **degenerate triangles** — long, thin slivers that both look bad and destabilize the optimization, since their gradients are ill-conditioned. In early iterations these stretched faces flicker across the surface.

{% figure id="tetrahedra-error" width="80%" caption="Stretched, degenerate faces appearing across early training iterations — the artifact the smoothers are designed to suppress." %}
  {% fig_img src="/images/gaussian-splatting-mesh/tetrahedra_error.png" width="100%" %}
{% endfigure %}

The same problem shows up on real reconstructions. In {% ref figure:degenerate-scene %} the degenerate faces are highlighted in red, scattered all over an otherwise clean mesh:

{% figure id="degenerate-scene" width="80%" caption="Degenerate faces (red) on a real reconstructed scene before smoothing — thin slivers spread across the surface that hurt both appearance and training stability." %}
  {% fig_img src="/images/gaussian-splatting-mesh/degenerate_faces_scene.png" width="100%" %}
{% endfigure %}

My second contribution adds a family of **differentiable smoothing losses** that act on the extracted mesh every iteration. Because each mesh vertex depends (through {% ref equation:delaunay-verts %} and {% ref equation:dmtet %}) on the underlying Gaussians' positions, scales and SDF values, the gradient of these losses flows *back into the splats* — the mesh gets smoother by nudging the primitives that generate it.

Four losses were studied:

- **Uniform (umbrella) Laplacian** — pulls each vertex toward the barycenter of its neighbors, encouraging even spacing.
- **Cotangent Laplacian** — an area-aware variant that respects local curvature.
- **Edge-length loss** — penalizes the *variance* of edge lengths, {% equation_inline \mathcal{L}_{\text{edge}} = \mathrm{Var}(\ell_e) %}, to curb oversized distant faces.
- **Normal-smoothness loss** — a low-pass filter over face normals, gated by {% equation_inline g_{ij} = |n_i \cdot n_j|^{k} %} so that genuine sharp edges are preserved while noise is smoothed.

The exponent {% equation_inline k %} controls that gate. At {% equation_inline k = 0 %} the loss is a *high-pass* filter that penalizes every normal difference; increasing {% equation_inline k %} turns it into a *low-pass* filter that ignores near-orthogonal normals (real edges) while still smoothing near-parallel ones:

{% figure id="normal-lp" width="80%" caption="The normal-smoothness gate. k = 0 is a high-pass filter (penalizes all normal differences); larger k pushes the response toward parallel normals, preserving genuine sharp edges. k = 2 was chosen." %}
  {% fig_img src="/images/gaussian-splatting-mesh/normal_lp_plot.png" width="100%" %}
{% endfigure %}

{% figure id="torus-smooth" width="80%" caption="Left: raw Marching-Tetrahedra torus. Right: after cotangent-Laplacian smoothing. Curvature heatmaps show a much more regular tessellation." %}
  {% fig_img src="/images/gaussian-splatting-mesh/torus_smooth.png" width="100%" %}
{% endfigure %}

A three-stage sweep (Laplacian-variant selection → per-loss weight → combination) settled on a final recipe: **uniform Laplacian ({% equation_inline \lambda = 10 %}), edge-length loss ({% equation_inline \lambda = 10 %}), and normal low-pass ({% equation_inline k = 2 %})**. The uniform Laplacian, despite being the simplest, outperformed the area-aware variants here:

{% figure id="laplacian-sweep" width="100%" caption="Laplacian-variant comparison on the Truck scene (λ = 10): baseline vs. uniform, cotangent and area-cotangent Laplacians. The uniform variant gave the best regularity." %}
  {% fig_img src="/images/gaussian-splatting-mesh/sweep_baseline.png" width="24%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/uniform_laplacian_10.png" width="24%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/cotangent_laplacian_10.png" width="24%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/cotangent_area_laplacian_10.png" width="24%" %}
{% endfigure %}

The payoff is measurable. Across Tanks &amp; Temples and MipNeRF-360, the smoothed models improve mesh-quality metrics and, most importantly, drive the fraction of **degenerate faces down from about 0.30% to below 0.01%** — a ~97% reduction — at a negligible cost in reconstruction fidelity.

{% figure id="smoothing-improvement" width="100%" caption="Mesh-quality improvement from the smoothers on Tanks & Temples (left) and MipNeRF-360 (right)." %}
  {% fig_img src="/images/gaussian-splatting-mesh/smoothing_improvement_tnt.png" width="49%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/smoothing_improvement_360.png" width="49%" %}
{% endfigure %}


# Conclusions and future work

Two takeaways stand out. First, the dominant lever for **polygon count** is the densification / reinitialization strategy — bringing MILo's mesh-in-the-loop idea into Nerfstudio and pairing it with Mini-Splatting2 reinitialization is what makes the meshes lean. Second, the **differentiable smoothers** are a conditional but valuable addition: they don't reduce polygon count on their own, but they regularize the tessellation and stabilize training, nearly eliminating degenerate faces.

Promising directions for future work include geometry-driven densification, decoupling the Delaunay point cloud from the splat cloud, normalizing the smoothing losses by local scale (the coordinate domains of Nerfstudio and COLMAP differ by roughly 5×), and adopting MILo's TSDF depth-fusion reinitialization.


# Additional context

The sections below expand on the background material that the main text kept brief. They are optional reading.

## Spherical harmonics

Spherical harmonics {% cite 937651 %} are an orthonormal basis of functions on the sphere — the angular analogue of a Fourier series. In Gaussian Splatting, each splat stores a small vector of SH coefficients per color channel; evaluating them in the viewing direction gives that splat's color from the current camera. A degree-3 expansion uses 16 coefficients per channel (48 floats per splat) and is enough to capture soft view-dependent effects such as the specular and Fresnel shading in {% ref figure:fresnel %}. For pure geometry extraction the SH color is not strictly necessary, but it improves the photometric supervision that drives the whole optimization.

## COLMAP and Structure-from-Motion

Before any splatting happens, we need to know where each photo was taken from. **Structure-from-Motion (SfM)** recovers, from an unordered set of images, both the camera poses and a sparse 3D point cloud. **COLMAP** {% cite schoenberger2016sfm %} {% cite schoenberger2016mvs %} is the de-facto incremental SfM tool: it detects and matches feature points across images, estimates relative camera geometry, and triangulates 3D points, refining everything with bundle adjustment. Global alternatives such as **GLOMAP** {% cite pan2024globalstructurefrommotionrevisited %} trade some robustness for large speedups. The sparse COLMAP point cloud is what initializes the Gaussian splat positions.

## Marching Cubes and Marching Tetrahedra

**Marching Cubes** {% cite 10.1145/37402.37422 %} is the classic algorithm for extracting a surface (isosurface) from a scalar field sampled on a regular grid: for each cell it looks up a triangulation from a case table based on which corners are inside vs. outside the surface.

{% figure id="marching-tetrahedra" width="100%" caption="Left: the marching-tetrahedra unit — a cell split into tetrahedra, then triangulated by SDF sign. Right: a torus reconstructed from a point set." %}
  {% fig_img src="/images/gaussian-splatting-mesh/marching_tetrahedra.png" width="49%" %}
  {% fig_img src="/images/gaussian-splatting-mesh/marching_tetrahedra_torus.png" width="49%" %}
{% endfigure %}

**Marching Tetrahedra** is the tetrahedral counterpart. It is attractive here because the cell structure can follow an irregular, scene-adaptive Delaunay tetrahedralization rather than a fixed grid, and — crucially — its interpolation step ({% ref equation:dmtet %}) is **differentiable**, so gradients from the mesh flow back to the field values.

## Mesh-quality metrics

To evaluate tessellation quality objectively, the thesis uses local shape metrics such as the **mean-ratio** {% equation_inline S_3 %} (how close a triangle or tetrahedron is to equilateral), the fraction of **degenerate faces**, and a global **gradation** metric measuring how smoothly element sizes vary across the mesh. Two triangles can share the same edge-length ratio yet differ wildly in angles — {% ref figure:mesh-quality %} illustrates why a single ratio is not enough and multiple indicators are needed.

{% figure id="mesh-quality" width="55%" caption="Two triangles with a similar edge-length ratio but very different angles — a reminder that mesh quality needs more than one indicator." %}
  {% fig_img src="/images/gaussian-splatting-mesh/triangles.png" width="100%" %}
{% endfigure %}

## Sustainability and licensing

All experiments ran on a single consumer GPU (RTX 5070, 12 GB), with each full run taking roughly 40 minutes to 2 hours — a fraction of the compute assumed by the reference MILo setup (RTX 4090, 24 GB). On the legal side, the Meshfacto core stays compatible with permissive licenses: Nerfstudio and gsplat are **Apache-2.0** {% cite apache-license-2.0 %}, while some upstream components (MILo's Gaussian-Splatting License {% cite gaussian-splatting-license %} and nvdiffrast's NVIDIA source license {% cite nvidia-source-code-license %} {% cite Laine2020diffrast %}) are non-commercial — worth keeping in mind for any downstream use.


# Bibliography
{% bibliography ieee %}
