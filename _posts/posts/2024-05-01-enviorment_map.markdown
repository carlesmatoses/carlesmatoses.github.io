---
layout: post
title:  "Enviorment Maps"
date:   2024-05-1 18:17:51 +0200
preview: "/images/image-not-found.png"
categories: post
permalink: post/EnviormentMaps!
---

* What kind of enviorment maps exist?  
* How are they calculated?  
* How can they be implemented?  
<!-- end-abstract --> 


<h1>Enviorment Maps</h1>
In computer graphics is really common to use this so called enviorment maps. This concept is usually refferred to `images that represent the surrounding light of the scene origin.

Two common aproaches for storing this information are `cube maps` and `sphere maps`. 

1. **Sphere Maps** are really common in lots of 3D softwares like blender because they are stored in a single image which makes them really easy to share and control. 

2. In the other hand, **Cube Maps** require six diferent images as the name indicates.

<div class="alert alert-secondary" role="alert">
    We are not going to explore the file extensions or datatypes of the pixel values. I consider this information more relevant for future posts explaining digital color science.
</div>


<h2>Basic concepts</h2>
Enviorment maps comme from the necessity of representing realistic light for digital scenes. In a digital enviorment is really common to represent a light as a single point irradiating on all directions but in the real world light bounces from multiple directions before getting to the subject.

<div class="row">
    <div class="col">
        {% include figure.html image="/images/image-not-found.png" caption="Image Description" 
        %}
    </div>
    <div class="col">
        {% include figure.html image="/images/image-not-found.png" caption="Second Image Description sss" 
        id="figure1" 
        %}
    </div>
</div>

Of course, `enviorment maps are just an aproximation and simplification` but they provide a really good improvement in digital scenes.

To get an enviorment light we can use a perfect metallic sphere and take a picture. This will result in all the information of the surrounding light on a single image. Of course the final resolution of the enviorment map will depend on the camera and some information on the borders may be lost for distortion and lack of resolution.

<h1>Sphere Maps</h1>

<h1>Cube Maps</h1>



