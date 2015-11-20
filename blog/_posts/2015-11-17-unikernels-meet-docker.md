---
layout: post
title: "Unikernels, meet Docker!"
authors: 
- Amir Chaudhry
- Richard Mortier
author-urls: 
- 'http://amirchaudhry.com'
date: 2015-11-17 17:30:00
tags: [unikernel, hack, dockercon, docker]
image: /images/screencast.png
excerpt: "Today unikernels took to the stage at DockerCon EU in Barcelona! As part of the Cool Hacks session in the closing keynote, Anil Madhavapeddy (MirageOS project lead), showed how unikernels can be treated as any other container. He first used Docker to build a unikernel microservice and then followed up by deploying a real web application with database, webserver and PHP code all running as distinct unikernel microservices built using Rump Kernels. Docker managed the unikernels just like Linux containers but <em>without</em> needing to deploy a traditional operating system!"
shorturl: 
---
{% include JB/setup %}

Today, unikernels took to the stage at DockerCon EU in Barcelona!

As part of the Cool Hacks session in the closing keynote, Anil Madhavapeddy
([MirageOS][mirage] project lead), showed how unikernels can be treated as any
other container. He first used Docker to build a unikernel microservice and
then followed up by deploying a real web application with database, webserver
and PHP code all running as distinct unikernel microservices built using
[Rump Kernels][rumpkernel]. Docker managed the unikernels just like Linux
containers but *without* needing to deploy a traditional operating system!

This kind of integration helps put unikernels into the hands of developers
everywhere and combines the familiar tooling and real-world workflows of the
container ecosystem with the improved security, efficiency and specialisation
of unikernels. We'll finish off this post with details of how *you* can get
involved — but first, before we go into Anil's demonstration in more detail,
some background about why unikernels matter, and why it makes sense to use
Docker this way.

[mirage]: https://mirage.io/
[rumpkernel]: http://rumpkernel.org/

### Why Unikernels? ###

As companies have moved to using the cloud, there's been a growing trend
towards single-purpose machine images, but it's clear that there is
significant room for improvement. At present, every VM has to host a copy of
the OS on which the application runs, especially where strong isolation is
required. 

These VM-hosted applications are also affected by OS vulnerabilities,
including exploits that have no relation to applications' day-to-day functions.
For example, USB drivers — present in an OS but irrelevant to cloud
deployments — have had [multiple vulnerabilities][usb-cve] which allow
arbitrary code execution. Patching such code creates a needless maintenance
burden.

Unikernels take a different approach: application code is linked against only
the OS components it specifically requires to produce a specialised, single
address space machine image — thus eliminating unnecessary code. Built using
'library operating system' technology, unikernels provide many benefits
compared to a traditional OS, including:

- *Improved security properties* — as unikernels contain no unnecessary code
deployed, the application's attack surface is dramatically reduced.
- *Smaller footprints* — unikernel code bases are typically several orders of
magnitude smaller than their traditional equivalents and they can be managed
much more easily.
- *Fine-grained optimisation* — as unikernels are constructed through a
coherent compiler tool-chain, whole-system optimisation can be carried out
across device drivers and application logic, potentially improving
specialisation further.
- *Fast boot times* — as unikernels can boot in less than a second,
provisioning can become highly dynamic.

<!-- In addition, creating these library operating systems with modern, high-level languages also means that language features such as type-safety and compile-time checks can hugely improve the quality of deployed software. Combining these benefits with legacy applications will allow us to create next-generation secure services. -->

These benefits are particularly relevant to [microservices][] and the
developing concept of 'immutable infrastructure' — where VMs are treated as
disposable artefacts and can be regularly re-provisioned solely from
version-controlled code. Modifying such VMs directly isn't permitted: all
changes must be made to the source code itself.

Unikernels naturally lend themselves to both the microservice architecture
*and* the concept of immutable infrastructure: both source code and generated
binary are compact enough to be easily version-controlled. If the traditional
stack has allowed us to move towards microservices, then unikernels will move
us towards the world of immutable nanoservices.

Although unikernels provide a path, there are significant challenges to their
adoption in production settings. The unikernel ecosystem is only just taking
off, and this new technology needs to fit in with existing workflows and
tooling.

Enter Docker!

[usb-cve]: http://www.openwall.com/lists/oss-security/2014/09/11/21
[microservices]: http://martinfowler.com/articles/microservices.html

### Why Docker? ###

Linux containers have allowed developers to move much more quickly towards
microservices by allowing a traditional OS to provide functionality to
multiple 'containerised' applications sitting above it. Those containers
remain distinct and thus can be independently replaced or modified, a core
piece of the microservices architectural pattern.

Although containerisation technology has been available for some time, there's
been a recent and rapid increase in the pace of adoption. The last few years
have seen a proliferation of tools that make it easier to use containers at
scale, including registries of ready-made images, tools for orchestration, and
much more. Led and fostered by Docker, this has produced a vibrant, open and
growing ecosystem, which is helping improve everyone's development workflows.

With an increasing number of supported tools and infrastructure, it's become
clear that the ecosystem is about much more than just Linux containers
themselves. Can unikernels fit in this ecosystem? If so, where would
unikernels sit in relation to containers?

Containers and unikernels actually sit on a continuum. On the one hand, we
have the traditional method of placing a full OS stack in a VM with a single
application on top. A natural next step is to use containers which run on top
of a single OS, giving better resource usage and allowing each application to
be more self-contained. When viewed this way, unikernels are just another step
on this path and can be thought of as extreme, self-contained applications.
The challenge is to make unikernels as easy to use as containers have become today.

![Containers and unikernels on a continuum]({{BASE_PATH}}/images/intro-post/specialisation.png)

The obvious first step in addressing that challenge is to integrate unikernels
with the existing container infrastructure, specifically the Docker tools and
ecosystem. This helps us to get unikernels into the hands of developers
everywhere, with a widely used and understood packaging model and runtime
framework, effectively by making unikernels just another type of container.

It also unlocks the entire container ecosystem of tools for use with
unikernels, including orchestration and whatever else may be around the corner.
Adoption of existing toolchains will accelerate the progress of unikernels and
also demonstrates the flexibility and breadth of the Docker ecosystem.  By
using Docker to abstract away the complexity of the underlying OS, a developer
can chose how they 'containerise' their application, whether they target a
traditional Linux container, or a new unikernel 'container'.


### DockerCon Demo ###

It is exactly these first steps enabling developers to build and run
real-world unikernel microservices, using existing Docker tools, which Anil
demonstrated at DockerCon EU today!

First he used Docker to build a unikernel microservice, and then he ran a
cluster of unikernels to deploy a real web application with database,
webserver and PHP code. The whole build system is wrapped in an easy-to-use
Dockerfile and each microservice is turned into a specialised unikernel. Those
unikernels run in their own KVM virtual machine with hardware protection.
Docker manages the unikernel containers just like Linux containers, including
networking!

This early work makes unikernels a usable target for a Docker deployment!
Since unikernels can now be managed by Docker, it can bring all the benefits
of the existing ecosystem to the orchestration and management of unikernels.

The demo consisted of using the typical components found in a LAMP stack,
specifically Nginx, MySQL and PHP. These unmodified, off-the-shelf components
were built using the Docker toolchain but instead of the typical OS they were
built as unikernels! A cluster of these unikernels was created where each of
them was specialised for the particular app they were running.  Watch the
screencast below for more details!

<div class="flex-video">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/CkfXHBb-M4A" frameborder="0" allowfullscreen></iframe>
</div>

### Get involved! ###

<!-- The code for the demo example is available at: TODO:XXXX.  Try this out for yourself to get an idea of the benefits of such integration.
 -->
The demo described here is just the beginning. There are many implementations
of unikernels and there's plenty of work ahead to ensure they can all reap the
benefits of integration, as well as improving Docker itself to make the most
of these new technologies. Look over the collection of unikernel projects and
contribute your experiences to this blog!


*Thanks to [Anil][], [Balraj][], [David][], [Jeremy][], [Justin][],
[Martin][], [Mindy][] and [Thomas][] for their comments on earlier drafts.*

[Jeremy]: https://github.com/yallop
[David]: https://github.com/dsheets
[Mindy]: http://somerandomidiot.com
[Thomas]: http://gazagnaire.org
[Balraj]: https://github.com/balrajsingh
[Anil]: http://anil.recoil.org
[Justin]: https://github.com/justincormack
[Martin]: https://lucina.net
