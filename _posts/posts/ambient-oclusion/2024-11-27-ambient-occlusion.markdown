---
layout: post
title:  "Ambient Occlusion"
date:   2024-11-27 18:17:51 +0200
preview: "/images/ambient_occlusion/header.jpg"
categories: post # post, project
permalink: post/ambient-occlusion
---

1. What is ambient occlusion?
2. Why is it used?
3. Current Techniques
4. Blender implementation
<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}

{% bibliography_loader _bibliography/ao_references.bib %}

# Introduction
## Global Illumination & Image Base Lightning
**This concepts are out of the scopes but I will summarize them.**

``Global Illumination`` referce to calculating all bounces of light reaching each surface point. This is expensive but provides good results. This takes into account that light bounces in each surface and reaches other objects. 

{% include figure.html image="https://cdn2.unrealengine.com/feed-ue5-early-access-livestream-lumen-1920x1080-a4d78e37fd8e.jpg" 
    caption="figure 6: Unreal Engine: Lumen technology." 
    id="img:6"
%}

To simplify global illumination **we could place lights from all directions simulating the sky or even the floor** if some objects have to bounce back light.

{% include figure.html image="/images/ambient_occlusion/global_ilumination.png" 
    caption="figure 7: Global Illumination using virtual lights." 
    id="img:7"
%}


{% include figure.html image="/images/ambient_occlusion/global_ilumination_back.png" 
    caption="figure 8: Global Illumination using virtual lights composed on top of a background image." 
    id="img:8"
%}

Instead of placing hundreds of lights in the scene, we can **group them in an image**.

{% include figure.html image="/images/ambient_occlusion/global_ilumination_cycles.png" 
    caption="figure 9: Global Illumination using enviorment image and path trace engine (cycles)." 
    id="img:9"
%}

{% include figure.html image="/images/ambient_occlusion/global_ilumination_eevee.png" 
    caption="figure 10: Global Illumination using Image Based Lightning (IBL)." 
    id="img:10"
%}


The limitations of this technique are that **we do not take into account occlusion**, buuuuut... we are trying to overcome solve that.

In resume: **The most phisically accurate approach for rendering is by ray trancing and path tracing. Real time techniques require a global illumination simplifications, usually Image based lightning techniques. This simplifications have limitations that we must overcome**.

# Ambient Occlusion
**Ambient Occlusion (AO)** is a rendering technique used to estimate how much ambient light reaches a surface point in a scene. In essence, it simulates how exposed each point is to surrounding light, based on nearby geometry.

In the real world, light rays are often blocked or "occluded" by other objects. This effect happens naturally and gives surfaces subtle shadows in creases, corners, and areas where objects are close together. Recreating this effect in computer graphics adds a layer of realism to CGI scenes  ([figure 3](#img:3)).

{% include figure.html image="/images/ambient_occlusion/real_ao.jpg" 
    caption="Figure 3: Ambient occlusion visible in real-world objects." 
    id="img:3"
%}

That said, **ambient occlusion is not physically accurate**, but rather an *artistic approximation* of a real-world phenomenon. It's designed to enhance depth perception and spatial relationships in rendered images without simulating full global illumination.

You might ask, **"Why not calculate actual light from all scene lights?"**  
The short answer: **we can!**  
The long answer: **it’s computationally expensive and often not feasible in real time.**

Physically based techniques like **ray tracing** and **path tracing** (used in renderers like Cycles) simulate full global illumination, but they require significant processing power. In exchange, they provide close to real light occlusion and do not need to use ambient occlusion techniques.

For static scenes in real time applications, ambient occlusion can be precomputed and stored in textures. For dynamic scenes, it must be recalculated every frame, which can be costly.

As seen in [figure 1](#img:1) and [figure 2](#img:2), nearby geometry blocks ambient light, creating soft shadows that enhance the perception of depth and form.

{% include figure.html image="/images/ambient_occlusion/blender_ao_shader_off.png" 
    caption="Figure 1: Wave grid without ambient occlusion." 
    id="img:1"
%}

{% include figure.html image="/images/ambient_occlusion/blender_ao_shader.png" 
    caption="Figure 2: Wave grid with ambient occlusion applied." 
    id="img:2"
%}

In short, every point in a scene could theoretically receive light from every direction. However, some of these paths may be blocked by other objects, resulting in subtle shading — this is the essence of ambient occlusion. 

For this reason **we use two techniques for recreating shadows in real time: Ambient occlusion and shadow casting**. Both can be precomputed for static scenes or calculated dynamically in interactive enviorments.



<!-- More technically, Ambient Occlusion refers to the value of occlusion there is in each point of the surface. -->

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

# Birth of a new technique
<!-- On which documents was first treated this concept -->
Ambinet Occlusion was first used in "Pearl harbour" to store the quantity of ambient light that reaches the surface of an airplain [figure 4](#img:4). This same technique was used in Cruise Control a few years before to determine the reflection intensity of each window. Find more information on  {% cite hystory-background %}.

<!-- Picture of Pearl harbour -->
{% include figure.html image="https://www.fxguide.com/wp-content/uploads/2011/01/ocllusion.jpg" 
    caption="figure 4: Pearl Harbor Reflection Occlusion." 
    id="img:4"
%}

<!-- Picture of Cruise Control -->



Films do not require real time processes even though its still desired. For this productions, they ``backed geometry occlusions in image sequences`` and use it in the rendering pipeline as another texture. 

We are going to explore two diferent techniques developed by ILM: Ambient Occlusion and Reflection Occlusion. The reason they developed two techniques is because materials are usually composed of two components: ``Diffuse`` and ``Specular``.

{% equation id="eq:energy" %}
fr = k_d \cdot f_{lambert} + k_s \cdot f_{cook−torrance}
{% endequation %}

In equation {% ref "eq:energy" %} ``labert represents the diffuse component`` and ``cook-torrance represents the specular component``.

Lets visualize now the result with path tracing against global illumination to see the improvements when applying Ambient Occlusion. The model Suzanne should have a shadow under the hat and also occlude light to his right ear. Ambient occlusion will only take care of the shadows on the hat since geometryes are close but it will not cas shadows on the right side. All darkened area will be provided from an irradinace texture of the environment.

{% glb_viewer id='viewer-1' models='suzane,sphere' materials='material1,enviorment' %}

<!-- To generate the ambient enviorments (image based lightning technique) we create an image (HDRI, cube map, sphere image...) that combines all surronding lights (sky, sun, ground) recieved in a single point (usually where the character is placed). This is a simplification of global illumination where we place the lights in the scene and iterate over all of them to calculate the light on a surface point. -->

<!-- picture of an hdri -->
<!-- picture of object being globally illuminated, show the problems of occlusion when an object is irregular, like objects with identations or holes. -->

<!-- As shown in the previous image, we can not tell how much light reaches each point but we can apply ambient occlusion to fake it. -->

# Reflection Occlusion
An object complitelly reflective would be a perfect mirror. 

# Problem
We already know we want to calculate the light reaching to each surface point. In real time applications its common to use  ``Image Based techniques`` to fake illumination on surfaces. The main problem with this approach is that we use normal directions from the surface to get the image pixel illuminating that point. This approach will not take into account self occlusion or between objects occlusion. 

In the following example you can see how the hat is not casting shadows and faces oriented towards the windows are lighted even when they shouldn't. The first slide allows you to illuminate the object and the second one activates the backed shadow generated using light paths rendering techniques.



Additionally, the hat projects a shadow like a tree. Calculating this types of shadows from global illumination is preety complex and requires to iterate over all pixels of the enviorment texture. 

For This reasons, the ambient occlusion will only simplify self occlusions or inter occlusions but not shadow projection. A phisically correct approach would not require ambient occlusion but it will take longer to render.

# Ambient Occlusion
<!-- Ambient Occlusion map: Once we have the scene geometry, we iterate over all points in the surface and generate an hemisphere oriented in the surface normal direction. Now we can check for colisions of the rays being casted in those directions and store the result plus the angle. Based on the lambertian formula, we know that incident light has more effect when the angle is close to 0º and it starts to reflect more light the closer it gets to 90º degrees.

<!-- Ambient Occlusion bend normal map -->
To know which part of the enviorment map is most representative of a certain surface point we can store that information based on the hemisphere rays generated before.  -->



# Reflection Occlusion

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

# SSAO

# Bibliography
{% bibliography %}
