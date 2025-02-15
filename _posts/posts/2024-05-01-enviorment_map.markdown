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

* Do not remove this line (it will not be displayed)
{:toc}

# Environment Maps

In computer graphics is really common to use Environment maps to emulate the real behavior of light [Environment Map 1](#img:Environment-map). 

The concept "Environment Map" is usually refferred to images that represent the surrounding light on one single point [scene origin 2](#img:scene-origin). 

{% include figure.html image="/images/realistic_lightning.jpg" 
caption="1. Environment map" 
id="img:Environment-map"
%}

{% include figure.html image="/images/environment_point.png" 
caption="2. Environment map illuminating the center point of the scene." 
id="img:scene-origin"
%}

Two common aproaches for storing this information are `cube maps` and `sphere maps`. 

1. **Sphere Maps** are really common in 3D software platforms. They are stored in a single image which makes them really easy to share and control. 

2. On the other hand, **Cube Maps** require six diferent images as shown in the image [Cube Map](#img:cube-map).


{% include figure.html image="/images/cubeMap.png" 
caption="3. Cube Map." 
id="img:cube-map"
%}


{% include figure.html image="/images/sphereMap.png" 
caption="4. Sphere Map." 
id="img:sphere-map"
%}


<div class="alert alert-secondary" role="alert">
    We are not going to explore the file extensions or datatypes of the pixel values. I consider this information more relevant for future posts explaining digital color science.
</div>


## Basic concepts
Environment maps comme from the necessity of representing realistic light for digital scenes. In a digital Environment is really common to represent a light as a single point irradiating on all directions but in the real world light bounces from multiple directions before getting to the subject.


{% include figure.html image="/images/image-not-found.png" 
caption="Eevee image of a point" 
id="img:2"
%}

{% include figure.html image="/images/image-not-found.png" 
caption="Cycles image with enviorment light" 
id="img:3"
%}

`Environment maps are just an aproximation and simplification` of the light real behaviour, but they provide an improvement in digital scenes lightning and result in an apealing image.

To get an Environment light from a real scene, we can use a perfect metallic (mirror) sphere and take a picture of it. This will result in all the information of the surrounding light on a single image. 

The final resolution of the Environment map will depend on the camera and some information on the borders may be lost for distortion and lack of resolution but it will make the trik. 

This image can then be transformed into a sphere or cube map.

{% include figure.html image="/images/image-not-found.png" 
caption="metallic sphere capturing all the scene" 
id="img:3"
%}

1. Undistorting the Image: The first step is to undistort the image captured by the spherical mirror. This involves reversing the distortion caused by the mirror to obtain a flat representation of the reflected scene.

2. Mapping to a Sphere: Once the image is undistorted, it can be mapped onto a sphere to create a sphere map. Each pixel in the rectified image corresponds to a point on the sphere, and the color of the pixel represents the color of that point on the sphere.

python Pseudocode:

```
# Assume input image is 'input_image' and output sphere map is 'sphere_map'

# Step 1: Undistort the image
undistorted_image = undistort(input_image)

# Step 2: Map the undistorted image onto a sphere
sphere_map = create_sphere_map(undistorted_image)

# Display or save the sphere map
display(sphere_map)
```

To implement this pseudocode, you'll need functions to undistort the image and create the sphere map. The specific methods for undistorting the image and mapping it onto a sphere will depend on the programming language and libraries you're using, as well as the characteristics of the spherical mirror used to capture the image.


# Sphere Maps

# Cube Maps



