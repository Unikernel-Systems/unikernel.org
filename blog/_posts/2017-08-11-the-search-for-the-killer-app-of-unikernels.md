---
layout: post
title: "The search for the killer app of unikernels"
authors: 
- Per Buer
author-urls: 
- 'https://twitter.com/perbu'
date: 2017-08-11 01:00:00
tags: [unikernel]
image: /images/steam_engine.jpg
excerpt:  When a radically different technology comes along it usually takes time before we figure out how to apply it. 
shorturl: 
---
{% include JB/setup %}

When a radically different technology comes along it usually takes time before we figure out how to apply it. When we had steam engines running factories there was one engine in each factory with a giant driveshaft running through the whole factory. When the electric engine came along people started replacing the giant steam engine with a giant electric motor. It took time before people understood that they could deploy several small motors in different parts of the factory and connect electric cables rather than having a common driveshaft. It takes time to understand the technology and its applicability. 

![Steam engine]({{BASE_PATH}}/images/steam_engine.jpg)

The situation with unikernels is similar. We have this new thing and to some extent we're using it to replace some general purpose operating system workloads. But we're still very much limited by how we think about operating systems and computers.

Unikernels are radically different. Naturally the question of the killer app has come up on a number of occasions. As unikernels are quite different from the dominant operating systems of today it isn’t as easy to spot what it will be. Here I’ll try to answer why it's hard to spot the killer app.

### Defining characteristics of unikernels

Let’s start with what our characteristics are. Unikernels are fast, secure and small. This makes them a good fit for a number of applications. One approach was to consider serverless architectures. Booting [MirageOS][] in a few milliseconds was the driving characteristic behind such approaches. Galois, through their [HaLVM][] unikernel, are mainly relying on Unikernels being small and frugal to pack a lot of virtual machines into a small little box in their [CyberChaff][] product. [IncludeOS][] is focused on network appliances like firewalls, load balancers and web based APIs, relying on security and performance to get adoption.

But there is an overlooked characteristic of unikernels. They are flexible. Unlike Linux and Windows you can easily boot a unikernel that relies on completely different infrastructure and protocols. Porting something as obscure as [SNA][] to a unikernel is a lot simpler than porting it to Linux or Windows. Likewise, we could well envision having HTTP support in a unikernel without having an IP stack. This sounds crazy and you’re likely asking yourself why you would ever do such a thing. I’ll get back to why and how, but bear with me for now.

Let us have a look at something the software industry has been struggling with for a while: running native code in browsers. We’ve always known it is a horrible idea but we’ve still spent hundred of thousands of hours making it a reality. If only we were able to build a properly secure sandbox it’d be great. Turns out making such a sandbox is really hard and this is why Java Applets, ActiveX controllers and NaCL have been abandoned (to be truthful, I’m not certain about why Google decided to discontinue NaCL; they’re a bit opaque on why).

### How can unikernels allow one to run native code in the browser?

It’s reasonably simple. Modern CPUs provide virtualization capabilities with good security built in and we can leverage this hardware to provide isolation between server-supplied code and the client it's running on.

Imagine the following. You have a webpage that needs to run native code. It could be some brand new form of DRM or some real intensive cryptography that needs the full power your CPU can provide. The webpage downloads a unikernel image and prepares the image. The browser sets up the virtual machine, creates page tables and initializes the unikernel. The CPU doesn’t need to boot this virtual machine in Ring 0; it can run in Ring 3 of the CPU as it will never need to talk to hardware, neither virtualized or physical. 

This VM would not have an IP stack but a small, secure, and well defined interface. It can basically do two or three things to communicate with the host:

 * Talk HTTP to its origin server. Browsers have HTTP clients built in.
 * Manipulate the DOM the same way Javascript can do.
 * (Optional - only if we would like this to have persistent state) Manipulate some local storage - contained in a file.

All of these mechanisms can be transported out of the VM through hypercall (like [VMCALL][]). The VM will run at native speed and the CPU will trap whenever it needs to push data out of the VM.

The browser needs to provide these three interfaces and the unikernel needs to implement them as well. This is where HTTP without IP comes in. What would paravirtualized HTTP without IP look like? The application builds a HTTP request, puts it in memory and signals the hypervisor that it should deliver a message to the virtual machine monitor (VMM - in this case it will be the browser). Basically a classical struct should do it.  

The browser takes a careful look at the pointer and the data it is pointing at. This code will need to be properly vetted as a buffer overflow here could potentially allow the unikernel to execute code outside its hardware prison.

The response to the request is fetched by the browser and put into shared memory as well. The browser signals the unikernel through an interrupt. This is more or less how paravirtualized drivers in the current virtual machines work. Since they aren’t really talking to hardware the CPU can run unprivileged (Ring 3). 

Manipulating the DOM and getting DOM events into the unikernel can be made in a similar fashion. The unikernel builds a notification and calls the hypervisor which in turns delivers the message to the VMM. I’m not really a front-end guy so I’m a bit uncertain on what the exact API would look like.
Storage, if one should decide to implement it,  can be either virtio or something even simpler. Presenting a block device to a virtual machine in a secure manner is a solved problem.

### Pushing it further - securing the VM from the prying eyes of the browser 

One could take this a step further and leverage the support for encrypted virtual machines. Intel has been supporting this for a number of years through their [Software Guard Extensions][] and AMD just came out with something similar in their EPYC CPUs. This would allow one to ship signed and encrypted code that could potentially be completely opaque to the user. This would naturally be a bit controversial if used for something like DRM, but there could be security applications that could benefit from running securely on a potentially compromised platform.   

We have no plans of implementing this. While it certainly is pretty cool, there is little opportunity for basing any commercial success on such an implementation.  The point of this exercise is to show you what the possibilities are. Replacing Linux with a unikernel is one thing, but the really exciting stuff will happen when we realize that the way we view operating systems is holding us back. The whole idea of having to emulate a whole computer with BIOS, PCI bus, and a floppy drive in order to run a virtual machine is pretty silly. Once we can free ourselves from that limitation we can start finding real applications for unikernels. In the meantime they can displace a few Linux VMs.

*Discuss this post on [devel.unikernel.org][discuss]*

[SNA]: https://en.wikipedia.org/wiki/IBM_Systems_Network_Architecture
[IncludeOS]: http://www.includeos.org/
[MirageOS]: https://mirage.io/
[HaLVM]: https://github.com/GaloisInc/HaLVM
[CyberChaff]: https://formal.tech/cyberchaff/
[VMCALL]: https://www.tptp.cc/mirrors/siyobik.info/instruction/VMCALL.html
[Per Buer]: https://twitter.com/perbu
[Software Guard Extensions]: https://en.wikipedia.org/wiki/Software_Guard_Extensions
[discuss]: https://devel.unikernel.org

