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

- Contextualize the problem. All media, stylized or not, needs a certain Lighting realism to feel appealing. This has been the motivation for thousands of artists and different movements such as impressionism

- Games and films developed physical based rendering textures and environment maps to improve Lighting and global illumination.

- For real time applications we need to fake some real phenomena such as shadows.

- materials are composed of two components: Diffuse and Specular.
  
- Each component requires a faking method for occlusion shadows: Diffuse->AO and Specular->RO

- This techniques (AO RO) where developed by ILM.

- Reflection Occlusion: 
  - requirements
    - view dependent
    - light independent
    - reflective surfaces
  - Calculation:
    - normal and position vectors -> reflection vector -> occlusion factor
  - Example
  - Path tracing approximation with real reflections
  - it can be stored as textures

- Ambient Occlusion:
  - Requirements
    - view independent
    - light independent
  - Calculation
    - Normal and position, generate random vectors, check occlusion of each one, calculate factor (weighted).
  - Additional improvements
    - Store the direction with most influence to extract the environment color later.

- Compare two images: path tracing vs image based Lighting + AO + RO

- SSAO: Real-Time Approximation

- Screen-Space Ambient Occlusion (SSAO) approximates ambient occlusion using depth and normal buffers rendered from the camera’s point of view.

- It’s fast and doesn’t require ray-tracing, but it has drawbacks:
  - Only accounts for visible geometry.
  - Can produce noise or artifacts.

- Common SSAO Variants
  - **HBAO+** (Horizon-Based AO by NVIDIA): better edge detection.
  - **GTAO** (Ground Truth AO by Epic): balances performance and realism.
  - **SSDO** (SS Diffuse Occlusion): includes directional lighting and color bleeding.

-->


# Introduction
We all like Games, Films, cartoons and other media contents. In recent years we have seen an increasing graphical improvement trying to get closer to reality. This pursuit has existed for centuries across various artistic fields such as paintings and sculpture. On the impressionist movement, they tried to capture a scene without shapes or form, just representing the light and letting it define the elements. 

{% figure id="lumen" size="1.0" caption="Paintings trying to represent light in an appealing way" col="2" %}
https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/960px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg
/images/ambient_occlusion/toystory.jpg
{% endfigure %}

Computer generated films such as Toy story, illustrates the evolution of techniques for photorealism. Even high stylized games are not free of this requirement of respecting light behavior since it will directly impact our emotional perception. 

That is why some rules are constant for good looking media such as representing shadows, light intensity and light interaction. 

{% figure id="Ambient Occlusion Skyrim" size="1.0" caption="https://www.gamedesigning.org/wp-content/uploads/2019/10/enabling-ambient-occlusion-1.jpg" %}
https://www.gamedesigning.org/wp-content/uploads/2019/10/enabling-ambient-occlusion-1.jpg
{% endfigure %}


## Global Illumination & Image Base Lighting
**These concepts are out of scope but I will summarize them.**

### Global Illumination
``Global Illumination`` is a collection of techniques to simulate realistic lighting. 

One of the characteristics of light is that it bounces from one surface to another. Calculating all bounces of light reaching each surface point is expensive but provides good results. For this calculations we use path tracing and ray tracing algorithms.

{% figure id="lumen" size="0.5" caption="Unreal Engine: Lumen technology." %}
https://cdn2.unrealengine.com/feed-ue5-early-access-livestream-lumen-1920x1080-a4d78e37fd8e.jpg
{% endfigure %}

Algorithms like **ray tracing** and **path tracing** simulate full global illumination, but they require significant processing power. In exchange, they provide **close to real light occlusion** and **do not need to use ambient occlusion techniques**.

This techniques are so realistic because they use the scene geometry and textures to calculate the light for a certain number of iterations. This iterations are the number of times a light path is colliding on a surface and changing direction.

{% alert secondary %}
**Example Renderers:**  
- *Ray tracing renderer:* Arnold, V-Ray, or Mental Ray  
- *Path tracing renderer:* Cycles (Blender), LuxCoreRender, or Octane Render  
Cycles, for example, is a path tracing renderer integrated in Blender that simulates global illumination by tracing the paths of many light rays per pixel.
{% endalert %}


To simplify or "fake" global illumination **we could place lights from all directions simulating the sky or even the floor** if some objects bounce light.

{% figure id="global-illumination" size="1.0" caption="Global Illumination using virtual lights." %}
    /images/ambient_occlusion/global_ilumination.png
    /images/ambient_occlusion/global_ilumination_back.png
{% endfigure %}


### Image Base Lighting
Instead of placing hundreds of lights in the scene, we can **group them into an image**. This images are called: environment texture, cube map, HDRI, spherical map... Each one with its own characteristics. 

{% figure id="gi_cycles" size="0.55" caption="HDRI image of a house" %}
    /images/ambient_occlusion/photo_studio_loft_hall_2k.jpg
{% endfigure %}

{% figure id="gi_cycles" size="0.5" caption="Global Illumination using environment image and path trace engine (cycles)." %}
    /images/ambient_occlusion/global_ilumination_cycles.png
{% endfigure %}

{% figure id="ibl" size="0.5" caption="Global Illumination using Image Based Lighting (IBL)." %}
    /images/ambient_occlusion/global_ilumination_eevee.png
{% endfigure %}


One ``limitation`` of IBL is that **we do not take into account occlusion**, buuuuut... we are trying to overcome that.

{% figure id="IBL_no_shadows" size="0.49" caption="Suzanne with Image Based Lighting shows light under the hat and is not casting shadows from the windows" %}
\images\ambient_occlusion\ao_without_shadows.png
{% endfigure %}
{% figure id="global_illumination_path_tracing" size="0.49" caption="Suzanne rendered with path tracing shows how light is blocked by near geometry as well as blocking lights from the windows" %}
\images\ambient_occlusion\ao_with_shadows.png
{% endfigure %}

{% alert  %}
RESUME: **The most physically accurate approach for rendering is by ray trancing and path tracing. Real time techniques require a global illumination simplifications, usually Image Based Lighting techniques. This simplifications have limitations that we must overcome**.
{% endalert %}

# Birth of a new technique
Ambient Occlusion was first used in "Pearl harbour" to store the quantity of ambient light that reaches the surface of an airplane [figure 4](#img:4). This same technique was used in Cruise Control a few years before to determine the reflection intensity of each window. Find more information on  {% cite history-background %}.

{% include big_figure.html image="https://www.fxguide.com/wp-content/uploads/2011/01/ocllusion.jpg" 
    caption="figure 4: Pearl Harbor Reflection Occlusion." 
    id="img:4"
%}



We already mentioned that this technique can be expensive and time consuming. Luckily for them, films do not require real time processes even though its still desired. For this productions, they ``baked geometry occlusions in image sequences`` and use it in the rendering pipeline as another texture. 

We are going to explore **two different techniques developed by ILM: Ambient Occlusion and Reflection Occlusion**. The reason they developed two techniques is because materials are usually composed of two components: ``Diffuse`` and ``Specular``.

{% equation id="energy" %}
fr = k_{diffuse} \cdot f_{lambert} + k_{specular} \cdot f_{cook−torrance}
{% endequation %}

In equation {% ref equation:energy %} ``lambert represents the diffuse component`` and ``cook-torrance represents the specular component``.



# Reflection Occlusion
We will start by explaining Reflection Occlusion. 

**Reflection Occlusion (RO)** is a rendering technique used to estimate how much ``reflected light`` reaches a surface point. In essence, it simulates how exposed each point is towards the reflection vector.

This technique uses ``ray tracing to detect whether the fragment is occluded or not``. We then store the result on an image and darken the reflections in the final image.

Remember, this technique is **view dependent** therefore we need to compute it each frame or bake it if we know the camera position and the scene will not be modified.

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


The limitation of this technique is that, ``instead of reflecting itself, it  just darkens the surface``. For general purposes this is enough. 

In path tracing renderers you are usually provided a parameter to choose how many times light will be reflected. This is of course more realistic, but may take several minutes {% ref figure:reflect-bounces %}.

{% figure id="reflect-bounces" caption="Cycles Reflections with 0, 1 and 2 bounces respectively." %}
\images\ambient_occlusion\cyclesReflections.png
{% endfigure %}

As easy and powerful this method may seem, it is not used because of the processing time it takes for each frame to calculate collision. New techniques like Ray Tracing may be able to provide real time Reflection Maps in the future.


# Ambient Occlusion
Finally!!, we get to point of the post. ``We are now on the Lambert side of the formula`` {% ref equation:energy %}.

**Ambient Occlusion (AO)** is a rendering technique used to estimate how much ambient light reaches a surface point. In essence, ``it simulates how exposed each point is to surrounding light``, based on nearby geometry.

In the real world, light rays are often blocked or "occluded" by objects. This effect happens naturally and gives surfaces subtle shadows in creases, corners, and areas where objects are close together. Recreating this effect adds a layer of realism to CGI scenes ({% ref figure:real-world-ao %}).

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

AO will generate a value (usually between 0 and 1) on a surface point that represents how much light is reaching. This technique is agnostic to the scene lights and as long as geometry on the scene doesn't change, it can be baked.

Let's now compare the result with ***path tracing* and *global illumination+AO***. The model ``Suzanne should have a shadow under the hat and also occlude light to his right ear``. 

**Ambient occlusion will take care of the contact shadows on the hat**. AO does not account for directional shadows cast by distant light sources like windows — it only simulates shadowing caused by nearby geometry. 

{% alert secondary %}
All darkened and lighted areas will be provided from an irradiance texture of the environment. We will use an Image Based Lighting Global Illumination technique where we project a blurred image into the geometry based on its normal direction.
{% endalert %}

{% figure id="shadow-example" caption="Path Tracing Shadow Example" size="0.8" %}
\images\ambient_occlusion\shadow_example.png
\images\ambient_occlusion\ao_example .png
{% endfigure %}

The following interactive example offers three slides:
- global_illumination: Image Based Lighting, projects an irradiance texture on the geometry based on surface normal direction.
- AO: Blocked light factor.
- shadow: Physically based rendered shadow.


{% glb_viewer id='viewer-1' models='suzane,sphere' materials='material1,enviorment' %}





AO is actually the same idea as Reflection Occlusion. The biggest difference is that we will use lots of vectors per fragment instead of one. 

``The diffuse light Concept:`` Mirrors bounce light from exactly one point (at least in a perfect mirror). There are cases where the mirror may be a bit dirty and it reflects light from closer directions generating a blurred image. Diffuse light works under the premise that  ``light will hit the surface from all directions``. 

{% figure id="diffuse-variable" caption="figure 14: Lambert. Image extracted from ``learnopengl``." %}
\images\ambient_occlusion\comparing_spheres.png
{% endfigure %}

{% alert warning %}
This is only for illustration purposes. 
**Concepts like Specular, Diffuse, microfacet model, Roughness, Metalness, Fresnel, Physically Based Rendering and scattering light deserve a post for themselves.** 

I will try to explain in the future the physical principles behind  diffuse and specular lights. For the moment lets just assume the ``diffuse component represents the absorbed light inside the surface and radiated back in random directions``.

For more context we can look at the lambertian formula. You can also look at {% cite learnopengl_diffuse_irradiance %}:
{% equation id="eq:lambert" %}
L_d = k_d \cdot I \cdot max(0,N \cdot L)
{% endequation %}

{% figure caption="figure 14: Lambert. Image extracted from ``learnopengl``." id="lambert_w" %}
https://learnopengl.com/img/pbr/ibl_hemisphere_sample.png
{% endfigure %}

{% endalert %}


Since light hits a surface point from all directions ``we must check occlusion on all directions too!!``. If there is no occlusion, the diffuse component will become the weighted average of all incident light. 

A basic algorithm to calculate Ambient Occlusion is to generate random vectors inside a hemisphere aligned with the fragment normal. We ray cast in those directions and store how many rays have been occluded. We average the result and store it in a texture.

An additional layer of realism would be to integrate lambert's rule that states: the more aligned incident rays are with the fragment's normal, the more they contribute to the final result.

This technique is view independent therefore we can bake it and use it in any context.


<!-- Ambient Occlusion map: Once we have the scene geometry, we iterate over all points in the surface and generate an hemisphere oriented in the surface normal direction. Now we can check for colisions of the rays being casted in those directions and store the result plus the angle. Based on the lambertian formula, we know that incident light has more effect when the angle is close to 0º and it starts to reflect more light the closer it gets to 90º degrees.

<!-- Ambient Occlusion bend normal map -->
<!-- To know which part of the enviorment map is most representative of a certain surface point we can store that information based on the hemisphere rays generated before. -->


# SSAO

# Bibliography
{% bibliography %}
