---
layout: post
title:  "ML Notes"
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

# 1
## Introduction 
- Supervised learning: uses labelled data. ``Main objective`` in classiﬁcation: predict class from feature values.
  - regression: predict real value label for each example
  - classification: predict discrete value (class, category) for each example
- Unsupervised learning: has no labels
  - clustering: discover homogeneous groups in data
  - dimensionality reduction: find lower-dimensional representation
  - association rule mining
  - outlier detection
  - . . .
- Semi-supervised learning: only few labels:
  - ranking: order examples according to some criterion
  - reinforcement learning: delayed rewards, learning to act in an environment

## Errors
- Overfitting: The model learned to follow the training data pattern and now is not able to predict unseen data on the expected way.
    <!-- Anyadir imatge de un seno amb ruido que segueix el propi ruido -->
    - Regularization: Penalize too high &theta; or complex models. For this, we add a new element **&lambda; &times; |*f*|**. The **|*f*|** component will depend on the chosen strategy being a common one `Ridge`.
# 2
# 3



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