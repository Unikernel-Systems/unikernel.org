---
layout: post
title: "Unbreakable unikernels!"
authors: 
- Per Buer
author-urls: 
- 'https://twitter.com/perbu'
date: 2017-07-04 14:30:00
tags: [unikernel, security]
image: /images/Broad_chain_closeup.jpg
excerpt: 
shorturl: 
---
{% include JB/setup %}

*[Per Buer] is the CEO of [IncludeOS]. IncludeOS is a clean-slate unikernel written in C++ with performance and security in mind. Per Buer is the founder and previous CEO/CTO of Varnish Software.*

We've created a video that explains this in 7 minutes, so you'll have the option of watching it instead of reading it.

<iframe width="560" height="315" src="https://www.youtube.com/embed/aoomQn7gLm4?ecver=1" frameborder="0" allowfullscreen></iframe>

There have been put forth various arguments for why Unikernels are the better choice security wise and also some contradictory opinions on why they are a disaster. I believe that from a security perspective Unikernels can offer a level of security that is unprecedented in mainstream networks. 

### A Smaller codebase

Classic operating systems are nothing if not generic. They support everything and the kitchen sink. Since they ship in their compiled form and since users cannot be expected to compile functionality as it is needed everything needs to come prebuilt and activated. Case in point; your windows laptop might come with various  services activated (bluetooth, file sharing, name resolution and similar services). You might not use them but they are there. Go to some random security conference and theses services will likely be the attack vector that is used to break into your laptop - even though you’ve never used them.
 
Unikernels use sophisticated build systems that analyze the code you’re using and only link in the code that is actually used. The unused code doesn’t make it into the image created and doesn’t post a security risk.

## No shell. 

Unikernels have no shells. Most attacks I've seen use shell code to modify the system they are attacking. Without a shell the attacker doesn't have this opportunity.

## We're immutable - no support for reconfiguring the VM

Whenever we need to change a service that is running on a unikernel the service gets rebuilt and redeployed. So most likely the system doesn't have the ability to reconfigure itself. So the attacker will likely have to inject this code as well, something that would be next to impossble.

## No System calls
 
A binary application on Linux uses [system calls] to talk to the operating system. The mechanism for doing system calls is well predefined. System calls are numbered and on X86-64 you just put the number indicating the syscall in the %rax register and call the instruction syscall. So once you know what operating system the computer is running it’s very easy to invoke the operating system.

Have a look at this minimal hello world example written in C. This code, which is architecture specific (OS X ) just writes "Hello World" on file descriptor zero using system call #4. In order to compile this on Linux replace the 4 with a 1 and it should work on Linux.

<pre>
    #include <sys/syscall.h>
    
    int main() {
    	// Syscall #4 is write on OS X
        syscall(4,0, "Hello world\n", 12);
    }
</pre>

System calls are, as you can tell, quite portable. Every installation of Linux supports the same system calls. This is practical when you’re using them to attack a computer system. If the target system is running Linux you know that write() is invoked with system call #1. So just put 1 into %rax, supply a pointer, length and filedescriptor and invoke the syscall instruction. Adding a row to /etc/passwd is likely just around 10 instructions. Open the file, lseek() to end of the file and write() a new row.
 
Unikernels on the other hand don’t have system calls. They only have function calls. For an attacker this means they’ll have to know the exact memory layout of your application in order to invoke the operating system. You'll need to know the exact 64 bit address of the function you're invoking. Good luck guessing that address.

If the application doesn’t have any supplied code to do write() the task goes from being hard to  impossible.
 
## Removing hardware emulation
 
There are two aspects of unikernel security. One is the vector into the VM and the other is the vector from the VM into the hypervisor. Today the hypervisor offers a very complex set of interfaces to the VM. PCI buss, GPU, serial, floppy drives. 
 
These interfaces pose a risk to the VMM. As shown by the [2015 VENOM attack](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-3456) they can be used to break out of a VM and into the VMM. In the VENOM attack the attacker could attack the [Qemu] through the floppy interface provided by it. 
  
IBM research has spearheaded this effort with their [Ukvm] project. Ukvm is a replacement for [Qemu] specifically built for unikernels. [Solo5] provides a framework for Unikernels to boot a VM that is backed by ukvm instead of qemu. Both [IncludeOS] and [MirageOS] are already capable of booting using the Solo5 core and efforts are underway to port [HaLVM] to Solo5/Ukvm.
 
Simplifying the emulated virtual machines will significantly increase VMM security.
 
## Cutting of access to ring 0 - creating immutable VMs
 
One of the criticisms I’ve heard raised against unikernels is that the whole application now runs in “kernel space” and has root privileges. Today, this is true, but the only reason is because unikernels needs to manage virtual hardware and page tables to run. However, if the hypervisor can set up the VM before it is booted and provide paravirtualized interfaces to the hardware we don't need access to ring 0.
 
What we need is this:

* packet interface for the network
* a block interface for some storage
* a serial port to output console data

These can likely be invoked through the [VMCALL] instruction. This will trap and invoke the Virtual Machine Monitor. Since these interfaces are rather simplistic we can spend a moderate amount of effort securing these and making sure that they are reasonably bug free. 
 
A key feature of a unikernel system is that it is meant to be immutable. Once it boots there is typically no need to update it. If the VM runs in ring 3 it can be made incapable of modifying its own page tables. If the hypervisor loads the unikernel and sets the executable pages immutable before booting it the VM cannot alter itself. This dramatically reduces the aperture of the attack. As long as there no writeable and executable pages in the unikernel I'm strugling to see a way it can be subverted. If the application has a bug you might still be able to crash it and make it restart, but you have no way of subjugating the VM.
 
The hardware is still potentially vulnerable and as such the VM might be subject to attacks like the bitbanging attack we’ve seen on various ARM platforms. However, the track record of x86-64 is very good and I wouldn’t have any problem relying on the platform for workloads with high security requirements. 
 
## Conclusions
 
The perimeter security defence features of Unikernels are today far superior to traditional operating systems. The absence of shells and system calls blinds the attacker and even if the application is buggy the worst case scenario is a denial of service.
 
As our virtual machine monitors mature we can expect unikernel security to advance further. The future for unikernels is secure.

<sub>[Image](https://commons.wikimedia.org/wiki/File:Broad_chain_closeup.jpg) is (c) 2006 Toni Lozano and used under a Creative Commons 2.0 Generic License</sub>


[IncludeOS]: http://www.includeos.org/
[MirageOS]: https://mirage.io/
[Ukvm]: https://github.com/Solo5/solo5/tree/master/ukvm
[solo5]: https://github.com/Solo5/solo5
[HalVM]: https://github.com/GaloisInc/HaLVM
[VMCALL]: https://www.tptp.cc/mirrors/siyobik.info/instruction/VMCALL.html
[system call]: https://en.wikipedia.org/wiki/System_call
[Qemu]: http://www.qemu.org
[Per Buer]: https://twitter.com/perbu

