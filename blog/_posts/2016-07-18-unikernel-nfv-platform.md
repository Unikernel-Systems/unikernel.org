---
layout: post
title: "NFV Platforms with MirageOS Unikernels"
authors: 
- Wassim Haddad
- Heikki Mahkonen
- Ravi Manghirmalani
author-urls: 
- '#'
- '#'
- '#'
date: 2016-07-18 05:00:00
tags: [mirageos, nfv, platform, product, unikernel, orchestration]
image: /images/ericsson-nfv/fig1-small.png
excerpt: "We built a new standalone software platform to unify automation, orchestration and the 'stitching together' of a designated set of NFVs. Our platform does not rely on current cloud orchestration or SDN technologies. Instead, the platform architecture goes beyond existing virtual machines and containers, by introducing the concept of 'nanoservices' using MirageOS unikernels."
shorturl: http://unikernel.org/
---
{% include JB/setup %}

*Wassim Haddad is at Ericsson Silicon Valley where he currently works on
distributed cloud infrastructure. Heikki Mahkonen and Ravi Manghirmalani work
at Ericsson Research at Silicon Valley in the advanced Networking and
Transport labs. The Ericsson team has a diverse background in different NFV,
SDN and Cloud related R&D projects.*

### The push towards NFV

The Network Function Virtualization (NFV) paradigm breaks away from
traditional "monolithic" approaches, which normally build network functions by
tightly coupling application code to the underlying hardware. Decoupling these
components offers a new approach to designing and deploying network services.
One that brings a high degree of flexibility in terms of separating their
lifecycle management and enabling much more efficient scaling.
Moreover, the move away from specialized hardware coupled with a "virtualize
everything" trend is fuelling operators and service providers' expectations of
significant cost reductions. This is undoubtedly a strong motivation behind
NFV adoption. 

Current NFV market trends point towards two key technologies: Cloud
Orchestration (e.g., OpenStack) to provision and manage workflows, and Software
Defined Networking (SDN) to enable dynamic connectivity between different
workflows as well as network slicing. In parallel, there is also a strong
desire to migrate from virtual machines towards microservice enablers,
particularly Docker containers, to boost performance and hardware utilization.
On the other side, it is evident that without intelligent and dynamic traffic
steering between different VMs and/or containers, large-scale NFV deployments
(e.g., for 4G/5G end-to-end slicing, virtual CPE, etc.) cannot take place. For
this purpose, cloud orchestration and SDN have to coordinate their actions,
which further complicates the overall architecture. 

There are multiple advantages behind adopting containers as they offer higher
density, a single operating system, and faster startup/shutdown. However, the
ever-growing kernel complexities and vulnerabilities, together with the
requirement to ensure strong isolation between different applications, have
been frequently cited as barriers to widespread adoption.
Unikernels, which sit on a [continuum][] with containers,
offer a different approach.

We built a new standalone software platform to unify automation, orchestration
and the 'stitching together' of a designated set of NFVs. Our
platform does not rely on current cloud orchestration or SDN technologies.
Instead, the platform architecture goes beyond existing virtual machines and
containers, by introducing the concept of 'nanoservices' using MirageOS
unikernels.

[MirageOS][] is a library operating system written entirely in a type-safe high
level programming language, [OCaml][].
MirageOS restructures all system components as modules which are implemented
as a set of independent libraries. Such decomposition enables programmers to
select and link together only the set of libraries that the application
requires, resulting in at least an order of magnitude reduction in code size
and a correspondingly much smaller attack surface. The compilation of the
modular stack of application code, system libraries, and configuration
produces the so called 'unikernel'.

By applying unikernel technology in the NFV space, we constructed a set of
specialized, highly secure and scalable 'nano-NFVs' that can be streamed into
our next-gen cloud. Our nano-NFVs show higher performance compared to
existing NFVs, and have a much smaller memory footprint (i.e., between hundred
kilobytes to few megabytes). As one example, excluding configuration and
memory channel setup, our nano-NFV boots up within 10-20ms and is
automatically removed when the request is fulfilled thus, enabling
'zero-footprint' or 'serverless' clouds — whereby the service is available
only when needed. Furthermore, our platform embeds intelligent 'traffic
steering' capabilities achieved via shared memory circuits, which enable
operators to slice their infrastructure as they wish (e.g., per user and/or
per device and/or per flow).

### Implementing a proof of concept NFV platform

![(a) Typical NFV setup and (b) NFV setup using Jitsu and vchan packet I/O]({{BASE_PATH}}/images/ericsson-nfv/fig1.png)

Currently, our NFV platform runs a DHCP server, Network Address
Translation (NAT), and firewall services. Our platform is implemented in OCaml
using the MirageOS development environment and uses a number of existing
MirageOS libraries. The left side of the figure above shows how our platform
can be implemented from a set of unikernel-based NFVs, with each having its own
network stack. In this case, each NFV needs to be orchestrated beforehand and
the virtual switch needs to have packet-forwarding rules, in order to support
service function chaining. 

Our 'Just-in-time summoning ([jitsu][])' of NFVs implementation is shown on
the right side of the figure. In this case, the only unikernel running a
network stack is the _Packet I/O_ unikernel, which needs to be orchestrated
before incoming IP packets can be consumed. In fact, when the _Packet I/O_
unikernel receives an IP packet, it checks first if a matching shared memory
circuit exists for it. If a shared memory circuit has already been created,
the packet is bridged to it for handling. Otherwise, a memory circuit can be
created by utilizing the orchestrator unikernel. In such scenarios, IP packets
are forwarded to the orchestrator unikernel which in turn, looks up the
subscriber policy in the Irmin datastore then creates a dedicated NFV
unikernel for the specific IP flow defined by the 4-tuple: (IP source address,
source port number, IP destination address, and destination port number).
For example, if the received packet is a DHCP request, then a DHCP server
is created and connected to the _Packet I/O_ unikernel via a shared memory
circuit. 

If the packet belongs to a different IP flow, a service function chain is
created by stitching together NAT and firewall unikernels with shared memory
circuits. Once the set of dedicated NFVs is setup, packets belonging to the
corresponding IP flow are pushed back to the _Packet I/O_ unikernel, which
forwards them to the just-in-time created memory circuits. In the reverse
direction, packets received from the shared memory are bridged to the
networking stack then sent out to the network interface.

Our NFV platform implements the shared memory by using the [vchan][] library,
which enables connecting two Xen domains to each other with a bidirectional
memory channel over which bytes can be sent. We also implemented framing to
enforce IP packet boundaries through the shared memory. In order to connect
domains with vchan memory circuits, [Xenstore][] is used to configure endpoint
domain IDs. Each unikernel reads the domain ID on boot up time, which ensures
that the platform is immutable. If circuits need to be changed then associated
NFVs need to be restarted and configured.

The immutability aspect underlying our platform architecture allows assigning
dedicated pre-configured unikernels to serve a particular user. This means
that once instantiated, these unikernels will process packets according to
their original configurations, i.e., the one available at compile time. Any
attempt to re-configure a unikernel at runtime will result in re-compiling and
re-launching the unikernel.

Our NFV orchestrator is running on Xen Dom0 and uses the [Irmin][] and
[Xenctrl][] libraries to implement just-in-time summoning of NFVs. Irmin is
used to store and retrieve the subscriber policies when new NFVs are required
to process incoming packets. As the orchestrator is running on Dom0, it can
use the Xenctrl library to create and destroy new unikernel domains on demand. 

The orchestrator unikernel consists of OCaml code that handles packet I/O and
framing from the shared memory, binding to the Irmin datastore, creation of
new unikernels, and periodic garbage collection for idle unikernels. To
determine idle unikernels, the _Packet I/O_ unikernel stores a timestamp for
packets forwarded to memory circuits. The orchestrator compares this timestamp
to a threshold and if needed, unikernels can be deleted. We implemented a CRUD
API for the Irmin datastore to retrieve and update subscriber policy records.
This API provides simple utility functions, e.g., `find_subscriber`, `get_mac`,
`get_service`. Inside the API, these functions use the Irmin API to connect to
the actual datastore.

The DHCP server uses the [charrua-core][charrua-post] DHCP server library.
DHCP configuration is passed to the server through Xenstore. Packet I/O is
done through a single vchan memory circuit that is connected to the
_Packet I/O_ unikernel. DHCP Requests received are passed to the charrua-core
library by using the `Dhcp_server.Input.input_pkt` function. This function
returns DHCP Reply packets, which are forwarded back over the vchan memory
circuit to _Packet I/O_ which pushes them down the wire.

For NAT, we are using the [simple-nat][] library that handles TCP and UDP
flows (for ICMP testing we implemented simple IP translation mechanism).
The NAT unikernel has two memory circuits one for uplink and one for downlink
direction. Packets are passed between these circuits and in between passed
through the simple-nat library by invoking the `Nat.translate` function.
For ICMP flows, we do the IP address rewriting in place in the vchan receive
function. Currently, in our proof of concept, the firewall is a simple
pass-through NFV but our plan is to use the
[QubesOS unikernel firewall][qubes-fw] as a library.

The unveiling of our lightweight NFV proof of concept was in January, 2016, at
the 14th annual [Southern California Linux Expo (SCALE 14x)][scale14x] in
Pasadena, California ([slides][nfv-slides], [video][nfv-video]).
A post with other details is available on the
[Ericsson Research blog][ericsson-nfv]. Our results in the figure below show
creation, boot up, configuration and memory channel setup times that are
around tens of milliseconds for typical NFVs such as a DHCP server, NAT, and
firewall. In addition, our approach enables service chaining between NFVs
without having to inject complex rule sets in the virtual switches. Also, the
resource requirement for NFVs could be kept to a minimum since only a single
vCPU and a few tens of MB of memory were required for each service. Note that
a [recent study][hannes-post] showed that it is possible to further shrink the
NFV image size to less than 10MB. Upcoming work on
[dead code elimination in OCaml][#608] will also provide immediate impact with
minimal effort, aside from upgrading the compiler — a key benefit of clean
slate unikernels.

![Unikernel NFV PoC platform]({{BASE_PATH}}/images/ericsson-nfv/fig2.png)


### Next Steps

We believe unikernels are well suited for adoption by the new emerging class
of IoT and 5G applications, primarily because of their smaller, more secure
memory footprint. These features mean that network providers will be more open
to hosting third party applications at various points in their network and to
monetize low-latency guarantees, geo-local information and personalized
customizations. New distributed computing paradigms, software abstractions, and
methodology for service and network function compositions will emerge because
of the fact unikernels can be activated in a relatively short duration
resulting in greener datacenters.

We are investigating areas which can profit from the capabilities offered by
unikernels. We believe this could bring in a new era of telecom innovation and
accelerate the adoption of third party value added services.

*Edit: discuss this post on [devel.unikernel.org][discuss]*

[discuss]: https://devel.unikernel.org/t/nfv-platforms-with-mirageos-unikernels/175

*Thanks to [Amir][], [Mort][], and [Anil][]
for their comments on earlier drafts.*

[continuum]: http://unikernel.org/blog/2015/unikernels-meet-docker
[MirageOS]: https://mirage.io
[OCaml]: http://ocaml.org
[jitsu]: http://unikernel.org/files/2015-nsdi-jitsu.pdf
[vchan]: https://github.com/mirage/ocaml-vchan
[Xenstore]: https://github.com/mirage/ocaml-xenstore
[Irmin]: http://irmin.io
[Xenctrl]: https://github.com/xapi-project/ocaml-xen-lowlevel-libs
[charrua-post]: https://mirage.io/blog/introducing-charrua-dhcp
[simple-nat]: https://github.com/yomimono/simple-nat
[qubes-fw]: https://github.com/talex5/qubes-mirage-firewall
[scale14x]: https://www.socallinuxexpo.org/scale/14x/unikernels-and-more-cloud-innovators-forum
[nfv-video]: https://www.youtube.com/watch?v=it3g4XWskkc
[nfv-slides]: http://www.slideshare.net/xen_com_mgr/unikernels-meet-nfvs-architecture-performance-and-challenges-wassim-haddad-heikki-mahkonen-ravi-manghirmalani-ericsson
[ericsson-nfv]: https://www.ericsson.com/research-blog/sdn/unikernels-meet-nfv/
[hannes-post]: https://hannes.nqsb.io/Posts/BottomUp
[#608]: https://github.com/ocaml/ocaml/pull/608
[Amir]: https://twitter.com/amirmc
[Mort]: http://mort.io
[Anil]: http://anil.recoil.org
