---
layout: post
title: "Contain Your Unikernels!"
authors: 
- Martin Lucina
author-urls: 
- 'http://lucina.net/'
date: 2015-11-26 18:00:00
tags: [unikernel, hack, dockercon, docker]
image: /images/contain-your-unikernels.png
excerpt: "After DockerCon EU in Barcelona several people asked me: “Is this for real?”. Yes it is, and today we are releasing the code for the entire “Unikernels, meet Docker!” demo on GitHub."
shorturl: 
---
{% include JB/setup %}

<p>
<img alt="screenshot" src="http://unikernel.org/images/contain-your-unikernels-crop.png" style="box-shadow: 5px 5px 10px;">
</p>

After DockerCon EU in Barcelona several people asked me: “Is this for real?”.
Yes it is, and today we are releasing the code for the entire “Unikernels, meet
Docker!” [demo][demopost] on GitHub.

To get started, clone the [DockerConEU2015-demo][github] repository and follow
the instructions in README.md. You will need a Linux host with Docker and KVM
installed.

Apart from the MySQL, Nginx and PHP with Nibbleblog unikernels shown in the
demo, the repository also contains some simpler examples to get you started
that we did not have time to show live in the short time-slot. There’s also an
in-progress [MirageOS/KVM port][miragekvm], so stay tuned for a future post on
that.

Presented as a ‘cool hack’ in the closing session of the conference, this demo
is just a taste of what is possible. Next, I’m going to work with the wider
unikernel and Docker developer community on a production quality version of
this demo. The goal is to make unikernel technology easily accessible to as
many developers as possible!

Personally, I would like to thank [Amir Chaudhry][amir], [Justin
Cormack][justin], [Anil Madhavapeddy][avsm], [Richard Mortier][mort], [Mindy
Preston][mindy] and [Jeremy Yallop][yallop] for helping me put the demo
together, [Docker][docker] for giving us the opportunity to demo at DockerCon,
everyone working on the [Rumprun unikernel][rumprun] and all the other Open
Source projects that made this demo possible.

Now, go [try it out][github] and contain your unikernels!

[docker]: http://docker.com/
[rumprun]: http://wiki.rumpkernel.org/Repo:-rumprun
[github]: https://github.com/Unikernel-Systems/DockerConEU2015-demo
[demopost]: http://unikernel.org/blog/2015/unikernels-meet-docker/
[miragekvm]: https://github.com/mato/opam-rumprun
[yallop]: https://github.com/yallop
[mindy]: http://somerandomidiot.com
[avsm]: http://anil.recoil.org
[justin]: https://github.com/justincormack
[amir]: http://amirchaudhry.com/
[mort]: http://mort.io/
