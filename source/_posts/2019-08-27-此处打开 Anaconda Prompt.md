---
layout: post
title: 此处打开Anaconda Prompt
date: 2019-08-27 22:55:00
tags:
- Anaconda
- regedit
- trick
categories:
- tech
- regedit
---

## 话不多说，直入正题

* **此处涉及的所有的右击目标操作，均可以替换为选中目标并在右侧窗口空白处右击**
* **所有的值均不带引号**
* **带※的步骤为可选项**

1. **打开“运行”窗口**（快捷键：Windows徽标键+R）**，输入“regedit”打开注册表编辑器**
2. **上方路径处输入“计算机\\HKEY_CLASSES_ROOT\\Directory\\Background\\shell”**（也可能是“我的电脑”等）
3. **右击“shell”→“新建”→“项”，命名为“Anaconda”**（随意命名）
4. ※&nbsp;选中“Anaconda”项，双击右侧窗口的“（默认）”项（其值为显示在右键菜单中的名称）
5. ※&nbsp;右击“Anaconda”→“新建”→“字符串值”，命名为“Icon”
6. ※&nbsp;双击“Icon”，设置其值为“cmd.exe”（其值为右键菜单中显示的图标的路径）
7. **右击“Anaconda”→“新建”→“项”，命名为“command”**
8. **选中“command”项，双击右侧窗口的“（默认）”项，设置其值为：**
   * “cmd.exe /s /k "title Anaconda" && D:\\Anaconda3\\Scripts\\activate.bat D:\\Anaconda3”
   * “D:\\Anaconda3”更改为自己安装的Anaconda的路径

## 对比图

![][pic-1]
![][pic-2]

[pic-1]: http://q8rnfvsfm.bkt.clouddn.com/images/%E6%AD%A4%E5%A4%84%E6%89%93%E5%BC%80%20Anaconda%20Prompt/pic-1.png
[pic-2]: http://q8rnfvsfm.bkt.clouddn.com/images/%E6%AD%A4%E5%A4%84%E6%89%93%E5%BC%80%20Anaconda%20Prompt/pic-2.png
