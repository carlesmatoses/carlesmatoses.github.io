---
layout: post
title:  "Ambient Occlusion"
date:   2024-11-27 18:17:51 +0200
preview: "/images/ambient_occlusion/header.jpg"
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

{% bibliography_loader _bibliography/ao_references.bib%}

# Ambient occlusion
<!-- small introduction -->
The concept Ambient Occlusion refers to the ``light reduction when two surfaces are really close`` to each other.

As you can see in [figure 1](#img:1) and [figure 2](#img:2), geometry proximity darkens the render allowing for a better depth recognition for the viewers. 

{% include figure.html image="/images/ambient_occlusion/blender_ao_shader_off.png" 
    caption="figure 1: Wave grid." 
    id="img:1"
%}

{% include figure.html image="/images/ambient_occlusion/blender_ao_shader.png" 
    caption="figure 2: Ambient occlusion on wave grid." 
    id="img:2"
%}

This effect is artistic and ``not phisically accurate``. This said, it's still ``based on a real effect`` of global illuminatin being blocked by really close objects casting shadows  [figure 3](#img:3).

{% include figure.html image="/images/ambient_occlusion/real_ao.jpg" 
    caption="figure 3: Ambient occlusion on real objects." 
    id="img:3"
%}

More technically, Ambient Occlusion refers to the value of occlusion there is in each point of the surface.

# History
<!-- On which documents was first treated this concept -->

# Bibliography
{% bibliography %}
