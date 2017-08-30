---
layout: post
title: "An introduction to ukvm and solo5"
authors: 
- Per Buer
author-urls: 
- 'https://twitter.com/perbu'
date: 2017-08-29 14:30:00
tags: [ukvm, solo5]
image: /images/minimalist.jpg
excerpt:  ukvm is likely the world tiniest hypervisor. Here is why we need it. 
shorturl: 
---
{% include JB/setup %}

Even though your average unikernel itself is pretty minimal the typical deployment carry a lot of weight. We rely on software, mainly [Qemu], emulating a complete computer. The hardware in our CPUs only virtualizes memory and CPU so the rest, BIOS, network adapters, block devices, are emulated in software - adding a much larger memory footprint than [IncludeOS] itself and adds almost a third of a second to the boot time.

There are problems associated with this approach.  There is a lot of code to be maintained, leaving us with a poorer understanding of the underlying system. The attack surface is a lot bigger than it should be. A bug in the virtual hardware could mean that an attacker would be able to break out of their virtual machine and into the host. Since the machine emulation runs outside the boundaries of the virtual machine itself this is a very real threat as demonstrated by the [VENOM] attack. Complex code is seldom faster than simple code and an interface made for physical access will struggle to provide the same performance as an interface made for virtualized access.

For regular x86 virtual servers running Linux or Windows these issues weren’t really conceived as problems. These are already very heavy machines and the incurred performance cost isn’t significant.

For unikernels on the other hand the overhead is significant. For IncludeOS our minimal useful image consumes a couple of megabytes of memory. Having to drag along a Qemu instance is inefficient. Adhering to [Popek-Goldbergs equivalence requirement becomes harmful](http://blog.includeos.org/2017/06/23/popek-goldberg-machines-considered-harmful) at this point.

The [ukvm] project is aimed to realize a new and minimal interface between the host and the virtual machine. It leaves behind the legacy of emulating hardware and instead provides a bare bones interface to whatever the virtual server needs it to do. Unikernels typically need three things in order to operate; 1) network packets, 2) disk IO and 3) console support. Through ukvm a VM can use simple paravirtualized interfaces to satisfy these needs[^footnote1]. It still relies on Linux and the kernel-based virtual machine ([KVM]) to do scheduling and memory virtualization but can replace all of Qemu as the “server” for the virtualized machines[^footnote2]. 

ukvm isn’t useful without a VM that implements the interfaces provided by ukvm. [Solo5] provides just such an interface. It provides a framework for unikernels to boot, run and exit. [MirageOS] was the first target unikernel for Solo5 and today you can run MirageOS on top of the Solo5 base. Other projects leveraging the Solo5 are the [Muen] Separation Kernel and the upcoming release of [HalVM].

Earlier this year [Dan Williams] and [Ricardo Koller] from IBM Research were able to [port Solo5 to IncludeOS](http://blog.includeos.org/2017/08/29/includeos-on-solo5-and-ukvm). This allows IncludeOS to run in a VM with minimal machine emulation. The upside is simplicity, efficient resource use and some very minimal boot times. 

The Solo5/ukvm interface is minimal enough that we at have the opportunity to do proper verification of it to make sure that the interface is reasonably secure.

With a Solo5 core IncludeOS can be smaller, faster and more secure. The boot times are in the low milliseconds. Combined with the minimal resource use this makes [serverless computing] much more feasible by offering more elastic infrastructure. Spinning up a virtual machine to handle an incomming transaction is now a much more resonable strategi for a serverless architecture.

The next thing we need is for one of the major PaaS providers to start offering virtual machines backed by ukvm. If the offered disk- and memory footprints are more in line with what unikernels actually need we could see some real cost savings choosing a unikernel strategy for cloud services. 

If you want to learn more about IBMs efforts around Solo5 you can check out the [solo5] project on Github. There is also a [relevant discussion](https://devel.unikernel.org/t/includeos-in-ukvm-solo5/249/3) on [devel.unikernel.org] discussing the inclusion of the Solo5 hypercalls into IncludeOS. 

[^footnote1]: It should be noted that ukvm currently doesn't offer everything a unikernel could ever need. There is no SMP support and no support for multiple network interfaces.
[^footnote2]: There are some performance optimizations that have yet to be realized. There is currently a vmexit penality on each network packet transferred from the host to the VM and on each block IO response. There are plans to address this in future releases.
[Qemu]: http://www.qemu.org
[ukvm]: https://www.usenix.org/system/files/conference/hotcloud16/hotcloud16_williams.pdf
[solo5]: https://github.com/Solo5/solo5
[Dan Williams]:http://researcher.ibm.com/researcher/view.php?person=us-djwillia
[Ricardo Koller]: http://researcher.ibm.com/researcher/view.php?person=us-kollerr
[Muen]: http://muen.sk/
[devel.unikernel.org]: https://devel.unikernel.org/
[MirageOS]: http://www.mirageos.org/
[kvm]: https://en.wikipedia.org/wiki/Kernel-based_Virtual_Machine
[virtio]: https://wiki.libvirt.org/page/Virtio
[Mato]: https://github.com/mato
[Alf]: https://github.com/fwsGonzo
[MirageOS]: https://mirage.io/
[Popek Goldberg is now considered harmful]: http://blog.includeos.org/2017/06/23/popek-goldberg-machines-considered-harmful
[serverless computing]: https://en.wikipedia.org/wiki/Serverless_computing
[VENOM]: http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-3456
[IncludeOS]: http://www.includeos.org/

