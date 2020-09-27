---
layout: post
title: CentOS7 安装配置 MySQL
tags:
  - Linux
  - MySQL
  - CentOS
categories:
  - 安装
  - MySQL
description: >-
  本文介绍如何在“阿里云学生服务器 CentOS 7.3 64位”下离线安装 MySQL，以及如何“配置环境变量”、“设置开机自启”、“修改 MySQL
  用户”和“启用远程连接”...
abbrlink: ed077cf0
date: 2020-05-14 16:00:00
---

## 环境

阿里云学生服务器（￥9.9/月） CentOS 7.3 64位

## 下载 tar 包并解压缩

博主采用离线安装的方式，首先下载 Nginx 的 tar 包，博主选择的是 `MySQL Community Server 5.7.30`，[链接在这](https://dev.mysql.com/downloads/mysql/5.7.html#downloads)。

| 选项                      | 值                                                           |
| ------------------------- | ------------------------------------------------------------ |
| `Select Version`          | `5.7.30`                                                     |
| `Select Operating System` | `Red Hat Enterprise Linux / Oracle Linux`                    |
| `Select OS Version`       | `Red Hat Enterprise Linux 7 / Oracle Linux 7 (x86, 64-bit)`  |
| `Download Packages`       | `Compressed TAR Archive (mysql-5.7.30-el7-x86_64.tar.gz) 693.6M`<br />`MD5: 0373ad13127e93ea6a06ab09771f2a99` |

不过官网下载太慢了，这里放一个[中科大的镜像](https://mirrors.ustc.edu.cn/mysql-ftp/Downloads/MySQL-5.7/)，我的 `100 Mbps` 带宽下载速度能拉满。镜像页面版本比较多，可以直接搜索 `mysql-5.7.30-el7-x86_64.tar.gz`。

下载完了记得校验一下，由于 `MD5` 非常容易碰撞，一定记得要在靠谱的源用 `https` 下载。

接下来就是一通操作，上传解压，我安装在 `/usr/local/mysql/mysql-5.7.30`。

## 安装

由于现在的 MySQL 有闭源的风险，所以 CentOS 7 开始使用 MariaDB 替换了默认的数据库，记得先把它卸载。

```shell
rpm -qa | grep mariadb
```

以上指令应该可以看到一个 MariaDB 的版本，没有的话就不用卸载了（它完全兼容 MySQL，但是没必要留着）。

之后我们先来创建一个群组和用户，用来管理 MySQL：

```shell
groupadd mysql
useradd -g mysql mysql
passwd mysql
```

然后将 `/usr/local/mysql` 目录的所有者和群组设置为 `mysql`：

```shell
cd /usr/local/
chown -R mysql:mysql mysql
```

创建一个 `data` 文件夹，用来存放一些数据：

```shell
cd ./mysql/mysql-5.7.30
mkdir data
chown -R mysql:mysql mysql
```

创建一个配置文件：

```shell
touch my.cnf
chown -R mysql:mysql my.cnf
vim my.cnf
```

`my.cnf` 内容如下：

```
[mysql]
socket=/var/lib/mysql/mysql.sock
# 默认字符集 utf-8
default-character-set=utf8

[mysqld]
socket=/var/lib/mysql/mysql.sock
# mysql server 端口，默认 3306，如无特殊需求不要更改
port = 3306
# 安装目录
basedir=/usr/local/mysql/mysql-5.7.30
# 保存数据的目录
datadir=/usr/local/mysql/mysql-5.7.30/data
# 允许的最大连接数
max_connections=200
# 默认字符集 utf-8
character-set-server=utf8
# 默认引擎
default-storage-engine=INNODB
lower_case_table_names=1
max_allowed_packet=16M
explicit_defaults_for_timestamp=true

[mysql.server]
user=mysql
basedir=/usr/local/mysql/mysql-5.7.30
```

创建完成后复制一份到 `/etc` 目录下，创建软连接也可以：

```shell
cp my.cnf /etc/my.cnf
ln -s /usr/local/mysql/mysql-5.7.30/my.cnf /etc/my.cnf
```

正式安装 MySQL，`bin/mysql_install_db` 已经替换成 `bin/mysqld --initialize` 了：

```shell
bin/mysqld --initialize --user=mysql --basedir=/usr/local/mysql/mysql-5.7.30 --datadir=/usr/local/mysql/mysql-5.7.30/data/
```

然后复制一份文件至 `/etc/init.d` 目录下，设置可执行权限，这就是启动用的：

```shell
cp ./support-files/mysql.server /etc/init.d/mysqld
chmod +x /etc/init.d/mysqld
```

接下来要启动服务：

```shell
/etc/init.d/mysqld restart
```

也许会有各种各样的错误信息，但搜索一下就能很快解决，最后可能剩下一条错误信息 `MySQL server PID file could not be found![FAILED]`，找出相应的进程 `kill` 掉就好了：

```shell
ps -ef | grep mysqld
kill -9 pid # pid 指进程 id
```

最后输出如下两条信息就说明安装成功了：

```
Shutting down MySQL..                                      [  OK  ]
Starting MySQL.                                            [  OK  ]
```

## 环境变量

可以考虑把 `bin` 目录加进环境变量中：

```shell
vim /etc/profile
```

在 `export PATH` 之前添加以下脚本：

```
PATH = $PATH:/usr/local/mysql/mysql-5.7.30/bin
```

最后重新执行 `/etc/profile` 脚本，使环境变量生效：

```shell
# 先移除 PATH，以免发生一些意外情况，具体原因需要理解如何修改环境变量，这里不赘述了
unset PATH
# 然后重新执行 /etc/profile
source /etc/profile
```

当然直接重启也是可以的。

## 开机自启

创建 `/usr/lib/systemd/system/mysql.service`，并设置其内容如下：

```
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=https://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
ExecStart=/usr/local/mysql/mysql-5.7.30/bin/mysqld --defaults-file=/etc/my.cnf
LimitNOFILE = 5000
#Restart=on-failure
#RestartPreventExitStatus=1
#PrivateTmp=false
```

启用开机自启：

```shell
systemctl enable mysql.service
```

## 使用 MySQL

安装完成还需要进行用户的设置，首先登录 MySQL：

```shell
# 显示初始密码
cat /root/.mysql_secret
# 使用密码登录
mysql -u root -p
```

不过大概率这个密码是没用的，我们需要设置初始密码。

由于 MySQL 的用户要在登录之后才能修改，我们要跳过密码验证这一步，编辑 `/etc/my.cnf`，在 `[mysqld]` 下面加上 `skip-grant-tables`，使用 `service mysqld restart` 重启服务，然后直接登录。

```mysql
use mysql;
# MySQL 5.7 后使用 authentication_string 而非 password 字段
update user set authentication_string=password('password') where user='root' and host='localhost';
# 刷新一下表
flush privileges;
```

当然修改密码的方式并非只有一种，最后重启服务。

改完密码记得把 `skip-grant-tables` 删掉！

## 远程登录

大多时候我们是需要远程访问数据库的，首先要在防火墙开放端口：

```shell
vim /etc/sysconfig/iptables
```

添加以下记录：

```
-A INPUT -p tcp -m state --state NEW -m tcp --dport 3306 -j ACCEPT
```

最后重启一下：

```shell
systemctl restart iptables
```

开放完端口我们还需要在 MySQL 中添加一个用于远程连接的用户：

```mysql
use mysql;
# 可以看一下有多少用户
select host,user from user;
# 远程连接的用户 host 使用 '%' 可以匹配所有 ip，user 尽量不要使用 root，可以新建一个
create user 'username'@'%' identified by 'password';
# 授予操作所有数据库和表的权限，使用 with grant option 允许 username 授予自己的权限给它创建的用户
grant all privileges on *.* to 'username'@'%' with grant option;
flush privileges;
```

之后就可以尝试一下远程连接了，如果是云服务器，记得在服务器的控制台开放端口！
