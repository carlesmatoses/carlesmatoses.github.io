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
Ambinet Occlusion was first used in "Pearl harbour" to store the quantity if ambient light that reaches each point of an airplain. This same technique was used in Cruise Control a few years before to detect how much reflection should radiate each window.

<!-- Picture of Pearl harbour -->
<!-- Picture of Cruise Control -->

To generate the ambient light (global illumination technique) we generate an image (HDRI, cube map, sphere image...) that combines all surronding lights (sky, sun, ground) recieved in a single point. 

<!-- picture of an hdri -->
<!-- picture of object being globally illuminated, show the problems of occlusion -->

As shown in the previous image, we can not tell how much light reaches each point but we can apply ambient occlusion to fake it.

<!--
lets review how this technique works.

In the beggining it was meant to recognize how much (quantity) of global illumination got to each surface points in the scene. Lets put an example of a window surronded by walls. This technique will recognize that a small percentage of light will reach it but you can not know wich portion of the sky is and also you do not know self reflections such as walls that may be reflected in the window. For this reason it is not good for close ups but rather distant shots.

In cruise controll they used this technique for exactly that purpose, deciding how much illumination should each window recieve (but not the reflection itself)

This technique seems to provide better results on non reflective surfaces like in pearl harbour. Lets say we are provided an airplain surronded by a blue sphere, we know how much of this light will get to each surface point.

0. we require to generate global illumination: explain technique a little bit
1. Calculate ambient occlusion of a self object
2. calculate ambient occlusion of the proximity of two objects
3. the problem with dynamic ambient occlusion: it requires to be updated each time the scene geometry changes.
4. This technique may not be that useful with ray tracing or light paths render engines. it is meant for IBL
-->

<!-- Explaining improvved technique by generating a map that contains the direction from wich a point recieves light from specific angles. -->

# Bibliography
{% bibliography %}
