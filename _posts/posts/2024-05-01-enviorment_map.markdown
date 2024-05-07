---
layout: post
title:  "Environment Maps"
date:   2024-05-1 18:17:51 +0200
preview: "/images/EnvironmentMap.png"
categories: post
permalink: post/EnvironmentMaps
---

- What kind of Environment maps exist?  
- How are they calculated?  
- How can they be implemented?  
<!-- end-abstract --> 


# Environment Maps

In computer graphics is really common to use Environment maps to emulate the real behavior of light [Environment Map 1](#img:Environment-map). 

The concept Environment Map is usually refferred to images that represent the surrounding light of one single point [scene origin 2](#img:scene-origin). 

{% include figure.html image="/images/realistic_lightning.jpg" 
caption="1. Environment map" 
id="img:Environment-map"
%}

{% include figure.html image="/images/environment_point.png" 
caption="2. Environment map illuminating the center point of the scene." 
id="img:scene-origin"
%}

Two common aproaches for storing this information are `cube maps` and `sphere maps`. 

1. **Sphere Maps** are really common in lots of 3D softwares like blender because they are stored in a single image which makes them really easy to share and control. 

2. In the other hand, **Cube Maps** require six diferent images as the name indicates.

<div class="alert alert-secondary" role="alert">
    We are not going to explore the file extensions or datatypes of the pixel values. I consider this information more relevant for future posts explaining digital color science.
</div>


## Basic concepts
Environment maps comme from the necessity of representing realistic light for digital scenes. In a digital Environment is really common to represent a light as a single point irradiating on all directions but in the real world light bounces from multiple directions before getting to the subject.


{% include figure.html image="/images/image-not-found.png" 
caption="Image Description" 
id="img:2"
%}
{% include figure.html image="/images/image-not-found.png" 
caption="Second Image Description sss" 
%}

Of course, `Environment maps are just an aproximation and simplification` but they provide a really good improvement in digital scenes.

To get an Environment light we can use a perfect metallic sphere and take a picture. This will result in all the information of the surrounding light on a single image. Of course the final resolution of the Environment map will depend on the camera and some information on the borders may be lost for distortion and lack of resolution.

# Sphere Maps

# Cube Maps



