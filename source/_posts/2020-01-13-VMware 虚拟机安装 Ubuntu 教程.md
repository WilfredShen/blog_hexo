---
layout: post
title: VMware 虚拟机安装 Ubuntu 教程
tags:
  - 虚拟机
  - Ubuntu
  - VMware
categories:
  - 安装
  - 虚拟机
description: >-
  本文详细介绍了如何在 VMware Workstation Pro15 下安装
  Ubuntu，包括“网络设置”、“磁盘分区”以及“文件系统”等等，并提供了国内的镜像源...
abbrlink: a04c2f4
date: 2020-01-13 01:20:00
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

[01-新建虚拟机]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/01-%E6%96%B0%E5%BB%BA%E8%99%9A%E6%8B%9F%E6%9C%BA.png
[02-硬件兼容性]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/02-%E7%A1%AC%E4%BB%B6%E5%85%BC%E5%AE%B9%E6%80%A7.png
[03-空白硬盘]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/03-%E7%A9%BA%E7%99%BD%E7%A1%AC%E7%9B%98.png
[04-系统选择]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/04-%E7%B3%BB%E7%BB%9F%E9%80%89%E6%8B%A9.png
[05-安装位置]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/04-%E7%B3%BB%E7%BB%9F%E9%80%89%E6%8B%A9.png
[06-处理器选择]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/06-%E5%A4%84%E7%90%86%E5%99%A8%E9%80%89%E6%8B%A9.png
[07-内存选择]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/07-%E5%86%85%E5%AD%98%E9%80%89%E6%8B%A9.png
[08-网络选择]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/08-%E7%BD%91%E7%BB%9C%E9%80%89%E6%8B%A9.png
[09-磁盘选择-1]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/09-%E7%A3%81%E7%9B%98%E9%80%89%E6%8B%A9-1.png
[10-磁盘选择-2]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/10-%E7%A3%81%E7%9B%98%E9%80%89%E6%8B%A9-2.png
[11-选择系统镜像]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/11-%E9%80%89%E6%8B%A9%E7%B3%BB%E7%BB%9F%E9%95%9C%E5%83%8F.png
[12-选择语言]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/12-%E9%80%89%E6%8B%A9%E8%AF%AD%E8%A8%80.png
[13-准备安装]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/13-%E5%87%86%E5%A4%87%E5%AE%89%E8%A3%85.png
[14-自定义磁盘分区]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/14-%E8%87%AA%E5%AE%9A%E4%B9%89%E7%A3%81%E7%9B%98%E5%88%86%E5%8C%BA.png
[15-swap]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/15-swap.png
[16-boot]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/16-boot.png
[17-home]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/17-home.png
[18-root]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/18-root.png
[19-完成分区]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/19-%E5%AE%8C%E6%88%90%E5%88%86%E5%8C%BA.png
[20-安装完成]: http://static.wilfredshen.cn/images/VMware%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85%20Ubuntu%20%E6%95%99%E7%A8%8B/20-%E5%AE%89%E8%A3%85%E5%AE%8C%E6%88%90.png
