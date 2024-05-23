---
layout: post
title:  "SRGGE Qsplat"
date:   2024-05-20 18:17:51 +0200
preview: "/images/image-not-found.png"
categories: post
permalink: post/SRGGE-Qsplat
---

- What kind of Environment maps exist?  
<!-- end-abstract --> 

# Links & aditional info

[Original aper](https://dl.acm.org/doi/pdf/10.1145/344779.344940)



# Index
- Problem with 3D scans
    - Qsplat solution

- Preprocessing Algorithm: Generating a tree
    - Loose vertex connection information.
    - Turning binary tree 1:2:2 into 1:2:4 tree.
    - Storing position and radius relative to parent.
        - Half the longest edge from a vertice is considered the leaf radius.
        - 12 posible radius sizes.
        - why does the radius bring more error than the position.
        - position with look up table of 7621 (spheres complitly covered by parent)

- Node data:
    - Position and radius
    - Normals
    - Colors
    - Normal cones

- Storing data in file:
    - Breadth-first order.
    - Bytes for storing the data.
    - storing normals as a grid.
        - normals come from the original mesh.
    - Storing cone as the overall normal radius.
    - Pointers
        - Storing three bytes for the tree, bool for children and 2 for quantity of children

- Rendering Algorithm
    - pseudo code
    - Visibility Culling: Detecting if sphere parent is visible on the viewer
    - backface culling.
    - Determining When to Recurse
    - posible improvements
        - heuristics
    - Drawing Splats

- Splat Shape.
    - spline in opacity that falls to 1/2 at the nominal radius of the splat

            The center of the circle is fully opaque.
            As you move towards the edge, the opacity decreases smoothly according to the spline function.
            At the nominal radius, the opacity is reduced to half.
            Beyond this radius, the opacity continues to fall off smoothly until it reaches zero.
            This behavior is controlled so it garantyes free-hole reconstructions (not explained in the paper) """Our approximation to a Gaussian kernel is also guaranteed to produce full opacity in areas that started out as continuous surfaces"""

- Performance

# 1. Introduction

***Title Slide: Include the paper's title, authors, and your name.***

### QSplat: A Multiresolution Point Rendering System for Large Meshes
<div class="col-12 text-center">Szymon Rusinkiewicz  </div>
<div class="col-12 text-center">Marc Levoy  </div>
<div class="col-12 text-center">Stanford University  </div>

- Carles Matoses GImenez

***Context and Motivation: Explain why this paper is important. Briefly discuss the challenges in rendering large meshes and the need for efficient solutions.***

As technology advances, the techniques for capturing real data also improve

One of this techniques is 3D scanning. This techniques can produce a 3D replica of an object with nanometrical errors. This objects have proven to be a challenge for displaying algorithms given theire masive quantity of polygons.

In this paper, the authors propose a method for `representing and progressively displaying these meshes`
- multiresolution hierarchy based on bounding spheres
- rendering system based on points

**characteristics**:

- A single data structure is used for view frustum culling, backface culling, level-of-detail selection, and rendering
- The representation is compact and can be computed quickly, making it suitable for large data sets

# 2. Background

***Basics of Mesh Rendering: Provide a brief overview of traditional mesh rendering techniques.***

3D scanning generates sampled representations of real objects with diferent precissions depending on the devices used.

In computer graphics, the term "sampled representation" refers to the method of representing real-world objects using discrete samples of their geometry or appearance rather than continuous mathematical models.

This meshes are usually too heavy for real time applications. 

One solution could be simplifying the data. Many such techniques focus on optimizing the placement of individual edges and vertices, expending a relatively large amount of effort per vertex. 

**Other solution**:

Scanned data, however, has a large number of vertices and their locations are often imprecise due to noise. 

Given the nature of really small randomness on points,Iistead of focusing on rendering each point with high precision and detail, the system aims to render the overall object efficiently. The goal is to achieve good performance and acceptable visual quality by simplifying the processing of each point.

<div class="alert alert-secondary" role="alert">
spline-fitting system by Krishnamurthy and Levoy [Krishnamurthy 96], the range image merging system by Cur- less and Levoy [Curless 96], and Yemez and Schmitt’s rendering system based on octree particles [Yemez 99]. 
</div>

# 3. Objectives of QSplat

***Goals of the Paper: Outline the primary objectives the authors aimed to achieve with QSplat, such as efficiency, scalability, and quality.***

Following the second solution, Qsplat implements a new algorithm for extracting the relevant data from a high detail geometry.

This algorithm uses a simple rendering algorithm based on traversing a bounding sphere hierarchy.

It was tested on theyre project The Digital Michelangelo Project: 3D Scanning of Large Statues.

- QSplat does not maintain the connectivity of the input mesh (which in the case of scanned data inherently is only useful to resolve depth disconti- nuities and has little other meaning)

- Instead relyis on a point-based representation and splat rendering

- Qualityes: 
As a result, our system has lower preprocessing and rendering costs than comparable polygon-based systems. QSplat launches quickly, adjusts level of detail to maintain an interactive frame rate, and has a compact in-memory and on-disk representation.

# 4. QSplat Data Structure and Algorithms

***QSplat Overview: Explain the main idea behind QSplat. Emphasize how it uses a point-based rendering approach instead of traditional polygonal rendering.***

Qsplat relies on:
- QSplat data structure
- rendering algorithm

## Data Structure
***Data Structures: Detail the data structures used in QSplat, particularly the bounding spheres and how they help in rendering and level-of-detail management.***

QSplat uses a hierarchy of bounding spheres [Rubin 80, Arvo 89] for visibility culling, level-of-detail control, and rendering.

<div class="alert alert-secondary" role="alert">
<a 
    href="https://dl.acm.org/doi/pdf/10.1145/800250.807479">
    A 3-Dimensional Representation for Fast Rendering of Complex Scenes
</a>
<br>
<a 
    href="https://www.cs.cmu.edu/~fp/courses/graphics/cmu-only/ray6.pdf">
    Survey of Ray Tracing Acceleration Techniques
</a>
</div>

Each node of the tree contains the sphere center and radius, a normal, the width of a normal cone [Shirman 93], and optionally a color.

You can construct  this structure for meshes of diferent natures like point clouds. In this paper they focus only on triangular meshes.
<!-- 
***Multiresolution Representation: Describe how QSplat uses a multiresolution hierarchy of points.*** -->

## Algorithms

`Dsiplay Algorithm`:
```
TraverseHierarchy(node)
{
    if (node not visible)
        skip this branch of the tree
    else if (node is a leaf node)
        draw a splat
    else if (benefit of recursing further is too low)
        draw a splat
    else
        for each child in children(node)
            TraverseHierarchy(child)
}
```
### Visibility Culling

***How do we check if is visible?***
Frustum culling is performed by testing
each sphere against the planes of the view frustum. 

***IF VISIBLE***

If the sphere lies entirely inside the frustum, this fact is noted and no further frustum culling is attempted on the children of the node.

***IF NOT VISIBLE***

If the sphere lies outside, it and its subtree are discarded and not processed further.

***IF BACKFACE***

using the normal and cone of normals stored at each node.

- If the cone faces entirely away from the viewer, the node and its subtree are discarded.
- If the cone points entirely towards the viewer, mark its children as not candidates for backface culling.

### Determining when to Recurse:
projected size on the screen.
- a node is subdivided if the area of the sphere, projected onto the viewing plane, exceeds a threshold.
- The cutoff is adjusted from frame to frame to maintain a user-selected frame rate.

For controlling the frame rate, there are a few methods. They are not implemented for this project
- [Adaptive Display Algorithm for Interactive Frame Rates During Visualization of Complex Virtual Environments](https://www.cs.princeton.edu/~funk/sig93.pdf)

They also have not implemented smooth LOD transition. (not a big need for it, transitions are really small)
- geomorphs in Hoppe’s progressive mesh system

### Static frame
When the viewport is locked on a direction, the algorithm starts to refine the object to the pixel size

### Splat
Once we have either reached a leaf node or decided to stop recursing, we draw a splat representing the current sphere [Westover 89]. 

- The size of the splat is based on the projected diameter of the current sphere
- its color is obtained from a lighting calculation based on the current per-sphere normal and color
- Splats are drawn with Z-buffering enabled to resolve occlusion

# 5. Implementation Details

***Splats and Splatting: Explain what splats are and how the splatting technique works in QSplat.***

***Traversal Algorithm: Discuss the algorithm used for traversing the multiresolution hierarchy and rendering the appropriate level of detail.***

***Rendering Pipeline: Provide an overview of the rendering pipeline used in QSplat.***

# 6. Performance and Results

***Efficiency: Present the performance benefits of QSplat, supported by data and graphs from the paper.***

***Quality: Show visual comparisons between QSplat-rendered meshes and those rendered by traditional methods.***

***Scalability: Discuss how QSplat handles increasingly large datasets.***

# 7. Applications and Use Cases

***Real-World Applications: Mention specific applications where QSplat can be particularly useful, such as in scientific visualization, gaming, and virtual reality.***

***Case Studies: If available, present case studies or examples of QSplat in action.***

# 8. Conclusion

***Summary: Recap the key points covered in your presentation.***
    
***Impact: Discuss the impact of QSplat on the field of computer graphics.***

***Future Work: Mention any potential future work or improvements suggested by the authors.***

# 9. Questions and Discussion

***Q&A Session: Open the floor for questions and facilitate a discussion.***