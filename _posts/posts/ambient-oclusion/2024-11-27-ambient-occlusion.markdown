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

{% bibliography_loader _bibliography/ao_references.bib %}

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

You may ask, **`Why can't we calculate how much light reaches the surface?`**. Short answer is `We can!!`. Long answer is `it requires lots of computation that do not allow for real time updates`. 

To summarize, any point on a scene will recieve light bounces from any part of the world. Sometimes, this paths may be blocked by another object casting shadows. Global ilumination is usually computed in `ray tracing` or `path tracing` engines like Cycles. On static scenes we may be able to precompute and store it in textures but in dynamic scenes we need to calculate it per frame.

{% comment %}
<!-- 
APROACHES:
- Ambient occlusion: a technique that, like reflection occlusion, uses a pre-rendered occlusion map accessed at render time to give the scene realistic shadowing. In addition, they developed a way to derive directional information so that a given surface point would be illuminated by the most appropriate part of the ambient environment map.

- Reflection occlusion: occluding or shadowing the reflections on the CG elements. It
addresses the problem of reflections not being correctly occluded when you use an all encompassing reflection environment. 

- Reflection Maps: Single channel reflection maps are used to attenuate reflection in areas that are either self occluding or blocked by other objects in the scene.

- Ambient environments:  Is a technique that gives a way of getting diffuse fill light illumination that is more like what we’d get from global illumination.

- Global illumination: 

-->
{% endcomment %}

# History
<!-- On which documents was first treated this concept -->
Ambinet Occlusion was first used in "Pearl harbour" to store the quantity of ambient light that reaches the surface of an airplain. This same technique was used in Cruise Control a few years before to detect how much reflection should radiate each window.

<!-- Picture of Pearl harbour -->
<!-- Picture of Cruise Control -->



To generate the ambient enviorments (image based lightning technique) we create an image (HDRI, cube map, sphere image...) that combines all surronding lights (sky, sun, ground) recieved in a single point (usually where the character is placed). This is a simplification of global illumination where we place the lights in the scene and iterate over all of them to calculate the light on a surface point.

<!-- picture of an hdri -->
<!-- picture of object being globally illuminated, show the problems of occlusion when an object is irregular, like objects with identations or holes. -->

As shown in the previous image, we can not tell how much light reaches each point but we can apply ambient occlusion to fake it.

# Ambient Occlusion
Ambient Occlusion map: Once we have the scene geometry, we iterate over all points in the surface and generate an hemisphere oriented in the surface normal direction. Now we can check for colisions of the rays being casted in those directions and store the result plus the angle. Based on the lambertian formula, we know that incident light has more effect when the angle is close to 0º and it starts to reflect more light the closer it gets to 90º degrees.

<!-- Ambient Occlusion bend normal map -->
To know which part of the enviorment map is most representative of a certain surface point we can store that information based on the hemisphere rays generated before. 

Here is the interactive 3D viewer:

{% glb_viewer id='viewer-1' models='suzane,sphere' materials='material1,enviorment' %}
# Reflection Occlusion
{% glb_viewer id='viewer-1' models='suzane,sphere' materials='material1,enviorment' %}

<!--
lets review how this technique works.

In the beggining it was meant to recognize how much (quantity) of global illumination got to each surface points in the scene. 

Lets put an example of a window surronded by walls. This technique will recognize that a small percentage of light will reach it but you can not know wich portion of the sky is and also you do not know self reflections such as walls that may be reflected in the window. For this reason it is not good for close ups but rather distant shots.

In cruise controll they used this technique for exactly that purpose, deciding how much illumination should each window recieve (but not the reflection itself)

This technique seems to provide better results on non reflective surfaces like in pearl harbour. Lets say we are provided an airplain surronded by a blue sphere, we know how much of this light will get to each surface point.

1. we require to generate global illumination: explain technique a little bit
2. Calculate ambient occlusion of a self object
3. calculate ambient occlusion of the proximity of two objects
4. the problem with dynamic ambient occlusion: it requires to be updated each time the scene geometry changes.
5. This technique may not be that useful with ray tracing or light paths render engines. it is meant for IBL
-->

<!-- Explaining improvved technique by generating a map that contains the direction from wich a point recieves light from specific angles. -->

# Bibliography
{% bibliography %}
