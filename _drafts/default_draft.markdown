---
layout: post
title:  "default draft"
date:   2024-04-21 18:17:51 +0200
preview: "/images/image-not-found.png"
categories: post # post, project
permalink: post/default-draft
---
<!-- abstract --> 
some abstract content...
<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}

<!-- Load all references -->
{% bibliography_loader _bibliography/references.bib %}

rest of content...

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse nec facilisis libero. Sed ac nisi dolor. Nulla gravida, elit non placerat mollis, tortor nisi consequat quam, ac dignissim quam nunc molestie ipsum. Fusce id efficitur nisi, quis ultrices augue. Phasellus condimentum porttitor lacinia. Nulla maximus elit id sapien ornare aliquam. Fusce id suscipit diam, a sodales orci. Vivamus eget dictum magna, porta porta augue. Nam non blandit odio. Vivamus ac sapien eu justo consequat porta vitae sed elit.

Duis ullamcorper vehicula condimentum. Maecenas lacus mi, fringilla at velit at, feugiat molestie nisl. Duis rutrum massa leo, id aliquet nisl venenatis sed. Aenean sagittis ante sed odio ultrices bibendum. Quisque aliquam dapibus elit, id fermentum purus laoreet vitae. Nunc ac ex vestibulum, fringilla nibh in, fringilla leo. Sed condimentum, sapien in elementum commodo, ante tellus efficitur magna, sed egestas quam mi sed quam. Curabitur mattis lectus a porttitor congue. Sed sodales a turpis sit amet dignissim. Vestibulum luctus dolor erat, ac posuere ante elementum eu. Nullam molestie hendrerit ipsum quis vulputate. Proin rutrum ultrices vestibulum. Maecenas dapibus ligula metus. Pellentesque eu gravida libero. 





# Text:
You can write the following code as follow  `code in line`, **bold letter**, *cursiva*. 

<div class="alert alert-secondary" role="alert">
    This is an alert.
</div>

## Code:

{% highlight ruby %}
def print_hi(name)
  puts "Hi, #{name}"
end
print_hi('Tom')
#=> prints 'Hi, Tom' to STDOUT.
{% endhighlight %}

## Links
This is an external link [jekyll-docs](https://jekyllrb.com/docs/home)  
This is an external link from the bibliography [Jekyll docs][jekyll-docs]

[jekyll-docs]: https://jekyllrb.com/docs/home

# Header 1
## Header 2
### Header 3
#### Header 4

# Referenceable elements
## Images:

Some other images  {% ref figure:experiment %}
{% figure id="experiment" size="1.0" caption="hola2" col="2" %}
/images/test.png
/images/youtube.png
/images\ambient_occlusion\comparing_spheres.png
{% endfigure %}


{% figure id="spheres" size="0.49" caption="hola" %}
/images\ambient_occlusion\comparing_spheres.png
{% endfigure %}

{% figure id="spheres3" size="0.49" caption="hola" %}
/images\ambient_occlusion\comparing_spheres.png
{% endfigure %}

{% figure id="spheres2" size="0.49" caption="another caption" %}
/images\ambient_occlusion\comparing_spheres.png
{% endfigure %}
# custom script example
{% render_time %}
page rendered at:
{% endrender_time %}

# Equations
{% equation id="eq:energy" %}
E = mc^2
{% endequation %}

As shown in equation {% ref "eq:energy" %}, energy is proportional to mass.

# Bibliography
The complete bibliography is shown with the bibliography tag **{% raw %}{% bibliography_loader _bibliography/references.bib %}{% endraw %}**

We can reference the bilbiography elements **{% raw %}{% cite ruby %}{% endraw %}** with a liquid tag. The result is {% cite ruby %}

We can show the hole library with **{% raw %}{% bibliography %}{% endraw %}**

{% bibliography %}