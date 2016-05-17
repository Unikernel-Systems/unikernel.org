---
layout: post
title: "CyberChaff: HaLVM unikernels protecting corporate networks"
authors: 
- Adam Wick
- Amir Chaudhry
author-urls: 
- 'http://amirchaudhry.com'
- 'https://galois.com/team/adam-wick/'
date: 2016-05-17 00:01:00
tags: [halvm, products, unikernel, users]
image: /images/cyberchaff-reed/after-cyberchaff.png
excerpt: "Today Formaltech, a Galois subsidiary, revealed that Reed College is
one of their happy CyberChaff users!"
shorturl: 
---
{% include JB/setup %}

Unikernel technologies, specifically the libraries, are applicable in many
ways (e.g. the recent [Docker for Mac and Windows products][d4mac]).  However,
unikernels themselves can enable new categories of products. One of the most
prominent products is a network security tool called CyberChaff, based on open
source HaLVM unikernels.  Today Formaltech, a Galois subsidiary, [revealed][pr]
that Reed College is one of their happy CyberChaff users!

[pr]: #
[d4mac]: https://blog.docker.com/2016/03/docker-for-mac-windows-beta/

### Defending a Network With CyberChaff

CyberChaff is designed to detect one of the early and critical steps in a
security breach: the point when an attacker pivots from their initial entry
point to the more juicy parts of the network. This step, the pivot, typically
involves scanning the network for hosts that may be better positioned, appear
to have more privileges, or are running critical services.

To impair this step of the attack, CyberChaff introduces hundreds (or
thousands) of false, lightweight nodes on the network. These hosts are
indistinguishable from real hosts when scanned by the attacker, and are each
implemented as their own HaLVM unikernel.  See the diagram below where green
nodes are the real hosts and the orange nodes are HaLVM CyberChaff nodes. This
means that an attacker is faced with a huge surface area of potential decoys,
which mask the real hosts. If they scan one of the decoys, an alarm goes off.
If they try to interact with one of the decoys, via HTTP or some other
protocol, an alarm goes off. IT staff are notified of the intrusion, and can
react as they wish. Further, since each CyberChaff node is a
unikernel, and their only purpose is to look like a real system, there is
nothing to actually gain access to! Even if the attacker manages to find a
flaw in the CyberChaff software, all they will have gained access to is a
virtual machine with very, very limited functionality.


![Pic of a network after CyberChaff]({{BASE_PATH}}/images/cyberchaff-reed/before-after-cyberchaff.jpg)

<!-- ![Pic of a network before CyberChaff](/images/cyberchaff-reed/before-cyberchaff.png)
![Pic of a network after CyberChaff](/images/cyberchaff-reed/after-cyberchaff.png) -->

### Under the Hood

So how are CyberChaff nodes actually implemented?

As mentioned, each CyberChaff node consists of a HaLVM unikernel implementing
our core CyberChaff engine. Based on its configuration, it can choose whatever
it wants to implement: servers, workstations, laptops, switches, mobile
phones, and even the navigation computer in a sailboat. It does so by including
configuration information at all layers of the network stack: custom
functionality that allows it to appear as different operating systems to low
level scans, custom protocol handlers to mimic the services available on the
network, and even higher-level protocol implementations to capture information
about the attacker. For example, CyberChaff can be configured to expose
an Apple-manufactured network card, running a Microsoft Operating System, with
a particular version of Nginx running on a given port and SSH capturing the
attacker's login credentials. Of course, such a Frankenstein system might be
obvious to an attacker, so usually administrators try to be more subtle!

Once they’re up, CyberChaff nodes sit on a network, consuming few resources
and generating only a little traffic. Why generate traffic? Well, one of the
quieter ways for an attacker to scan a network is to silently listen for
certain forms of management traffic. For example, they might list to ARP
requests and responses to figure out who is on the network. Thus, CyberChaff
generates a small, managed amount of traffic to make sure it looks legitimate.
Future extensions will target the generation of more interesting traffic,
such as encrypted SSH or web sessions, or even unencrypted web crawling.

Overall, creating and deploying a product of this kind is possible due to the
unikernel approach. Since each node is small and single-purpose, it becomes
much easier to deploy large numbers of them across a network.  This is in
contrast to creating ‘honey pots’ with traditional systems, which can be
expensive, are cumbersome to maintain, and unfeasible to deploy at scale.

It's exciting we can now talk about unikernel products in the real world and
this is only the beginning of what they can offer in terms of efficiency,
capability, and portability.

### Get involved!

You can learn more about [Reed's experience with CyberChaff][pr], find out
more at [Fomaltech][Formaltech], checkout the [HaLVM codebase][halvm], and
join the conversation at [devel.unikernel.org][devel]!

[Formaltech]: https://formal.tech/products/cyberchaff/
[halvm]: https://github.com/GaloisInc/HaLVM
[devel]: https://devel.unikernel.org/c/halvm
