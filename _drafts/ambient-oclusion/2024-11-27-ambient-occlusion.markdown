---
layout: post
title:  "Ambient Occlusion"
date:   2024-11-27 18:17:51 +0200
preview: "/images/image-not-found.png"
categories: post # post, project
permalink: post/ambient-occlusion
---

1. What is ambient occlusion?
2. Why is it used for?
3. Current Techniques
4. Blender implementation
<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}


# Ambient occlusion
<!-- small introduction -->
Ambient occlusion is a term that refers to the ``light reduction when two surfaces are really close`` to each other.

As you can see in [figure 1](#img:1), geometry proximity darkens the render allowing for a better depth recognition for the viewers. 

This effect is artistic and ``not phisically accurate``. This said, it's still ``based on a real effect`` of global illuminatin being blocked by really close objects and casted shadows  [figure 2](#img:2).

{% include figure.html image="/images/ambient_occlusion/blender_ao_shader.png" 
    caption="figure 1: Ambient occlusion on wave grid" 
    id="img:1"
%}

{% include figure.html image="/images/ambient_occlusion/real_ao.jpg" 
    caption="figure 2: Ambient occlusion on real objects" 
    id="img:2"
%}


# History
<!-- On which documents was first treated this concept -->
