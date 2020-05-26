---
layout: post
title: CentOS7 安装配置 Nginx
tags:
  - Nginx
  - Linux
  - CentOS
categories:
  - install
  - Nginx
description: >-
  本文介绍如何在“阿里云学生服务器 CentOS 7.3 64位”下离线安装 Nginx，以及如何“配置防火墙”、“配置 HTTP/HTTPS
  服务”、“重定向网址”、“设置开机自启”...
abbrlink: 4af79843
date: 2020-05-12 12:45:00
---

上个月准备搭建个人网站的时候选择了使用 Nginx，并学习了如何装配，当时没有记录下来，现在重新回顾一遍。

## 环境

阿里云学生服务器（￥9.9/月） CentOS 7.3 64位

安装 Nginx 之前没有进行过任何操作，所以使用过的服务器遇到一些兼容性问题请自行搜索解决。

如果安装过程中遇到缺少依赖的情况，直接安装依赖即可，如果不放心可以去搜索查找解决方案。

## 下载 tar 包并解压缩

博主采用离线安装的方式，首先下载 Nginx 的 tar 包，地址：[http://nginx.org/en/download.html](http://nginx.org/en/download.html)，选择 `nginx-1.16.1.tar.gz`，当然可以选择其他版本。

然后使用 `scp` 命令上传至服务器，选择在服务器使用 `wget` 命令下载也可以。

之后使用 `tar` 命令解压缩，博主的安装目录为 `/usr/local/nginx`，可执行文件目录为 `/usr/local/nginx/sbin`。

建议将个人安装（而非使用 `yum` 或 `apt` 类命令安装）的应用程序以及各种环境都放在 `/usr/local` 目录下，同时如果可能需要安装多版本，则在目录下建立子目录用以区分。

## 安装 Nginx

```bash
# 进入 Nginx 目录
cd /usr/local/nginx
# 执行命令
./configure
make
make install
```

上面这三条命令是基本操作，如果你的文件没有问题，那么这三条命令也不应该出问题。如果以前安装过（或自带） `Nginx` ，记得先卸载。

## 验证安装

```shell
./sbin/nginx -t
# nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
# nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
```

输出注释的两句就说明安装没有问题，接下来去修改配置文件。

## 配置文件

### 防火墙

首先配置防火墙，需要让防火墙开放端口（关闭防火墙可以一劳永逸，但安全性得不到保障）

```shell
vim /etc/sysconfig/iptables
```

添加如下两条命令：

```
# 80 端口对应的 HTTP 协议，443 端口对应的 HTTPS 协议
# 如果之前没有动过防火墙，可以看到一条 22 对应的 SSH 协议
-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
```

### Nginx 配置文件

```shell
vim ./conf/nginx.conf
```

添加如下的记录（原先的可以注释掉了）：

```
# HTTP server
server {
    listen      80;
    server_name server_name;
    # HTTP 重定向至 HTTPS，强制 HTTPS 访问
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen       443 ssl;
    server_name  server_name;

    # ssl 证书，配置好目录（我放在 conf 目录下，与 nginx.conf 同目录）
    ssl_certificate      ssl_certificate.pem;
    ssl_certificate_key  ssl_certificate.key;

    # ssl 相关配置
    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    # 网站目录
    # root 规定访问的目录（我将服务放在 www 目录下，不同的服务分子目录）
    # index 规定访问的主页面
    location / {
        root   /www/source;
        index  index.html;
    }
}
```

### 完成配置

配置完记得启动服务

```shell
./sbin/nginx
```

再罗列一下常用的几条命令

```shell
./sbin/nginx -s stop # 停止 Nginx 服务
./sbin/nginx -s reload # 重新加载配置文件：启动一个新的进程来工作，然后让老进程优雅地退出，不会终止服务
```

后可以在浏览器输入服务器的 `ip` 尝试访问，如果显示 502 之类的错误，务必排查一下操作有没有错误。

## 开机自启

有时候我们会重启服务器，如果每次都要手动开启 `Nginx` 显然太麻烦了，需要配置一下开机自启：

```shell
# 切记以 .service 为后缀，打错了会失效
touch /usr/lib/systemd/system/nginx.service
vim /usr/lib/systemd/system/nginx.service
```

进行如下配置：

```
[Unit]
Description=nginx
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/usr/local/nginx/sbin/nginx -s quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

然后启动即可：

```shell
systemctl enable nginx
```
