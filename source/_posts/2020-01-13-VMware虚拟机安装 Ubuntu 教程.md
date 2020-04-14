---
layout: post
title: VMware虚拟机安装 Ubuntu 教程
date: 2020-01-13 01:20:00
tags:
- 虚拟机
- Ubuntu
- VMware
categories:
- tech
- Virtual-Machine
---

## 安装环境

* VMware版本为 VMware Workstation Pro 15.5.1
* Ubuntu版本为 ubuntu-12.04.5-desktop-i386

博主已经做过VMware安装教程以及兼容性处理，以下提供Ubuntu下载链接：

* [网易镜像：http://mirrors.163.com/ubuntu-releases/precise/ubuntu-12.04.5-desktop-i386.iso](http://mirrors.163.com/ubuntu-releases/precise/ubuntu-12.04.5-desktop-i386.iso)
* [官网原址：http://releases.ubuntu.com/12.04/ubuntu-12.04.5-desktop-i386.iso](http://releases.ubuntu.com/12.04/ubuntu-12.04.5-desktop-i386.iso)

## 正式安装

打开VMware，选择新建虚拟机，按照以下图片进行设置，其余按照默认设置即可。其中处理器、内存、磁盘大小可根据自己设备的情况进行调节，最好不要低于推荐值。
![][01-新建虚拟机]
![][02-硬件兼容性]
![][03-空白硬盘]
![][04-系统选择]
![][05-安装位置]
![][06-处理器选择]
![][07-内存选择]
![][08-网络选择]
![][09-磁盘选择-1]
![][10-磁盘选择-2]

上方网络选择处有三种模式，在这里简单介绍一下，可以跳过：

* bridge：虚拟机类似网络中一台独立的主机，可以与网络中的其他真实主机通讯，需要手动配置IP地址、子网掩码等。
* NAT：通过主机所在的网络访问公网，是最简易的上网模式，无需任何配置。 此模式下虚拟机的TCP/IP配置信息是由VMnet8(NAT)虚拟网络的DHCP服务器提供的，无法进行手工修改，因此虚拟系统也就无法和本局域网中的其他真实主机进行通讯。
* HostOnly：类似NAT模式，但是没有NAT服务，所以只能访问主机，而不能连接到Internet。

到此已经新建好虚拟机，接下来需要安装系统。首先我们需要选择一份系统镜像，最上方已经给出下载地址。在设置中选择下载好的镜像文件。推荐将镜像文件存放在固定位置，即使安装完系统也不要删除镜像文件，否则会打不开虚拟机。
![][11-选择系统镜像]

点击开启虚拟机，之后下方跳出小黄框推荐你安装的都可以安装。  
选择语言并开始安装
![][12-选择语言]
![][13-准备安装]

选择自定义磁盘分区
![][14-自定义磁盘分区]

点击新建分区表，并如下图设置
![][15-swap]
![][16-boot]
![][17-home]
![][18-root]
![][19-完成分区]

* 其中交换分区即为swap，推荐为内存的2倍，单不超过8G
  * swap在文件系统中选择，不要在挂载点中找或者输入一个swap
  * q他挂载点选择文件系统有多种选项，一般为ext4或者xfs，两者各有千秋，不深究的话随便选一个即可
* /boot挂载点为开机启动区，200-500MB即可，推荐不超过1G
* /home挂载点为用户数据，一般会存放许多数据，不能太小，这里分配了10G
* /挂载点为根目录，一般放一些重要文件，一般占磁盘的20%*40%即可，这里把剩下的空间都分给了它
* 其中/home和/挂载点的大小分配因人而异，只要不太小，怎么开心怎么来，不用太纠结

之后选择时区和语言，然后设置账号，就可以等待安装完成了。

最后附上一张安装完的图片
![][20-安装完成]

[01-新建虚拟机]: {{ '/Install Ubuntu VMware Workstation Pro 15/01-新建虚拟机.png' | prepend: site.imgrepo }}
[02-硬件兼容性]: {{ '/Install Ubuntu VMware Workstation Pro 15/02-硬件兼容性.png' | prepend: site.imgrepo }}
[03-空白硬盘]: {{ '/Install Ubuntu VMware Workstation Pro 15/03-空白硬盘.png' | prepend: site.imgrepo }}
[04-系统选择]: {{ '/Install Ubuntu VMware Workstation Pro 15/04-系统选择.png' | prepend: site.imgrepo }}
[05-安装位置]: {{ '/Install Ubuntu VMware Workstation Pro 15/05-安装位置.png' | prepend: site.imgrepo }}
[06-处理器选择]: {{ '/Install Ubuntu VMware Workstation Pro 15/06-处理器选择.png' | prepend: site.imgrepo }}
[07-内存选择]: {{ '/Install Ubuntu VMware Workstation Pro 15/07-内存选择.png' | prepend: site.imgrepo }}
[08-网络选择]: {{ '/Install Ubuntu VMware Workstation Pro 15/08-网络选择.png' | prepend: site.imgrepo }}
[09-磁盘选择-1]: {{ '/Install Ubuntu VMware Workstation Pro 15/09-磁盘选择-1.png' | prepend: site.imgrepo }}
[10-磁盘选择-2]: {{ '/Install Ubuntu VMware Workstation Pro 15/10-磁盘选择-2.png' | prepend: site.imgrepo }}
[11-选择系统镜像]: {{ '/Install Ubuntu VMware Workstation Pro 15/11-选择系统镜像.png' | prepend: site.imgrepo }}
[12-选择语言]: {{ '/Install Ubuntu VMware Workstation Pro 15/12-选择语言.png' | prepend: site.imgrepo }}
[13-准备安装]: {{ '/Install Ubuntu VMware Workstation Pro 15/13-准备安装.png' | prepend: site.imgrepo }}
[14-自定义磁盘分区]: {{ '/Install Ubuntu VMware Workstation Pro 15/14-自定义磁盘分区.png' | prepend: site.imgrepo }}
[15-swap]: {{ '/Install Ubuntu VMware Workstation Pro 15/15-swap.png' | prepend: site.imgrepo }}
[16-boot]: {{ '/Install Ubuntu VMware Workstation Pro 15/16-boot.png' | prepend: site.imgrepo }}
[17-home]: {{ '/Install Ubuntu VMware Workstation Pro 15/17-home.png' | prepend: site.imgrepo }}
[18-root]: {{ '/Install Ubuntu VMware Workstation Pro 15/18-root.png' | prepend: site.imgrepo }}
[19-完成分区]: {{ '/Install Ubuntu VMware Workstation Pro 15/19-完成分区.png' | prepend: site.imgrepo }}
[20-安装完成]: {{ '/Install Ubuntu VMware Workstation Pro 15/20-安装完成.png' | prepend: site.imgrepo }}
