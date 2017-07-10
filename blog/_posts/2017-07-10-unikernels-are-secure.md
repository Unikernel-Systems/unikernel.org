---
layout: post
title: "Unikernels are secure. Here is why."
authors: 
- Per Buer
author-urls: 
- 'https://twitter.com/perbu'
date: 2017-07-10 01:00:00
tags: [unikernel, security]
image: /images/Broad_chain_closeup.jpg
excerpt: There have been put forth various arguments for why unikernels are the better choice security wise and also some contradictory opinions on why they are a disaster. I believe that from a security perspective unikernels can offer a level of security that is unprecedented in mainstream computing. 
shorturl: 
---
{% include JB/setup %}

*[Per Buer][] is the CEO of [IncludeOS][]. IncludeOS is a clean-slate unikernel written in C++ with performance and security in mind. Per Buer is the founder and previous CEO/CTO of Varnish Software.*

We've created a video that explains this in 7 minutes, so you'll have the option of watching it instead of reading it.

<div class="flex-video">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/aoomQn7gLm4?ecver=1" frameborder="0" allowfullscreen></iframe>
</div>

There have been put forth various arguments for why unikernels are the better choice security wise and also some contradictory opinions on why they are a disaster. I believe that from a security perspective unikernels can offer a level of security that is unprecedented in mainstream computing. 

### A smaller codebase

Classic operating systems are nothing if not generic. They support everything and the kitchen sink. Since they ship in their compiled form and since users cannot be expected to compile functionality as it is needed, everything needs to come prebuilt and activated. Case in point; your Windows laptop might come with various services activated (bluetooth, file sharing, name resolution, and similar services). You might not use them but they are there. Go to some random security conference and these services will likely be the attack vector that is used to break into your laptop — even though you’ve never used them.

Unikernels use sophisticated build systems that analyze the code you’re using and only link in the code that is actually used. The unused code doesn’t make it into the image created and doesn’t pose a security risk. Typically, unikernel images are in the 500KB-32MB range. Our own load balancer appliances weigh in at around 2MB.

### No shell

Unikernels have no shells. Most attacks I've seen invoke `/bin/sh` to modify the system they are attacking. Without a shell the attacker doesn't have this opportunity. This forces the attacker to use machine code to subvert the system, decreasing the likelihood of succeeding with the attack.

### We're immutable - no support for reconfiguring the VM

Whenever we need to change a service that is running on a unikernel the service gets rebuilt and redeployed. So most likely the system doesn't have the ability to reconfigure itself. So the attacker will likely have to inject this code as well, something that would be next to impossible. Even if the attack is successful, the VM will get back to a known state the next time there is a configuration change.

### No System calls

A binary application on Linux uses [system calls][] to talk to the operating system. The mechanism for doing system calls is well defined. System calls are numbered and on x86-64 you just put the number indicating the syscall in the `%rax` register and call the instruction syscall. So once you know what operating system the computer is running it’s very easy to invoke the operating system.

Have a look at this minimal hello world example written in C. This code, which is architecture specific (macOS), just writes "Hello World" on file descriptor zero using system call `#4`. In order to compile this on Linux replace the `4` with a `1` and it should work on Linux.

<pre>
    #include <sys/syscall.h>
    
    int main() {
    	// Syscall #4 is write on OS X
        syscall(4,0, "Hello world\n", 12);
    }
</pre>

System calls are, as you can tell, quite portable. Every installation of Linux supports the same system calls. This is practical when you’re using them to attack a computer system. If the target system is running Linux you know that `write()` is invoked with system call `#1`. So just put `1` into `%rax`, supply a pointer, length and file descriptor and invoke the syscall instruction. Adding a row to `/etc/passwd` is likely just around 10 instructions. `open()` the file, `lseek()` to the end of the file and `write()` a new row.

Unikernels on the other hand don’t have system calls. They only have function calls. For an attacker this means they’ll have to know the exact memory layout of your application in order to invoke the operating system. You'll need to know the exact 64 bit address of the function you're invoking. Good luck guessing that address. Our own unikernel, IncludeOS, randomizes addresses at each build, so even with access to source code you still don't know the memory layout.

If the application doesn’t have any supplied code to do `write()`, the task goes from being hard to impossible.

### Removing hardware emulation

There are two aspects of unikernel security. One is the vector into the VM and the other is the vector from the VM into the hypervisor. Today the hypervisor offers a very complex set of interfaces to the VM. PCI bus, GPU, serial, floppy drives. 

These interfaces pose a risk to the Virtual Machine Monitor (VMM). As shown by the [2015 VENOM attack](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-3456), they can be used to break out of a VM and into the VMM. In the VENOM attack the attacker could attack [QEMU][] through the floppy interface provided by it. 

IBM research has spearheaded a new effort with their [ukvm][] project. Ukvm is a replacement for QEMU specifically built for unikernels. [Solo5][] provides a framework for unikernels to boot a VM that is backed by ukvm instead of QEMU. Both [IncludeOS][] and [MirageOS][] are already capable of booting using the Solo5 core and efforts are underway to port [HaLVM][] to Solo5/ukvm. The [Muen Separation Kernel][] also has a Solo5 port and it'll be exciting to see if the more traditional operating systems will follow suit.

Simplifying the emulated virtual machines will significantly increase VMM security.

### Cutting off access to ring 0 — creating proper immutable VMs

One of the criticisms I’ve heard raised against unikernels is that the whole application now runs in “kernel space” and has root privileges. Today, this is true, but the only reason is because unikernels need to manage virtual hardware and page tables to run. However, if the hypervisor can set up the VM before it is booted and provide paravirtualized interfaces to the hardware, we don't need access to ring 0.

What we need is this:

* packet interface for the network
* a block interface for some storage
* a serial port to output console data

These can likely be invoked through the [VMCALL][] instruction. This will trap and invoke the Virtual Machine Monitor. Since these interfaces are rather simplistic we can spend a moderate amount of effort securing these and making sure that they are reasonably bug free. 

If the VM runs in ring 3 it is incapable of modifying its own page tables. If the hypervisor loads the unikernel and sets the executable pages immutable before booting it, the VM cannot alter itself. This dramatically reduces the aperture of the attack. As long as there are no writeable and executable pages in the unikernel I'm strugling to see a way it can be subverted. If the application has a bug you might still be able to crash it and make it restart, but you have no way of subjugating the VM.

The hardware is still potentially vulnerable and as such the VM might be subject to attacks like the bitbanging attack we’ve seen on various ARM platforms. However, the track record of x86-64 is very good and I wouldn’t have any problem relying on the platform for workloads with high security requirements. 

## Conclusions

The perimeter security defence of unikernels are today far superior to traditional operating systems. The absence of system calls and shells blinds the attacker and even if the application is buggy, subverting a unikernel VM is really hard. As our virtual machine monitors mature we can expect unikernel security to advance a lot further. The future for unikernels is secure.

<sub>[Image](https://commons.wikimedia.org/wiki/File:Broad_chain_closeup.jpg) is (c) 2006 Toni Lozano and used under a Creative Commons 2.0 Generic License</sub>


[IncludeOS]: http://www.includeos.org/
[MirageOS]: https://mirage.io/
[Ukvm]: https://github.com/Solo5/solo5/tree/master/ukvm
[solo5]: https://github.com/Solo5/solo5
[HalVM]: https://github.com/GaloisInc/HaLVM
[VMCALL]: https://www.tptp.cc/mirrors/siyobik.info/instruction/VMCALL.html
[system calls]: https://en.wikipedia.org/wiki/System_call
[Qemu]: http://www.qemu.org
[Per Buer]: https://twitter.com/perbu
[Muen Separation Kernel]: http://muen.sk/

