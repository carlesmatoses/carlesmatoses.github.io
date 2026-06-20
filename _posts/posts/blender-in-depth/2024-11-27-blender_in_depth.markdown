---
layout: post
title:  "Blender In Depth"
date:   2024-04-21 18:17:51 +0200
preview: "/images/test.png"
categories: post
permalink: post/blender-in-depth
---

Lets deep dive into blender's DNA. What composes blender? What can be modified? and what is the blender way?
<!-- end-abstract -->


Blender is a complex and big project managed by **blender studios** as the official orchestrator, many collaborators and volunteers. This combination makes blender a fast evolving application that needs lots of documentation. For this reason, there are many sources we can use to try to answer **`What is blender?`**

# What is Blender?

In it's essence, blender is just a collection of Python, JavaScript, C++, HTML and Dockerfile scripts. But nothing explains better what this collection does than the official page itself:

{% alert primary %}
  Blender is the free and open source 3D creation suite. It supports the entirety of the 3D pipeline: modeling, rigging, animation, simulation, rendering, compositing and motion tracking, even video editing.

  Development of Blender happens at [projects.blender.org](projects.blender.org) and is [funded](https://fund.blender.org/) entirely by donations from entrepreneurs, companies, and users.

{% endalert %}


And because the good resources are the ones that exist, we will rely in blender's already official documentation to dive into its skeleton.

- [https://developer.blender.org/docs/handbook/contributing/using_git/#github-mirror](https://developer.blender.org/docs/handbook/contributing/using_git/#github-mirror) 
- [https://docs.blender.org/manual/en/latest/](https://docs.blender.org/manual/en/latest/)
- [https://docs.blender.org/api/current/](https://docs.blender.org/api/current/)
- [https://developer.blender.org/docs/](https://developer.blender.org/docs/)
- [https://studio.blender.org/welcome/](https://studio.blender.org/welcome/)
- [https://www.youtube.com/@BlenderOfficial](https://www.youtube.com/@BlenderOfficial)
- [https://www.youtube.com/@BlenderStudio](https://www.youtube.com/@BlenderStudio)
- [https://extensions.blender.org/](https://extensions.blender.org/about/) 
- [https://developer.blender.org/docs/handbook/new_developers/navigate_code/](https://developer.blender.org/docs/handbook/new_developers/navigate_code/)
- [https://www.youtube.com/live/tCdx7gzp0Ac?si=PskMa_x3hDusAtD3](https://www.youtube.com/live/tCdx7gzp0Ac?si=PskMa_x3hDusAtD3)

This is ... in fact ... overwelming.  

# Audaspace

# Blender Data Structures
Once we have finished editing a file, it has to be stored somehow the same way it must be loaded in memory at execution time. Blender implements a read/write library that stores Data Structures and loads them back when necessary.

This building blocks are the essence of blender. They compose the building blocks of the software and we can think of them as lego pieces. Blender has developed the $2\times2$ red piece with two toppings and the $1\times1$ green piece. I, myself would like to build a bridge with this blocks so I make as many instances as I wish and build the wall. At saving the file, we just end up with a .blend file that contains a list of this objects, they're position rotation and scale as well as any other property they may have.

It is a silly example but if I do it correctly, it will help generate intuition for less experienced users on code architecture.

Lets now deep down into a more specific example!!

A Data Structure that everyone has used without noticing is the `Mesh Data Structure` [mesh data documentation](https://developer.blender.org/docs/features/objects/mesh/mesh/)

<!-- TODO: we need to explain the code and fields of this data structure  -->

In this scene of blender we see three different `objects`, each of them has a unique mesh data associated to them. Look what happens when we use the same mesh for all the objects. 


<!-- Add figure of blender -->

Suddenly we have the same geometry on all objects but with an additional transformation added to each one. Do you know what that is? It is called instance and is huge. Instances are the funding block of all game engines and 3D applications. But then, if the `object` instance is independent of the `mesh` instance, what is `object`? It is just another building block called `Object Data` altogether with `Object`.


<!-- Add a graph with mermaid maybe, showing that we have "Object"" that has three fields: rotation, position, scale, and it also has a type field that inherits the datatype propertyes such as mesh vertex position or focal length of a camera.   -->



{% figure id="blender-data-structure" caption="Blender Object Data Structure" width="50%" %}
  {% fig_mermaid width="100%" %}
classDiagram

  class Object {
        Vector3 position
        Quaternion rotation
        Vector3 scale
        ----
        DataStructure data
    }
  style Object fill:#FFC55C,stroke:#EEA011,stroke-width:1

  class DataStructure {
        Name name
    }
  style DataStructure fill:#7BC8F6,stroke:#2196F3,stroke-width:1

  class Mesh {
        Name name
        Material material
    }
  style Mesh fill:#A8D8A8,stroke:#4CAF50,stroke-width:1

  class Camera {
        Name name
        FocalLength 50mm
    }
  style Camera fill:#F6A8C0,stroke:#E91E8C,stroke-width:1

  Object --> DataStructure : data
  DataStructure <|-- Mesh
  DataStructure <|-- Camera

  {% endfig_mermaid %}
{% endfigure %}


This graph {% ref blender-data-structure %} is an over simplification. In blender, each of this data structures have hundreds of attributes and they additionally rely on arrays and tensors that contain even more information (like vertices, edges and faces connections).

A better visualization of this structures shown inside blender itself. Visit [Editor](https://docs.blender.org/manual/en/latest/editors/index.html) and [Outliner](https://docs.blender.org/manual/en/latest/editors/outliner/introduction.html) for the documentation on what are editors inside blender and what is the Outliner editor specifically. We cite the page directly:

{% alert %}
Blender provides a number of different editors for displaying and modifying different aspects of data. An Editor is contained inside an Area which determines its size and placement within the Blender window. Every area may contain any type of editor.

The Editor Type selector, the first button at the left side of a header, allows you to change the Editor in that area. It is also possible to open the same Editor type in different areas at the same time.
{% endalert %}

