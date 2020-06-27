---
layout: post
title: VMware Workstation Pro15 安装教程
tags:
  - 虚拟机
  - VMware
categories:
  - 安装
  - 虚拟机
description: 本文介绍了如何在 Windows 下安装 VMware Workstation Pro15，并提供了一些兼容性问题的处理方法...
abbrlink: bbcd66d8
date: 2020-01-13 00:40:00
---

## 安装环境

* Windows10 家庭版 1903

由于Windows10 **1903**版之后跟vmware有些地方不兼容，需要做一些额外操作，如果你的win10版本在1903之前，可以考虑跳过下一步骤。

[下载地址：https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.1-15018445.exe](https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.1-15018445.exe)

## 处理兼容性问题

此为预防处理，可能会做一些无用操作，但能保证安装基本不会出问题

1. 打开“卸载”界面，点击“启动或关闭Windows功能”，找到**Hyper-v**并取消勾选，如果没有则不用操作
  ![][01-卸载界面]
2. 任务管理器切换至“服务”选项卡，右键任意服务并选择“打开服务”，找到“Hv 主机服务”，双击打开，进行如下设置
  ![][02-禁用主机服务]
3. win+R打开运行窗口，输入msinfo32，在右侧找到以下条目
  ![][03-系统摘要]
  如果显示为**启用**等，则win+S打开搜索框，输入cmd，选择**以管理员身份运行**
  ![][04-管理员运行cmd]
  输入`bcdedit /set hypervisorlaunchtype off`，提示“操作成功完成”即可

4. 以上步骤为禁用win10自带的虚拟机，还要注意的一点是使用虚拟机需要在BIOS界面启用**内存虚拟化**，由于不同厂家的BIOS界面差异较大，请自行解决

## 正式安装

正式安装十分简单，跟着安装程序走就可以

[01-卸载界面]: http://static.wilfredshen.cn/images/VMware%20Workstation%20Pro15%20%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B/01-%E5%8D%B8%E8%BD%BD%E7%95%8C%E9%9D%A2.png
[02-禁用主机服务]: http://static.wilfredshen.cn/images/VMware%20Workstation%20Pro15%20%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B/02-%E7%A6%81%E7%94%A8%E4%B8%BB%E6%9C%BA%E6%9C%8D%E5%8A%A1.png
[03-系统摘要]: http://static.wilfredshen.cn/images/VMware%20Workstation%20Pro15%20%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B/03-%E7%B3%BB%E7%BB%9F%E6%91%98%E8%A6%81.png
[04-管理员运行cmd]: http://static.wilfredshen.cn/images/VMware%20Workstation%20Pro15%20%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B/04-%E7%AE%A1%E7%90%86%E5%91%98%E8%BF%90%E8%A1%8Ccmd.png
