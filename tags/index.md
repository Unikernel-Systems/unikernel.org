---
layout: page
title: Tags
header: Posts By Tag
---
{% include JB/setup %}

<!-- <ul class="tag_box inline">
  {% assign tags_list = site.tags %}  
  {% include custom/ordered_tags_list %}
</ul>
<hr> -->

{% for tag in site.tags %} 
  <h5 id="{{ tag[0] }}">{{ tag[0] }}</h5>
  <ul>
    {% assign pages_list = tag[1] %}  
    {% include JB/pages_list %}
  </ul>
{% endfor %}
