---
layout: post
title:  "Ambient Occlusion"
date:   2024-11-27 18:17:51 +0200
preview: "/images/ambient_occlusion/ambient occlusion example.png"
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
<!-- Representing reality has been an impactful research field for centuries. It exists across various artistic techniques such as painting and sculpture.  -->

Understanding reality and representing it accuratelly has been an active research field for centuries on all artistic disciplines.

Movements like impressionism have tried to find better ways of illustrating reality than reality itself (perceived reality). They depict objects as light strokes, avoiding a defined shape or form. **Light representation affects emotions, credibility, intention and context.**

In recent years we have seen an increasing graphical improvement on computer generated images trying to get closer to reality. This provided new techniques to simulate light behavior on virtual enviorments.

<!-- We all like Games, Films, cartoons and other media contents. In recent years we have seen an increasing graphical improvement trying to get closer to reality. This pursuit has existed for centuries across various artistic fields such as paintings and sculpture. On the impressionist movement, they tried to capture a scene without shapes or form, just representing the light and letting it define the elements.  -->

{% figure id="paintings" size="1.0" caption="Paintings trying to represent light in an appealing way" col="2" %}
https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/960px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg
/images/ambient_occlusion/toystory.jpg
{% endfigure %}

Computer generated films such as Toy story, illustrates the evolution of phisically based rendering techniques (PBR). Even high stylized games are not free of this requirement of respecting **light behavior** since it **directly impacts the viewers inmersion into the story**. 

That is why some rules are constant for good looking media such as **light propertyes** (color, intensity, spectrum, ...) and **light interaction** (global illumination, ambient occlusion, transparency, caustics, ... ). 

{% figure id="Ambient-Occlusion-Skyrim" size="1.0" caption="https://www.gamedesigning.org/wp-content/uploads/2019/10/enabling-ambient-occlusion-1.jpg" %}
https://www.gamedesigning.org/wp-content/uploads/2019/10/enabling-ambient-occlusion-1.jpg
{% endfigure %}


## Global Illumination & Image Base Lighting
These concepts are out of scope but I will summarize them.

### Global Illumination
``Global Illumination`` is a collection of techniques to simulate realistic lighting. 

One of the characteristics of light is that it bounces from one surface to another. Calculating all bounces of light reaching each surface point is expensive but provides good results. For this calculations we use path tracing and ray tracing algorithms.

{% figure id="lumen" size="0.66" caption="Unreal Engine: Lumen technology." %}
https://cdn2.unrealengine.com/feed-ue5-early-access-livestream-lumen-1920x1080-a4d78e37fd8e.jpg
{% endfigure %}

Algorithms like **ray tracing** and **path tracing** simulate full ``global illumination``, but they require significant processing power. In exchange, they provide **close to real light occlusion** and **do not need to use ambient occlusion techniques**. AO can still be used for enhancing some effects.

This techniques are so realistic because **they use the scene geometry and textures to calculate the light** for a certain number of iterations (``global illumination``). This iterations are known as ``bounces``, the number of times a light path collides on a surface and changes direction.

{% alert secondary %}
**Example Renderers:**  
- *Ray tracing renderer:* Arnold, V-Ray, or Mental Ray  
- *Path tracing renderer:* Cycles (Blender), LuxCoreRender, or Octane Render  
Cycles, for example, is a path tracing renderer integrated in Blender that simulates global illumination by tracing the paths of many light rays per pixel.
{% endalert %}

To simplify or "fake" global illumination **we could place lights from all directions** by "gessing" how the surface should look. Whith this strategy we avoid computing ``global illumination`` and we only use a single bounce from each light.

{% figure id="global-illumination" size="1.0" caption="Global Illumination using virtual lights." %}
    /images/ambient_occlusion/global_ilumination.png
    /images/ambient_occlusion/global_ilumination_back.png
{% endfigure %}


### Image Base Lighting
Instead of placing hundreds of lights in the scene, we can **group them into an image**. This images are called: environment texture, cube map, HDRI, spherical map... Each one with its own characteristics. 

{% figure id="global_enviorment" size="0.66" caption="HDRI image of a house" %}
    /images/ambient_occlusion/photo_studio_loft_hall_2k.jpg
{% endfigure %}

{% figure id="gi_cycles" size="0.5" caption="Global Illumination using environment image and path trace engine (cycles)." %}
    /images/ambient_occlusion/global_ilumination_cycles.png
{% endfigure %}

{% figure id="ibl" size="0.5" caption="Global Illumination using environment image and Image Based Lighting (IBL)." %}
    /images/ambient_occlusion/global_ilumination_eevee.png
{% endfigure %}

For ``global illumination`` we will calculate light and bounces assuming the environment image are virtual light placed really far. 

For ``Image Based Lightning`` we will use it as a projected texture on the surface making the calculation almost instant compared to Ray Tracing or Path Tracing. One limitation of ``IBL`` is that **we do not take into account occlusion**, buuuuut... we are trying to overcome that.

{% figure id="IBL-no-shadows" size="0.49" caption="Suzanne with Image Based Lighting shows light under the hat and is not casting shadows from the windows" %}
/images/ambient_occlusion/ao_without_shadows.png
{% endfigure %}
{% figure id="global-illumination-path-tracing" size="0.49" caption="Suzanne rendered with path tracing shows how light is blocked by near geometry as well as blocking lights from the windows" %}
/images/ambient_occlusion/ao_with_shadows.png
{% endfigure %}

{% alert  %}
RESUME: **The most physically accurate approach for rendering is by ray trancing and path tracing. Real time techniques require a global illumination simplifications, usually Image Based Lighting techniques. This simplifications have limitations that we must overcome**.
{% endalert %}

# Birth of a new technique
Ambient Occlusion was first used in "Pearl harbour" to store the quantity of ambient light that reaches the surface of an airplane {% ref figure:pearl-harbor %}. This same technique was used in Cruise Control a few years before to determine the reflection intensity of each window. Find more information on  {% cite history-background %}.

{% figure id="pearl-harbor" caption="Pearl Harbor Reflection Occlusion." %}
https://www.fxguide.com/wp-content/uploads/2011/01/ocllusion.jpg
{% endfigure %}



We already mentioned that this technique can be expensive and time consuming. Luckily for them, films do not require real time processes even though its still desired. For this productions, they **baked geometry occlusions in image sequences** and use it in the rendering pipeline as another texture. 

We are going to explore **two different techniques developed by ILM: ``Ambient Occlusion`` and ``Reflection Occlusion``**. The reason they developed two techniques is because materials are usually composed of two components: ``Diffuse`` and ``Specular``.

{% equation id="fr_diffuse" %}
fr_{diffuse} = k_{diffuse} \cdot f_{lambert}
{% endequation %}

{% equation id="fr_specular" %}
fr_{specular} = k_{specular} \cdot f_{cook-torrance}
{% endequation %}

{% equation id="energy" %}
fr = fr_{diffuse} + fr_{specular}
{% endequation %}


# Reflection Occlusion
We will start by explaining Reflection Occlusion. 

**Reflection Occlusion (RO)** is a rendering technique used to estimate how much ``reflected light`` reaches a surface point. In essence, it simulates how exposed each point is towards the reflection vector.
{% equation id="camera-vector" %}
v = \text{camera\_position} - \text{surface\_position}
{% endequation %}

{% equation id="reflection-vector" %}
r = v - 2(v \cdot n)n
{% endequation %}

First, compute the reflection vector {% equation_inline r %} of the view direction {% equation_inline v %} (from the surface to the camera) against the normal {% equation_inline n %}  using the {% ref equation:reflection-vector %} formula.

Now, define a visibility function along that reflection vector:
{% equation id="R-occlusion-function" %}
RO(p)=V(p,r)
{% endequation %}

{% equation_inline V(p,r) %} uses **ray tracing to detect whether the fragment is occluded or not**. We then can store the result on an image and darken the reflections in the final render.

Remember, this technique is **view dependent** therefore we need to compute it each frame or bake it if we know the camera position and the scene will not be modified.

### Computation
``The process to obtain the Reflection Occlusion path is``:
1. Get the surface normal and position. 
2. Get the camera position.
3. Calculate the reflection vector from the three previous variables {% ref equation:reflection-vector %}. It will look like figure {% ref figure:reflect-vectors %}.
4. Use some technique to calculate ray intersections from the surface to the rest of geometry {% ref figure:reflection-occlusion-image %}.
5. Store the collision distance per fragment.
6. Use it to darken the Reflection Map with a shader.


{% figure id="reflect-vectors" caption="Generate reflect vectors" size="0.5" %}
/images/ambient_occlusion/ReflectionOcclusion.png
{% endfigure %}

{% figure id="reflection-occlusion-image" caption="Detect reflect vectors occlusions" size="0.5" %}
/images/ambient_occlusion/ReflectionOcclusion_raytrace.png
{% endfigure %}


The limitation of this technique is that, **instead of reflecting the collided surface, it  just darkens the fragment**. For general purposes this is enough. 

One of the scenarios where this approach may fail is on the use of ``enviorment maps`` with ``IBL`` when there are objects in scene. If  {% equation_inline V(p,r) %} is pondered by distance as {% equation_inline  V(p,r)=max(0,1− \frac{d\(p,r\)​}{R} ) %} with a small R, we may end up with a reflection through a wall that does not make sense. Imagine being in a basement and you see the sky being reflected by a glass of water, that would be weird...

{% alert secondary %}
Here, R represents the radius where we are detecting collisions. If R is too small we may end up not detecting any collision and assuming the surface is exposed to the enviorment map even if it is on the inside of a house.
{% endalert %}

In **path tracing renderers**, you are usually provided a **parameter to choose the bounces limit**. This is of course more realistic, but may take several minutes {% ref figure:reflect-bounces %}. We also avoid showing incorrect reflections when occluders are far since we dont use IBL techniques.

{% figure id="reflect-bounces" caption="Cycles Reflections with 0, 1 and 2 bounces respectively." %}
/images/ambient_occlusion/cyclesReflections.png
{% endfigure %}

As easy and powerful this method may seem, it is not used because of the processing time it takes for each frame to calculate collision. New techniques like Ray Tracing may be able to provide real time Reflection Maps in the future.


# Ambient Occlusion
Finally!!, we get to point of the post. We are now on the ``Diffuse side of the formula`` {% ref equation:energy %}.

**Ambient Occlusion (AO)** is a rendering technique used to estimate how much ambient light reaches a surface point. In essence, **it simulates how exposed each point is to surrounding light**, based on nearby geometry.

{% equation id="ao-formula" %}
AO(p) = \frac{1}{\pi} \int_{\Omega} V(p, \omega) \, (n \cdot \omega) \, d\omega
{% endequation %}

**Explanation:**  
- {% equation_inline p %}: Surface point being evaluated.  
- {% equation_inline n %}: Surface normal at {% equation_inline p %}.  
- {% equation_inline \omega %}: Sampled direction within the hemisphere {% equation_inline \Omega %} centered around {% equation_inline n %}.  
- {% equation_inline V(p, \omega) %}: Visibility function; returns 1 if the direction {% equation_inline \omega %} from {% equation_inline p %} is unoccluded, 0 if occluded by geometry.  
- {% equation_inline n \cdot \omega %}: Lambertian cosine weighting, giving more influence to directions closer to the normal.  
- The integral averages visibility over all directions in the hemisphere, weighted by the cosine of the angle to the normal. The result is normalized by {% equation_inline \frac{1}{\pi} %}.

{% alert secondary %}
**Reminder:**

Diffuse component is calculated by adding the incident light of all directions into the surface point. For this reason, occlusion can come from any of those directions.
{% endalert %}

This formula computes the ambient occlusion factor at a point by **integrating the fraction of unblocked ambient light over the hemisphere above the surface**, simulating how much ambient light reaches that point.

In the real world, light rays are often blocked or "occluded" by objects. This effect happens naturally and gives surfaces subtle shadows in creases, corners, and areas where objects are close together. Recreating this effect adds a layer of realism to CGI scenes ({% ref figure:real-world-ao %}).

{% figure 
id="real-world-ao" 
size="0.49"
caption="Ambient occlusion visible in real-world objects." %}
/images/ambient_occlusion/real_ao.jpg
{% endfigure %}

That said, **ambient occlusion is not physically accurate**, but rather an *artistic approximation* of a real-world phenomenon. It's designed to enhance depth perception and spatial relationships in rendered images without simulating full global illumination {% ref figure:ao-example %}.

{% figure id="ao-example" caption="Wave grid before and after applying Ambient Occlusion" %}
/images/ambient_occlusion/blender_ao_shader_off.png
/images/ambient_occlusion/blender_ao_shader.png
{% endfigure %}

AO(p) will generate a value (usually between 0 and 1) on a surface point that represents how much light is reaching. This technique is agnostic to the scene lights and as long as geometry doesn't change, it can be baked.


**Ambient occlusion will take care of the contact shadows**. It will not account for directional shadows cast by distant light sources like windows — it only simulates shadowing caused by nearby geometry. 

Let's now compare the result with *``path tracing``* and *``global illumination+AO``*. The model **Suzanne should have a shadow under the hat and also occlude light to his right ear**. 

{% alert secondary %}
We will use an Image Based Lighting Global Illumination technique where we project an image into the geometry based on its normal direction (diffuse lightning).
All darkened and lighted areas will be provided from an irradiance texture of the environment.
{% endalert %}

{% figure id="shadow-example" caption="Path Tracing Shadow Example" size="0.8" %}
/images/ambient_occlusion/shadow_example.png
/images/ambient_occlusion/ao_example .png
{% endfigure %}

The following interactive example offers three slides:
- global_illumination: Image Based Lighting, projects an irradiance texture on the geometry based on surface normal direction.
- AO: Blocked light factor.
- shadow: Physically based rendered shadow.


{% glb_viewer id='viewer-1' models='suzane,sphere' materials='material1,enviorment' %}




### Computation
AO is actually the same idea as Reflection Occlusion. The biggest difference is that we will use a hemisphere per fragment instead of one vector. To avoid millions of calculations, we will approximate the integral with montecarlo approximation.  



{% equation id="ao-formula" %}
AO(p) \approx \frac{1}{N} \sum_{i=1}^{N} V(p, w_i) \cdot (n \cdot w_i)
{% endequation %}

``The diffuse light Concept:`` Mirrors bounce light from exactly one point (at least in a perfect mirror). There are cases where the mirror may be a bit dirty and it reflects light from closer directions generating a blurred image. Diffuse light works under the premise that  ``light will hit the surface from all directions``. This is due at the nature of photons that penetrates on the first layers of the object and bounce back to the observator.

{% figure id="diffuse-variable" caption="Three spheres with different diffuse component" %}
/images/ambient_occlusion/comparing_spheres.png
{% endfigure %}

{% alert warning %}
This is only for illustration purposes. 
**Concepts like Specular, Diffuse, microfacet model, Roughness, Metalness, Fresnel, Physically Based Rendering and scattering light deserve a post for themselves.** 

I will try to explain in the future the physical principles behind  diffuse and specular lights. For the moment lets just assume the ``diffuse component represents the absorbed light inside the surface and radiated back in random directions``.

{% endalert %}


For more context we can look at the lambertian formula. You can also look at {% cite learnopengl_diffuse_irradiance %}:
{% equation id="eq:lambert" %}
L_d = k_d \cdot I \cdot max(0,N \cdot L)
{% endequation %}

{% figure caption="Lambert. Image extracted from ``learnopengl``." id="lambert-w"  size="0.5" col="1" %}
/images/ambient_occlusion/ibl_hemisphere_sample.png
{% endfigure %}

Since in a complitelly diffuse surface, light hits a point from all directions {% ref figure:lambert-w %}, **we must check occlusion on all directions too!!**. 

<!-- If there is no occlusion, the diffuse component will become the weighted average of all incident light.  -->

A basic algorithm to calculate Ambient Occlusion is to **generate random vectors inside a hemisphere aligned with the fragment normal**. We ray cast in those directions and store how many rays have been occluded. We average the result and store it in a texture.

{% equation id="ao-simple" %}
AO(p) = \frac{1}{N} \sum_{i=1}^{N} V(p, w_i)
{% endequation %}

{% figure caption="Generate random vectors in a hemisphere oriented with the fragment normal" id="ao-basic"  size="0.5" col="1" %}
/images/ambient_occlusion/ambient occlusion example2.png
{% endfigure %}

{% figure caption="Average the number of collisions for each fragment" id="ao-average"  size="0.5" col="1" %}
/images/ambient_occlusion/ambient occlusion example.png
{% endfigure %}

{% figure caption="Ambient occlusion Basic implementation" id="ao-result"  size="0.5" col="1" %}
/images/ambient_occlusion/ambient occlusion example1.png
{% endfigure %}

An additional layer of realism would be to integrate lambert's rule that states: **the more aligned incident rays are with the fragment's normal, the more they contribute to the final result**.

{% equation id="ao-weighted" %}
AO(p) = \frac{1}{N} \sum_{i=1}^{N} V(p, w_i) \cdot (n \cdot w_i)
{% endequation %}


{% figure caption="Ambient occlusion with dot product weight" id="ao-result"  size="0.5" col="1" %}
/images/ambient_occlusion/ambient occlusion dot.png
{% endfigure %}

**This technique is view independent** therefore we can bake it and use it in any context.

<!-- With the above implementations, hemisphere rays weighted by aligment with normal direction, would be enough to make a correct implementation.  -->
<!-- Further improvements would involve keeping track of the bounce color and weight it on the angle. In case the predominant direction is occluded, we will not use the main color but the surrounding ones. This is particularly usefull to avoid the sky illumination for example when there is a roof.   A simplification of this method is to store a vector that is not the normal but it represents better the final color we look for -->

We can go even further and register the mean direction of no-occlusion to later on color that fragment based on the bended normal direction of not occluded vectors. We can also detect the distance of the occluding object to weight length collision.

{% equation id="ao-bent-normal" %}
\mathbf{b}(p) = \frac{1}{M} \sum_{i=1}^{N} V(p, w_i) \cdot w_i
{% endequation %}

Where:
- {% equation_inline \mathbf{b}(p) %}: Bent normal (mean not-occluded direction) at point {% equation_inline p %}.
- {% equation_inline w_i %}: Sampled direction in the hemisphere.
- {% equation_inline V(p, w_i) %}: Visibility function (1 if not occluded, 0 if occluded).
- {% equation_inline M = \sum_{i=1}^{N} V(p, w_i) %}: Number of not-occluded samples.

This formula averages all incident directions that are not occluded, resulting in the mean direction of unblocked ambient light.

{% figure caption="Ambient occlusion with dot product weight" id="ao-result"  size="0.5" col="1" %}
/images/ambient_occlusion/normal collision direction.png
{% endfigure %}



<!-- 
imatge de llum occluida amb la calavera
imatge de ambient occlusion applicat
imatge guardant el vector mes representatiu de la geometria
imatge de ambient occlusion amb nou vector applicat
-->

Lets review what we got until this point and put names to this techineques:
- Ray traced AO: Realistic but requires Ray tracing only avalible on some GPU's and of limited capacity (maybe a 100 rays for a hole sceene), too little resolution unless multiple passes.
- Hemispherical sampling: with some path traycing or ray tracing technique we check the occlusion on each surface point taking into account all directions on a hemisphere oriented in the normal direction.
- Bent normals/irradiance volume: we store the less occluded direction and use it to calculate the surface color.
- Baked AO maps in textures: once the above calculations are done, we proceed to store the result.

<!-- Ambient Occlusion map: Once we have the scene geometry, we iterate over all points in the surface and generate an hemisphere oriented in the surface normal direction. Now we can check for colisions of the rays being casted in those directions and store the result plus the angle. Based on the lambertian formula, we know that incident light has more effect when the angle is close to 0º and it starts to reflect more light the closer it gets to 90º degrees.

<!-- Ambient Occlusion bend normal map -->
<!-- To know which part of the enviorment map is most representative of a certain surface point we can store that information based on the hemisphere rays generated before. -->


# Conclusion
{% figure caption="Image Based Lightning implementation with AO+RO" id="imb-result"  size="1.0" col="3" %}
/images/ambient_occlusion/IMB1.png
/images/ambient_occlusion/IMB2.png
/images/ambient_occlusion/IMB3.png
{% endfigure %}

This is the basic idea behind Ambient occlusion. The combination of AO and RO on the different sides of PBR rendering provides a good starting point that can be improved further artistically.

{% equation id="eq:PBR" %}
fr = (fr_{diffuse} \cdot AO_{map}) \\ \hspace{0.8cm} + \\ \hspace{0.8cm} (fr_{specular} \cdot RO_{map})
{% endequation %}

As mentioned, there is a big computation requirement for this technique that prevents it's use in real time. To solve this problem, a new set of techniques called Real Time Ambient Occlusion emerged. In exchange for accuracy, they archieve real time rendering on dynamic scenes that can not be backed. Usually they do not implement the reflection occlusion component since it requires too much computations that can not be avoided if we want a good result on the RO map.  

# Real Time Ambient Occlusion
When games entered in a *graphics war* they looked for applying AO in the gamplay. At first the only method known was to bake it for static elements of the scene.

For dynamic elements, the solution was to take into account only objects self geometry to calculate AO. The contact shadows of dynamic elements on the static ones was still an unsolved problem

<!-- image of a skull with a darkened bottom, when rotated, the ao does not update. -->


## SSAO
Screen space ambient occlusion techniques as the name suggest, will provide AO by using the screen space coordinates of the render. This provides a real time ambient occlusion calculation even though that it requires a few triks to perform fast that lead to less accuracy.

- basic SSAO
- HBAO/HBAO+
- GTAO
- SSDO
- VXAO
- SAO

# Bibliography
{% bibliography ieee %}
