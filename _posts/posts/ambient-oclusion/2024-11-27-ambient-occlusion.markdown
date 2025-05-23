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


<!-- 
GIDE FOR WRITING THIS POST
- Ultimate goal: explain ambient occlusion technique and the child techniques such as SSAO

- Contextualize the problem. All media, stylized or not, needs a certain lightning realism to feel appealing. This has been the motivation for thousands of artists and different movements such as impressionism
- This technique is archived in digital media by calculating certain properties such as how much light reaches the surface.
 -->

<!-- 
* Script
# how history looks for realism

-->

# Introduction
We all like Games, Films, cartoons and other media contents. On the recent years we have seen an increasing graphical improvement trying to get closer to reality. This has been the case for centuries on lots of fields such as paintings and sculpture. Painters on the impressionism artistic period tried to capture a scene without shapes or form, just capturing the light allowing it to define the objects. This highlights the effect illumination has on our perception. 

{% figure id="lumen" size="1.0" caption="Paintings trying to represent light in an appealing way" col="2" %}
https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/960px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg
/images/ambient_occlusion/toystory.jpg
{% endfigure %}

Computer generated films such as Toy story illustrates the evolution of techniques for photorealism. Even high stylized games are not free of this requirement of respecting light behavior since it will have a direct impact on how we feel about what we see. That is why some rules are constant for good looking media such as having shadows and light intensity and light interaction. 

{% figure id="lumen" size="1.0" caption="https://www.gamedesigning.org/wp-content/uploads/2019/10/enabling-ambient-occlusion-1.jpg" %}
https://www.gamedesigning.org/wp-content/uploads/2019/10/enabling-ambient-occlusion-1.jpg
{% endfigure %}

In this post we will try to see how occlusion shadows have been done in games and films to improve realism.



## Global Illumination & Image Base Lightning
**This concepts are out of the scopes but I will summarize them.**

### Global Illumination
One of the characteristics of light is that it bounces from one object to the other and so on.  ``Global Illumination`` refers to calculating all bounces of light reaching each surface point. This is expensive but provides good results. 
<!-- This takes into account that light bounces in each surface and reaches other objects.  -->


{% figure id="lumen" size="0.5" caption="Unreal Engine: Lumen technology." %}
https://cdn2.unrealengine.com/feed-ue5-early-access-livestream-lumen-1920x1080-a4d78e37fd8e.jpg
{% endfigure %}

To simplify or "fake" global illumination **we could place lights from all directions simulating the sky or even the floor** if some objects have to bounce light back.

{% figure id="global-illumination" size="1.0" caption="Global Illumination using virtual lights." %}
    /images/ambient_occlusion/global_ilumination.png
    /images/ambient_occlusion/global_ilumination_back.png
{% endfigure %}


### Image Base Lightning
Instead of placing hundreds of lights in the scene, we can **group them into an image**.

{% figure id="gi_cycles" size="0.55" caption="spherical image of a house" %}
    /images/ambient_occlusion/photo_studio_loft_hall_2k.jpg
{% endfigure %}

{% figure id="gi_cycles" size="0.5" caption="Global Illumination using environment image and path trace engine (cycles)." %}
    /images/ambient_occlusion/global_ilumination_cycles.png
{% endfigure %}

{% figure id="ibl" size="0.5" caption="Global Illumination using Image Based Lightning (IBL)." %}
    /images/ambient_occlusion/global_ilumination_eevee.png
{% endfigure %}


The ``limitations`` of this technique are that **we do not take into account occlusion**, buuuuut... we are trying to overcome that.
{% figure id="IBL_no_shadows" size="0.49" caption="Suzanne with Image Based Lightning shows light under the hat and is not casting shadows from the windows" %}
\images\ambient_occlusion\ao_without_shadows.png
{% endfigure %}
{% figure id="global_illumination_path_tracing" size="0.49" caption="Suzanne rendered with path tracing shows how light is blocked by near geometry as well as blocking lights from the windows" %}
\images\ambient_occlusion\ao_with_shadows.png
{% endfigure %}

{% alert  %}
In resume: **The most physically accurate approach for rendering is by ray trancing and path tracing. Real time techniques require a global illumination simplifications, usually Image based lightning techniques. This simplifications have limitations that we must overcome**.
{% endalert %}

<!-- 
## How is Global Illumination faked with an environment image?
1. We use normal direction.
2. We get the color on that direction. 
-->

# Ambient Occlusion Concept
**Ambient Occlusion (AO)** is a rendering technique used to estimate how much ambient light reaches a surface point. In essence, ``it simulates how exposed each point is to surrounding light``, based on nearby geometry.

In the real world, light rays are often blocked or "occluded" by other objects. This effect happens naturally and gives surfaces subtle shadows in creases, corners, and areas where objects are close together. Recreating this effect adds a layer of realism to CGI scenes ({% ref figure:real-world-ao %}).

{% figure 
id="real-world-ao" 
size="0.49"
caption="Ambient occlusion visible in real-world objects." %}
/images/ambient_occlusion/real_ao.jpg
{% endfigure %}

That said, **ambient occlusion is not physically accurate**, but rather an *artistic approximation* of a real-world phenomenon. It's designed to enhance depth perception and spatial relationships in rendered images without simulating full global illumination {% ref figure:ao_example %}.

{% figure id="ao_example" caption="Wave grid before and after applying Ambient Occlusion" %}
/images/ambient_occlusion/blender_ao_shader_off.png
/images/ambient_occlusion/blender_ao_shader.png
{% endfigure %}

You might ask, **"Why not calculate actual light from all scene lights?"**  
The short answer: **we can!**  
The long answer: **it’s computationally expensive and often not feasible in real time.**

Physically based techniques like **ray tracing** and **path tracing** (used in renderers like Cycles) simulate full global illumination, but they require significant processing power. In exchange, they provide close to real light occlusion and do not need to use ambient occlusion techniques.




<!-- {% include figure.html image="/images/ambient_occlusion/blender_ao_shader_off.png" 
    caption="Figure 1: Wave grid without ambient occlusion." 
    id="img:1"
%}

{% include figure.html image="/images/ambient_occlusion/blender_ao_shader.png" 
    caption="Figure 2: Wave grid with ambient occlusion applied." 
    id="img:2"
%} -->

For static scenes in real time applications, ambient occlusion can be precomputed and stored in textures. For dynamic scenes, it must be recalculated every frame, which can be costly.
Lucky for us **we can use two techniques for recreating shadows in real time and dynamic scenes: Ambient occlusion and shadow casting**. 
<!-- Both can be precomputed or calculated dynamically in interactive environments. -->

<!-- There are as many ways for recreate realistic shadows as you can imagine. In this post we are going to explore the ones related to AO techniques.  -->

Lets visualize now the result with **path tracing against global illumination** to see the improvements when applying Ambient Occlusion. The model ``Suzanne should have a shadow under the hat and also occlude light to his right ear``. 

**Ambient occlusion will take care of the contact shadows on the hat**. It will not block the light coming from the window. All darkened and lighted areas will be provided from an irradiance texture of the environment (Image Based Lightning Global Illumination).

{% figure id="shadow-example" caption="Path Tracing Shadow Example" size="0.8" %}
\images\ambient_occlusion\shadow_example.png
\images\ambient_occlusion\ao_example .png
{% endfigure %}

The Shadow slide will show a backed path tracing shadow from cycles for comparison. Path tracing will use geometry to block light rays from the window.



{% glb_viewer id='viewer-1' models='suzane,sphere' materials='material1,enviorment' %}


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
Ambient Occlusion was first used in "Pearl harbour" to store the quantity of ambient light that reaches the surface of an airplane [figure 4](#img:4). This same technique was used in Cruise Control a few years before to determine the reflection intensity of each window. Find more information on  {% cite history-background %}.

<!-- Picture of Pearl harbour -->
{% include big_figure.html image="https://www.fxguide.com/wp-content/uploads/2011/01/ocllusion.jpg" 
    caption="figure 4: Pearl Harbor Reflection Occlusion." 
    id="img:4"
%}

<!-- Picture of Cruise Control -->



We already mentioned that this technique can be expensive and time consuming. Luckily for them, films do not require real time processes even though its still desired. For this productions, they ``backed geometry occlusions in image sequences`` and use it in the rendering pipeline as another texture. 

We are going to explore **two different techniques developed by ILM: Ambient Occlusion and Reflection Occlusion**. The reason they developed two techniques is because materials are usually composed of two components: ``Diffuse`` and ``Specular``.

{% equation id="eq:energy" %}
fr = k_d \cdot f_{lambert} + k_s \cdot f_{cook−torrance}
{% endequation %}

In equation {% ref "eq:energy" %} ``lambert represents the diffuse component`` and ``cook-torrance represents the specular component``.



<!-- To generate the ambient enviorments (image based lightning technique) we create an image (HDRI, cube map, sphere image...) that combines all surronding lights (sky, sun, ground) recieved in a single point (usually where the character is placed). This is a simplification of global illumination where we place the lights in the scene and iterate over all of them to calculate the light on a surface point. -->

<!-- picture of an hdri -->
<!-- picture of object being globally illuminated, show the problems of occlusion when an object is irregular, like objects with identations or holes. -->

<!-- As shown in the previous image, we can not tell how much light reaches each point but we can apply ambient occlusion to fake it. -->

# Reflection Occlusion
We will start by explaining Reflection Occlusion. This technique will use ``ray tracing to detect whether the fragment is occluded or not``. We then store the result on an image and use it to darken the final reflections.

Remember, this technique is **view dependent** therefore we need to compute it each frame or bake it if we already know the camera position for the hole animation.

``The process to obtain the Reflection Occlusion path is``:
1. Get the surface normal and position. 
2. Get the camera position.
3. Calculate the reflection vector from the three previous variables. It will look like {% ref figure:reflect-vectors %}
4. Use some technique to calculate ray intersections from the surface to the rest of geometry {% ref figure:reflection-occlusion %}.
5. Store the collision distance per fragment.
6. Use it to darken the Reflection Map using a shader.


{% figure id="reflect-vectors" caption="Generate reflect vectors" size="0.5" %}
\images\ambient_occlusion\ReflectionOcclusion.png
{% endfigure %}

{% figure id="reflection-occlusion" caption="Detect reflect vectors occlusions" size="0.5" %}
\images\ambient_occlusion\ReflectionOcclusion_raytrace.png
{% endfigure %}


The limit of this technique is that, ``instead of reflecting itself, it  just darkens the surface``. For general purposes this is enough. In path tracing renderers you are usually provided a parameter to choose how many times light will bounce. This is of course more realistic, but may take several minutes {% ref figure:reflect-bounces %}.

{% figure id="reflect-bounces" caption="Cycles Reflections with 0, 1 and 2 bounces respectively." %}
\images\ambient_occlusion\cyclesReflections.png
{% endfigure %}

As easy and powerful this method may seem, it is not used because of the processing time it takes for each frame to calculate collision. New techniques like Ray Tracing may be able to provide real time Reflection Maps in the future.

<!-- # Problem
We already know we want to calculate the light reaching to each surface point. In real time applications its common to use  ``Image Based techniques`` to fake illumination on surfaces. The main problem with this approach is that we use normal directions from the surface to get the image pixel illuminating that point. This approach will not take into account self occlusion or between objects occlusion. 

In the following example you can see how the hat is not casting shadows and faces oriented towards the windows are lighted even when they shouldn't. The first slide allows you to illuminate the object and the second one activates the backed shadow generated using light paths rendering techniques.


Additionally, the hat projects a shadow like a tree. Calculating this types of shadows from global illumination is preety complex and requires to iterate over all pixels of the enviorment texture. 

For This reasons, the ambient occlusion will only simplify self occlusions or inter occlusions but not shadow projection. A phisically correct approach would not require ambient occlusion but it will take longer to render. -->

# Ambient Occlusion
Finally!!, we get to point of the post. ``We are now on the Lambert side of the formula`` {% ref "eq:energy" %}.

AO is actually the same idea as Reflection Occlusion. The biggest difference is that we will use lots of vectors per fragment instead of one. 

``The diffuse light Concept:`` Mirrors bounce light from exactly one point (at least in a perfect mirror). There are cases where the mirror may be a bit dirty and it reflects light from closer directions generating a blurred image. Diffuse light works under the premise that  ``light will hit the surface from all directions``. 

{% figure id="diffuse-variable" caption="figure 14: Lambert. Image extracted from ``learnopengl``." %}
\images\ambient_occlusion\comparing_spheres.png
{% endfigure %}

{% alert warning %}
This is only for illustration purposes. 
**Concepts like Specular, Diffuse, microfacet model, Roughness, Metalness, Fresnel, Physically Based Rendering and scattering light deserve a post for themselves.** 

I will try to explain in the future the physical principles behind  diffuse and specular lights. For the moment lets just assume the`` diffuse component represents the absorbed light inside the surface and radiated back in random directions``.

For more context we can look at the lambertian formula. You can also look at {% cite learnopengl_diffuse_irradiance %}:
{% equation id="eq:lambert" %}
L_d = k_d \cdot I \cdot max(0,N \cdot L)
{% endequation %}


{% include big_figure.html image="https://learnopengl.com/img/pbr/ibl_hemisphere_sample.png" 
    caption="figure 14: Lambert. Image extracted from ``learnopengl``." 
    id="img:14"
%}

{% endalert %}


Since light hits a surface point from all directions ``we must check occlusion on all directions too``. If there is no occlusion, the diffuse component will become the weighted average of all incident light. 

A basic algorithm to calculate Ambient Occlusion is to generate random vectors inside a hemisphere aligned with the fragment normal. We ray cast in those directions and store how many rays have been occluded. We average the result and store it in a texture.

An additional layer of realism would be to integrate lambert's rule where more aligned incident rays with the fragment's normal, the more they contribute to the final result. 

This technique is view independent therefore we can bake it and use it in any context.


<!-- Ambient Occlusion map: Once we have the scene geometry, we iterate over all points in the surface and generate an hemisphere oriented in the surface normal direction. Now we can check for colisions of the rays being casted in those directions and store the result plus the angle. Based on the lambertian formula, we know that incident light has more effect when the angle is close to 0º and it starts to reflect more light the closer it gets to 90º degrees.

<!-- Ambient Occlusion bend normal map -->
<!-- To know which part of the enviorment map is most representative of a certain surface point we can store that information based on the hemisphere rays generated before. -->



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
