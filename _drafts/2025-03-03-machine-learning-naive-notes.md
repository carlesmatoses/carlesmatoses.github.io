---
layout: post
title:  "default draft"
date:   2024-04-21 18:17:51 +0200
preview: "/images/image-not-found.png"
categories: post # post, project
permalink: post/machine-learning-naive-notes
---

This are some notes taken for my machine learning classes.
<!-- end-abstract -->


<!-- index -->
* Do not remove this line (it will not be displayed)
{:toc}

<!-- Load all references -->
{% bibliography_loader _bibliography/references.bib %}

rest of content...

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse nec facilisis libero. Sed ac nisi dolor. Nulla gravida, elit non placerat mollis, tortor nisi consequat quam, ac dignissim quam nunc molestie ipsum. Fusce id efficitur nisi, quis ultrices augue. Phasellus condimentum porttitor lacinia. Nulla maximus elit id sapien ornare aliquam. Fusce id suscipit diam, a sodales orci. Vivamus eget dictum magna, porta porta augue. Nam non blandit odio. Vivamus ac sapien eu justo consequat porta vitae sed elit.


<!-- # Images:
reference images as [image 1 ref](#img:1), [image 2 ref](#img:2), [image 3 ref](#img:3). 
{% include figure.html image="/images/image-not-found.png" 
    caption="image 1" 
    id="img:1"
%}

{% include figure.html image="/images/image-not-found.png" 
    caption="image 2" 
    id="img:2"
%}

{% include figure.html image="/images/image-not-found.png" 
    caption="image 3" 
    id="img:3"
%}

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

# custom script example
{% render_time %}
page rendered at:
{% endrender_time %} -->

# Bibliography
<!-- We can reference the bilbiography elements {% ref ruby %} with a liquid tag. -->
{% bibliography %}