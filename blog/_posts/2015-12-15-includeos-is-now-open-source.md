---
layout: post
title: "IncludeOS is now free and open source!"
authors: 
- Alfred Bratterud
author-urls: 
- 'https://github.com/alfred-bratterud'
date: 2015-12-15 14:30:00
tags: [unikernel, includeos, release]
image: /images/contain-your-unikernels.png
excerpt: "We've finally opened the lid on IncludeOS, just in time for the IEEE CloudCom paper presentation recently. A preprint of the paper is available from our repo. However, we've done quite a lot of work since the paper was written, so here's an update on what IncludeOS is now, and what you can expect in the near future."
shorturl: 
---
{% include JB/setup %}

<!-- ![IncludeOS]({{BASE_PATH}}/images/includeos.png) -->

*Alfred Bratterud is Assistant Professor and PhD scholar at Oslo and Akershus University College of Applied Science where he is currently working full time leading the development of IncludeOS at the NetSys research group.*

We've finally lifted the lid on [IncludeOS][], just in time for the
[IEEE CloudCom][] paper presentation recently. A preprint of the paper is
[available from our repo][paper]. However, we've done quite a lot of work
since the paper was written, so here's an update on what IncludeOS is now, and
what you can expect in the near future. 

### It's a bit like a JVM, but for x86 C++

A Java Virtual Machine is a portable language runtime environment. Java is
portable across hardware architectures and operating systems because it uses a
common instruction set. Once you've started a Java program, you can't log into
it (unless your program itself provides the facilities), and you can't boot up
any other programs inside it.

IncludeOS is like a safe language runtime for C++ programs, compiled into the
x86 instruction set. This has the obvious advantage of removing one layer of
abstraction, compared to Java: with hardware virtualization the code will
execute directly on the CPU. Like with a Java program and other unikernels, an
IncludeOS service is a program, with the language runtime attached. It's
called IncludeOS because you start by saying `#include <os>` and whatever your
service needs from the operating system will be included into the virtual
machine. 

Think about the original reasons for creating Java; one main reason was
definitely portability. With pervasive hardware virtualization you can now get
similar portability for compiled C++ programs. We're currently only portable
across x86 operating systems, but with VirtualBox, you can run the same binary
on Windows, Linux and MacOS X. What's more, "Hello World" in IncludeOS on KVM
has about *a third of the memory footprint* of "Hello world" in Java, running
directly on the server, even when we take the whole Qemu process into account
(8.45 MB vs 28.29 MB)

From this interesting premise, rather than working towards running a JVM or
supporting another high-level language, we want to focus on creating an
intuitive and modern C++ hardware API, with minimal overhead. But of course,
if somebody wants to use IncludeOS as a platform for supporting high level
language runtimes, that would be great too. Before that can happen though,
we'll have to get a stable API. We're currently on 0.7.0, meaning that
anything can change at any time.

### Networking from scratch

One thing you'll notice is that our network stack is currently being written
from scratch. Are we crazy? Possibly. We obviously considered — and wanted
to — port the stack from somewhere else, but not being intimately familiar
with any existing kernel, I found that to be even harder than just doing it
from scratch. I got a lot of help from reading the nicely annotated and
cross-linked [SanOS source code][], and once the virtio network driver was
working, the rest wasn't nearly as hard as one might think - at least up to
now. Clearly it will take time to make it complete, but the efforts it took to
get from a driver, up to rudimentary TCP was really insignificant compared to
the challenges we've faced when trying to integrate third-party libraries such
as newlib (Standard C) and libc++ (Standard C++). Getting to read RFC's and
implementing the TCP handshake from scratch has really been a blast — a highly
recommended exercise.

### C++ is a new language

If you haven't looked at C++ after 2011, you should look now — "It feels like
a new language" (Bjarne Stroustrup). While you can always argue that adding
new feature won't necessarily make the language any better, it most definitely
makes it more powerful. Here are a couple of really nice new language features
we're using in IncludeOS:

1. Real Lambdas. Not function pointers, not just call operators, but lambdas just like you know and love from functional languages.
2. C++11 implementation of delegates (i.e. pointers to a member function in a class instance), which are exactly as fast as function pointers. We're using these everywhere. Reading [the implementation][delegate-hpp] is a great way to have your brain explode, but they work like magic.
3. User defined literals, and std::literals for units. You can set timers by passing in `100ms`, `10s` or `50min` as parameters to the same function. 
4. Shared pointers. These behave much like normal C-style pointers, but will keep track of the number of instances of itself. Whenever a shared pointer exits the last scope, the destructor of the object pointed to gets called. We use this to have network packets release their buffers back to a buffer store, once they're no longer used by anyone.
5. A lot of wisdom, packed into concise [guidelines][cpp-guide] from the Standard C++ foundation (a.k.a. ISO C++ / the Jedi Council).

Obviously, with C++ you can mess up the memory of your own program if you want
to, but compared to C you have so many more tools for writing encapsulated and
type-safe code. And of course, if performance or energy efficiency is key to
your app, C++ is an obvious choice. As a test case for the paper, a bootable
disk image consisting of a simple DNS server with OS included was shown to
require only 158 kb of disk space and to require 5-20% less CPU-time,
depending on hardware, compared to the same binary running on Linux. A lot of
this performance comes from greatly reduced complexity, but a lot also comes
for free by just using C++.

### We want to make Node++

IncludeOS is pretty similar to Node.js in a few respects: It's single threaded
at the moment, but highly efficient due to non-blocking I/O. This means that
you'll have to use a callback-based programming style, just like with
Javascript. The events you'll be subscribing to are all rooted in a physical
interrupt — in fact, you can add callbacks to interrupts directly, if you want.
An interesting thing to keep in mind is that I/O in modern hardware is
non-blocking by default, with Direct Memory Access (DMA). A network packet
arriving into IncludeOS will result in an interrupt, but only after the whole
packet is written directly into memory by the device. At that point, IncludeOS
will defer the interrupt, and as soon as the CPU is done with whatever it was
doing, it will call the callback delegate (possibly a lambda) of whoever's
subscribing to that interrupt. That delegate can again use the same technique,
to fire events higher up the stack. In our view, this kind of event-based
programming fits hardware better than sequential, blocking programming. Also,
GUI-programming has always been like this, so the techniques are well known. 

In the [2016 Roadmap][] our explicit goal is to become "Node++": we want to
enable people to develop tiny, self-contained, Node.js-style web services,
with RESTful API's, in highly efficient C++.

### Thanks for the warm welcome!

Opening up a repository after over a year, to much expectation from people you
look up to, is pretty scary. There are so many things I'd like to improve, fix
and add, but at some point you just have to let go and let it rip. The hope
was that opening up would help the process — and indeed I got a pull request
fixing all my typos the very next day. The inclusive response from
[ISO C++][], and the immediate welcome on twitter from the [MirageOS][] team
have made us feel like family, more than competition, which is what we'd like
to be. We hope to be able to contribute something back to the Unikernel effort
as a whole.

<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr">The IncludeOS <a href="https://twitter.com/hashtag/unikernel?src=hash">#unikernel</a> is now free and <a href="https://twitter.com/hashtag/opensource?src=hash">#opensource</a>. Find our research prototype at <a href="https://t.co/1gnag1W2hA">https://t.co/1gnag1W2hA</a> <a href="https://twitter.com/hashtag/cloudcom?src=hash">#cloudcom</a> <a href="https://twitter.com/hashtag/includeos?src=hash">#includeos</a></p>&mdash; Alfred Bratterud (@AlfredBratterud) <a href="https://twitter.com/AlfredBratterud/status/671809686820143104">December 1, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

### Try it out!

If you're interested in playing around with IncludeOS, the best place to start
is at the [README][], right on the front of our repository. You'll surely get
it to work if you have a clean Ubuntu 14.04 VM in VirtualBox, or an Ubuntu
14.04 server, but we have also been able to build on MacOS X directly. Once
you've built an image, it should run anywhere with VirtualBox or KVM!

*Thanks to [Amir][], [Anil][], [Jeremy][] and [Mort][] for their comments on earlier drafts.*

[IncludeOS]: http://www.includeos.org
[IEEE CloudCom]: http://2015.cloudcom.org/
[paper]: https://github.com/hioa-cs/IncludeOS/blob/master/doc/papers/IncludeOS_IEEE_CloudCom2015_PREPRINT.pdf
[SanOS source code]: http://www.jbox.dk/sanos/source/
[delegate-hpp]: https://github.com/hioa-cs/IncludeOS/blob/master/api/utility/delegate.hpp
[cpp-guide]: https://github.com/isocpp/CppCoreGuidelines
[2016 Roadmap]: https://github.com/hioa-cs/IncludeOS/wiki/Roadmap
[ISO C++]: https://isocpp.org/
[MirageOS]: https://mirage.io/
[README]: https://github.com/hioa-cs/IncludeOS/blob/master/README.md

[Amir]: https://twitter.com/amirmc
[Anil]: http://anil.recoil.org
[Jeremy]: https://github.com/yallop
[Mort]: http://mort.io
