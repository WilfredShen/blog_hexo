---
layout: post
title: CSAPP-bomblab
tags:
  - CSAPP
  - 汇编
categories:
  - 技术
  - 汇编
mathjax: true
description: >-
  本文详细拆解了 CSAPP 提供的 bomblab，包括 6 个 phase 以及 secret
  phase。其中数据为定制版，但解法相同，同时附上了反汇编代码和详细的注释，保证能读懂每一行反汇编代码的含义...
abbrlink: 71b4416c
date: 2020-05-04 18:34:43
---

本实验中博主采用对 `objdump -D` 令生成的文本进行分析求解（需要有基本的汇编知识，了解各种指令以及栈帧结构，之后的讨论中**不会**对此进行介绍），`gdb` 调试仅在求解 `secret_phase` 时使用。

**博主的部分数据有进行改动，故答案与官网的不同，但解法相同，可作参考学习。**

* 实验环境：Windows10 系统下 VMware 虚拟机 Ubuntu12.04 桌面版 32 位
* 原址链接：[http://csapp.cs.cmu.edu/3e/labs.html](http://csapp.cs.cmu.edu/3e/labs.html)

## phase_1

> `phase_1` 的主体是一个简单的函数调用

### block 1

```x86asm
08048b50 <phase_1>:
 8048b50:	83 ec 1c             	sub    $0x1c,%esp

 ; strings_not_equal(char*, "I was trying to give Tina Fey more material.")
 8048b53:	c7 44 24 04 64 a2 04 	movl   $0x804a264,0x4(%esp)
 8048b5a:	08
 8048b5b:	8b 44 24 20          	mov    0x20(%esp),%eax; %eax = input
 8048b5f:	89 04 24             	mov    %eax,(%esp); %eax = input
 8048b62:	e8 2d 05 00 00       	call   8049094 <strings_not_equal>
```

首先调用 `strings_not_equal` 函数，分析 `%esp` 可以了解到它有两个参数。第一个参数是 `phase_1` 传入的字符串，第二个参数是应该是一个字面值，存储在内存中的 `0x804a264` 处，如下：

```x86asm
 804a261:	65 2e 00 49 20       	gs add %cl,%cs:%gs:0x20(%ecx)
 804a266:	77 61                	ja     804a2c9 <_IO_stdin_used+0x1a5>
 804a268:	73 20                	jae    804a28a <_IO_stdin_used+0x166>
 804a26a:	74 72                	je     804a2de <_IO_stdin_used+0x1ba>
 804a26c:	79 69                	jns    804a2d7 <_IO_stdin_used+0x1b3>
 804a26e:	6e                   	outsb  %ds:(%esi),(%dx)
 804a26f:	67 20 74 6f          	and    %dh,0x6f(%si)
 804a273:	20 67 69             	and    %ah,0x69(%edi)
 804a276:	76 65                	jbe    804a2dd <_IO_stdin_used+0x1b9>
 804a278:	20 54 69 6e          	and    %dl,0x6e(%ecx,%ebp,2)
 804a27c:	61                   	popa
 804a27d:	20 46 65             	and    %al,0x65(%esi)
 804a280:	79 20                	jns    804a2a2 <_IO_stdin_used+0x17e>
 804a282:	6d                   	insl   (%dx),%es:(%edi)
 804a283:	6f                   	outsl  %ds:(%esi),(%dx)
 804a284:	72 65                	jb     804a2eb <_IO_stdin_used+0x1c7>
 804a286:	20 6d 61             	and    %ch,0x61(%ebp)
 804a289:	74 65                	je     804a2f0 <_IO_stdin_used+0x1cc>
 804a28b:	72 69                	jb     804a2f6 <_IO_stdin_used+0x1d2>
 804a28d:	61                   	popa
 804a28e:	6c                   	insb   (%dx),%es:(%edi)
 804a28f:	2e 00 00             	add    %al,%cs:(%eax)
```

[转换](https://wilfredshen.cn/tools/conversion/)一下就能得到字符串 `"I was trying to give Tina Fey more material."`。

### block 2

```x86asm
 ; if (strings_not_equal(/**/))
 8048b67:	85 c0                	test   %eax,%eax
 8048b69:	74 05                	je     8048b70 <phase_1+0x20>
 ;   explode_bomb()
 8048b6b:	e8 36 06 00 00       	call   80491a6 <explode_bomb>
 8048b70:	83 c4 1c             	add    $0x1c,%esp
 8048b73:	c3                   	ret
```

第二块判断 `strings_not_equal` 的返回值，若 `true` 则 `explode_bomb`，若 `false` 则 `return` 说明 `phase_1` 的答案为 `"I was trying to give Tina Fey more material."`。

### code

以下是根据汇编指令还原的代码（功能相同，但代码不一定完全相同）：

```c
int string_length(char* str)
{
    int count = 0;
    while (str[count])
        ++count;
}

int strings_not_equal(char* str1, char* str2)
{
    int len1 = string_length(str1), len2 = string_length(str2), i;
    if (len1 != len2)
        return 0;
    for (i = 0; i < len1; ++i)
        if (str1[i] != str2[i])
            return 0;
    return 1;
}

void phase_1(char* str)
{
    if (!strings_not_equal(str, "I was trying to give Tina Fey more material."))
        explode_bomb();
}
```

## phase_2

> `phase_2` 的主体是一个简单的 `for` 循环

### block 1

```x86asm
08048b74 <phase_2>:
 8048b74:	56                   	push   %esi
 8048b75:	53                   	push   %ebx
 8048b76:	83 ec 34             	sub    $0x34,%esp

 ; read_six_numbers(char* str, unsigned arr[])
 8048b79:	8d 44 24 18          	lea    0x18(%esp),%eax; %eax = arr
 8048b7d:	89 44 24 04          	mov    %eax,0x4(%esp); 0x4(%esp) = arr
 8048b81:	8b 44 24 40          	mov    0x40(%esp),%eax; %eax = str = input
 8048b85:	89 04 24             	mov    %eax,(%esp); (%esp) = str
 8048b88:	e8 4e 07 00 00       	call   80492db <read_six_numbers>
```

首先调用 `read_six_numbers` 函数，分析 `%esp` 可以了解到它有两个参数，第一个参数是 `phase_2` 传入的字符串，第二个参数在此处暂时无法确定（暂且记作数组 `arr` ），但肯定是用于存放至少 6 个整数的。

### block 2

```x86asm
 ; if (arr[0] != 1)
 8048b8d:	83 7c 24 18 01       	cmpl   $0x1,0x18(%esp)
 8048b92:	74 05                	je     8048b99 <phase_2+0x25>
 ;   explode_bomb()
 8048b94:	e8 0d 06 00 00       	call   80491a6 <explode_bomb>
```

第二块判断第一个整数是否为 `1`，若 `false` 则 `explode_bomb`。

### block 3

```x86asm
 ; for (p = arr + 1; p != arr + 6; p++)
 8048b99:	8d 5c 24 1c          	lea    0x1c(%esp),%ebx; %ebx = arr + 1
 8048b9d:	8d 74 24 30          	lea    0x30(%esp),%esi; %esi = arr + 6
 ;   if (*(p - 1) + *(p - 1) != *p)
 8048ba1:	8b 43 fc             	mov    -0x4(%ebx),%eax; %eax = *(p - 1)
 8048ba4:	01 c0                	add    %eax,%eax; %eax = *(p - 1) + *(p - 1)
 8048ba6:	39 03                	cmp    %eax,(%ebx)
 8048ba8:	74 05                	je     8048baf <phase_2+0x3b>
 ;     explode_bomb()
 8048baa:	e8 f7 05 00 00       	call   80491a6 <explode_bomb>

 8048baf:	83 c3 04             	add    $0x4,%ebx
 8048bb2:	39 f3                	cmp    %esi,%ebx
 8048bb4:	75 eb                	jne    8048ba1 <phase_2+0x2d>
 ; loop for
 
 8048bb6:	83 c4 34             	add    $0x34,%esp
 8048bb9:	5b                   	pop    %ebx
 8048bba:	5e                   	pop    %esi
 8048bbb:	c3                   	ret
```

* 第三块首先将 `0x1c(%esp)` 和 `0x30(%esp)` 分别存入了 `%ebx` 和 `%esi`。 `0x1c(%esp)` 是 `arr[1]` 的地址，`0x30(%esp)` 是 `arr[6]` 的地址
* 之后比较地址 `%ebx - 4` 中的值与地址 `%ebx` 中的值（即比较 `arr[i]` 与 `arr[i-1]` ），若 `arr[i-1] + arr[i-1] != arr[i]` 则 `explode_bomb`
* 最后进行迭代循环，结束之后 `return`

总体分析，则第三块代码实现的功能就是判断 `arr` 中后一个元素是否是前一个元素的两倍，同时第二块代码中保证了 `arr[0]` 为 `1`，所以可以得出答案为 `1 2 4 8 16 32`。

### code

`arr` 为何是 `unsigned` 而不是 `int` 在之后的 phase 中会得到体现。

```c
void read_six_numbers(char* str, unsigned arr[])
{
    if (sscanf(str, "%d %d %d %d %d %d", arr, arr + 1, arr + 2, arr + 3, arr + 4, arr + 5) <= 5)
        explode_bomb();
}

void phase_2(char* str)
{
    unsigned arr[6];
    int* p;
    read_six_numbers(str, arr);
    if (arr[0] != 1)
        explode_bomb();
    for (p = arr + 1; p != arr + 6; p++)
        if (*(p - 1) + *(p - 1) != *p)
            explode_bomb();
}
```

## phase_3

> `phase_3` 的主体是一个 `switch...case` 结构

### block 1

```x86asm
08048bbc <phase_3>:
 8048bbc:	83 ec 3c             	sub    $0x3c,%esp

 ; sscanf(char* str, "%d %c %d", unsigned* pvar1, char* pvar2, int* pvar3)
 8048bbf:	8d 44 24 28          	lea    0x28(%esp),%eax; %eax = &var3
 8048bc3:	89 44 24 10          	mov    %eax,0x10(%esp); pvar3 = &var3
 8048bc7:	8d 44 24 2f          	lea    0x2f(%esp),%eax; %eax = &var2
 8048bcb:	89 44 24 0c          	mov    %eax,0xc(%esp); pvar2 = &var2
 8048bcf:	8d 44 24 24          	lea    0x24(%esp),%eax; %eax = &var1
 8048bd3:	89 44 24 08          	mov    %eax,0x8(%esp); pvar1 = &var1
 8048bd7:	c7 44 24 04 ba a2 04 	movl   $0x804a2ba,0x4(%esp); "%d %c %d"
 8048bde:	08
 8048bdf:	8b 44 24 40          	mov    0x40(%esp),%eax
 8048be3:	89 04 24             	mov    %eax,(%esp)
 8048be6:	e8 85 fc ff ff       	call   8048870 <__isoc99_sscanf@plt>

 ; if (sscanf(/**/) <= 2)
 8048beb:	83 f8 02             	cmp    $0x2,%eax
 8048bee:	7f 05                	jg     8048bf5 <phase_3+0x39>
 ;   explode_bomb()
 8048bf0:	e8 b1 05 00 00       	call   80491a6 <explode_bomb>
```

第一块调用 `sscanf` 函数，传入 5 个参数，分别是：

1. `char*`: `phase_3` 的参数
2. `char*`: `"%d %c %d"`
3. `unsigned`: `var1`
4. `char`: `var2`
5. `int`: `var3`

读取完之后检查读取成功的个数，说明 `phase_3` 应当输入 2 个整数和 1 个字符。

**之后的代码中分析可得第三个参数必须为 `unsigned`**

### block 2

```x86asm
 ; if (var1 <= 7)
 8048bf5:	83 7c 24 24 07       	cmpl   $0x7,0x24(%esp)
 8048bfa:	0f 87 f9 00 00 00    	ja     8048cf9 <phase_3+0x13d>

 ;   switch (var1)
 8048c00:	8b 44 24 24          	mov    0x24(%esp),%eax; %eax = var1
 8048c04:	ff 24 85 e0 a2 04 08 	jmp    *0x804a2e0(,%eax,4); *(0x08048c0b + 4 * var1)

 ;   case 0
 ;     if (var3 != 488)
 8048c0b:	b8 75 00 00 00       	mov    $0x75,%eax; %eax = 'u'
 8048c10:	81 7c 24 28 e8 01 00 	cmpl   $0x1e8,0x28(%esp)
 8048c17:	00
 8048c18:	0f 84 e5 00 00 00    	je     8048d03 <phase_3+0x147>
 8048c1e:	e8 83 05 00 00       	call   80491a6 <explode_bomb>
 8048c23:	b8 75 00 00 00       	mov    $0x75,%eax; %eax = 'u'
 8048c28:	e9 d6 00 00 00       	jmp    8048d03 <phase_3+0x147>

 ;   case 1
 ;     if (var3 != 341)
 8048c2d:	b8 78 00 00 00       	mov    $0x78,%eax; %eax = 'x'
 8048c32:	81 7c 24 28 55 01 00 	cmpl   $0x155,0x28(%esp)
 8048c39:	00
 8048c3a:	0f 84 c3 00 00 00    	je     8048d03 <phase_3+0x147>
 8048c40:	e8 61 05 00 00       	call   80491a6 <explode_bomb>
 8048c45:	b8 78 00 00 00       	mov    $0x78,%eax; %eax = 'x'
 8048c4a:	e9 b4 00 00 00       	jmp    8048d03 <phase_3+0x147>

 ;   case 2
 ;     if (var3 != 868)
 8048c4f:	b8 70 00 00 00       	mov    $0x70,%eax; %eax = 'p'
 8048c54:	81 7c 24 28 64 03 00 	cmpl   $0x364,0x28(%esp)
 8048c5b:	00
 8048c5c:	0f 84 a1 00 00 00    	je     8048d03 <phase_3+0x147>
 8048c62:	e8 3f 05 00 00       	call   80491a6 <explode_bomb>
 8048c67:	b8 70 00 00 00       	mov    $0x70,%eax; %eax = 'p'
 8048c6c:	e9 92 00 00 00       	jmp    8048d03 <phase_3+0x147>

 ;   case 3
 ;     if (var3 != 103)
 8048c71:	b8 62 00 00 00       	mov    $0x62,%eax; %eax = 'b'
 8048c76:	83 7c 24 28 67       	cmpl   $0x67,0x28(%esp)
 8048c7b:	0f 84 82 00 00 00    	je     8048d03 <phase_3+0x147>
 8048c81:	e8 20 05 00 00       	call   80491a6 <explode_bomb>
 8048c86:	b8 62 00 00 00       	mov    $0x62,%eax; %eax = 'b'
 8048c8b:	eb 76                	jmp    8048d03 <phase_3+0x147>

 ;   case 4
 ;     if (var3 != 805)
 8048c8d:	b8 63 00 00 00       	mov    $0x63,%eax; %eax = 'c'
 8048c92:	81 7c 24 28 25 03 00 	cmpl   $0x325,0x28(%esp)
 8048c99:	00
 8048c9a:	74 67                	je     8048d03 <phase_3+0x147>
 8048c9c:	e8 05 05 00 00       	call   80491a6 <explode_bomb>
 8048ca1:	b8 63 00 00 00       	mov    $0x63,%eax; %eax = 'c'
 8048ca6:	eb 5b                	jmp    8048d03 <phase_3+0x147>

 ;   case 5
 ;     if (var3 != 968)
 8048ca8:	b8 70 00 00 00       	mov    $0x70,%eax; %eax = 'p'
 8048cad:	81 7c 24 28 c8 03 00 	cmpl   $0x3c8,0x28(%esp)
 8048cb4:	00
 8048cb5:	74 4c                	je     8048d03 <phase_3+0x147>
 8048cb7:	e8 ea 04 00 00       	call   80491a6 <explode_bomb>
 8048cbc:	b8 70 00 00 00       	mov    $0x70,%eax; %eax = 'p'
 8048cc1:	eb 40                	jmp    8048d03 <phase_3+0x147>

 ;   case 6
 ;     if (var3 != 372)
 8048cc3:	b8 67 00 00 00       	mov    $0x67,%eax; %eax = 'g'
 8048cc8:	81 7c 24 28 74 01 00 	cmpl   $0x174,0x28(%esp)
 8048ccf:	00
 8048cd0:	74 31                	je     8048d03 <phase_3+0x147>
 8048cd2:	e8 cf 04 00 00       	call   80491a6 <explode_bomb>
 8048cd7:	b8 67 00 00 00       	mov    $0x67,%eax; %eax = 'g'
 8048cdc:	eb 25                	jmp    8048d03 <phase_3+0x147>

 ;   case 7
 ;     if (var3 != 633)
 8048cde:	b8 61 00 00 00       	mov    $0x61,%eax; %eax = 'a'
 8048ce3:	81 7c 24 28 79 02 00 	cmpl   $0x279,0x28(%esp)
 8048cea:	00
 8048ceb:	74 16                	je     8048d03 <phase_3+0x147>
 8048ced:	e8 b4 04 00 00       	call   80491a6 <explode_bomb>
 8048cf2:	b8 61 00 00 00       	mov    $0x61,%eax; %eax = 'a'
 8048cf7:	eb 0a                	jmp    8048d03 <phase_3+0x147>

 ; explode_bomb()
 8048cf9:	e8 a8 04 00 00       	call   80491a6 <explode_bomb>
 8048cfe:	b8 6a 00 00 00       	mov    $0x6a,%eax
```

第二块有大量的重复指令，简单分析可得是一个 `switch...case` 结构。

首先保证 `var1` 不大于 `7`，之后根据 `var1` 的值去内存中取值进行跳转：

```x86asm
 804a2df:	00 0b                	add    %cl,(%ebx)
 804a2e1:	8c 04 08             	mov    %es,(%eax,%ecx,1)
 804a2e4:	2d 8c 04 08 4f       	sub    $0x4f08048c,%eax
 804a2e9:	8c 04 08             	mov    %es,(%eax,%ecx,1)
 804a2ec:	71 8c                	jno    804a27a <_IO_stdin_used+0x156>
 804a2ee:	04 08                	add    $0x8,%al
 804a2f0:	8d 8c 04 08 a8 8c 04 	lea    0x48ca808(%esp,%eax,1),%ecx
 804a2f7:	08 c3                	or     %al,%bl
 804a2f9:	8c 04 08             	mov    %es,(%eax,%ecx,1)
 804a2fc:	de 8c 04 08 0a 00 00 	fimul  0xa08(%esp,%eax,1)
```

总共 8 种跳转情况，要求 `var1` 的值必须为 `0-7`，但最开始时只检查了 `var1` 是否小于 `7`，而如果要保证程序能正常运行，则需要满足 `var1` 不能为负值，所以 `var1` 应当为 `unsigned`，以确保其值的范围在 `0-7`。

由于各个 `case` 的结构相同，区别只有值，故只分析 `case 0`：将字面值 `75` ( 字符 `'u'` ) 存入 `%eax`，之后比较字面值 `0x1e8` 与 `var3`，若不相同则 `explode_bomb`，相同则 `break`。

所以我们输入的第三个整数应当与第一个整数相关。

### block 3

```x86asm
 ; if (var2 == %al)
 8048d03:	3a 44 24 2f          	cmp    0x2f(%esp),%al
 8048d07:	74 05                	je     8048d0e <phase_3+0x152>
 ;   explode_bomb()
 8048d09:	e8 98 04 00 00       	call   80491a6 <explode_bomb>

 8048d0e:	83 c4 3c             	add    $0x3c,%esp
 8048d11:	c3                   	ret
```

比较 `var2` 与 block 3 中存入 `%eax` 的值，若不同则 `explode_bomb`，若相同则 `return`，说明输入的字符应当与第一个整数相关。

总体分析，可以发现输入的字符和第三个整数都与第一个整数相关，根据 `var1` 的不同可以有 7 种答案：`{ "0 u 488", "1 x 341", "2 p 868", "3 b 103", "4 c 805", "5 p 968", "6 g 372", "7 a 633" }`。

### code

如果寄存器够用，则变量不会写入内存。

```c
void phase_3(char* str)
{
    unsigned var1;
    int var3;
    char var2, ans;
    if (sscanf(str, "%d %c %d", &var1, &var2, &var3) <= 2)
        explode_bomb();
    switch (var1) {
    case 0:
        ans = 'u';
        if (var3 != 488)
            explode_bomb();
        break;
    case 1:
        ans = 'x';
        if (var3 != 341)
            explode_bomb();
        break;
    case 2:
        ans = 'p';
        if (var3 != 868)
            explode_bomb();
        break;
    case 3:
        ans = 'b';
        if (var3 != 103)
            explode_bomb();
        break;
    case 4:
        ans = 'c';
        if (var3 != 805)
            explode_bomb();
        break;
    case 5:
        ans = 'p';
        if (var3 != 968)
            explode_bomb();
        break;
    case 6:
        ans = 'g';
        if (var3 != 372)
            explode_bomb();
        break;
    case 7:
        ans = 'a';
        if (var3 != 633)
            explode_bomb();
        break;
    default:
        ans = 'j';
        explode_bomb();
    }
    if (var2 != ans)
        explode_bomb();
}
```

## phase_4

> `phase_4` 的主体是一个递归函数 `func4` 的调用

### block 1

```x86asm
08048d7f <phase_4>:
 8048d7f:	83 ec 2c             	sub    $0x2c,%esp

 ; sscanf(char* str, "%d %d", int* pvar1, int* pvar2)
 8048d82:	8d 44 24 1c          	lea    0x1c(%esp),%eax; %eax = &var2
 8048d86:	89 44 24 0c          	mov    %eax,0xc(%esp); pvar1 = &var2
 8048d8a:	8d 44 24 18          	lea    0x18(%esp),%eax; %eax = &var1
 8048d8e:	89 44 24 08          	mov    %eax,0x8(%esp); pvar2 = &var1
 8048d92:	c7 44 24 04 a3 a4 04 	movl   $0x804a4a3,0x4(%esp); "%d %d"
 8048d99:	08
 8048d9a:	8b 44 24 30          	mov    0x30(%esp),%eax; %eax = str
 8048d9e:	89 04 24             	mov    %eax,(%esp); (%esp) = str
 8048da1:	e8 ca fa ff ff       	call   8048870 <__isoc99_sscanf@plt>
```

第一块是一个与 `phase_3` 中类似的 `sscanf`，相比之下只读取了两个整数。

### block 2

```x86asm
 ; if (sscanf(/**/) == 2 && var1 >= 0 && var1 <= 14)
 ; if (sscanf(/**/) == 2)
 8048da6:	83 f8 02             	cmp    $0x2,%eax
 8048da9:	75 0d                	jne    8048db8 <phase_4+0x39>
 ;   if (var1 >= 0)
 8048dab:	8b 44 24 18          	mov    0x18(%esp),%eax
 8048daf:	85 c0                	test   %eax,%eax
 8048db1:	78 05                	js     8048db8 <phase_4+0x39>
 ;     if (var1 <= 14)
 8048db3:	83 f8 0e             	cmp    $0xe,%eax
 8048db6:	7e 05                	jle    8048dbd <phase_4+0x3e>

 ; else
 ;   explode_bomb()
 8048db8:	e8 e9 03 00 00       	call   80491a6 <explode_bomb>
```

第二块是对 `var1` 的一个检测，要求 `var1` 在范围 `0-14` 之间。

### block 3

```x86asm
 ; func4(var1 , 0, 14)
 8048dbd:	c7 44 24 08 0e 00 00 	movl   $0xe,0x8(%esp)
 8048dc4:	00
 8048dc5:	c7 44 24 04 00 00 00 	movl   $0x0,0x4(%esp)
 8048dcc:	00
 8048dcd:	8b 44 24 18          	mov    0x18(%esp),%eax
 8048dd1:	89 04 24             	mov    %eax,(%esp)
 8048dd4:	e8 39 ff ff ff       	call   8048d12 <func4>
```

第三块调用了函数 `func4`，传入了三个参数：

1. `int`: 变量 `var1`
2. `int`: 字面值 `0`
3. `int`: 字面值 `14`

### block 4

```x86asm
 ; if (func4(/**/) == 4 && var2 == 4)
 ; if (func4 == 4)
 8048dd9:	83 f8 04             	cmp    $0x4,%eax
 8048ddc:	75 07                	jne    8048de5 <phase_4+0x66>
 ;   if (var2 == 4)
 8048dde:	83 7c 24 1c 04       	cmpl   $0x4,0x1c(%esp)
 8048de3:	74 05                	je     8048dea <phase_4+0x6b>

 ; explode_bomb()
 8048de5:	e8 bc 03 00 00       	call   80491a6 <explode_bomb>
 8048dea:	83 c4 2c             	add    $0x2c,%esp
 8048ded:	c3                   	ret
```

第四块是对 `func4` 函数的返回值和变量 `var2` 的检测，要求两者都为 `4`。

总体分析，`phase_4` 类似 `phase_1`，主体是对一个函数的调用与返回值检测，但是 `phase_4` 中的函数是一个递归调用的函数，在下一节中我们具体分析 `func4` 这个递归函数。

### code

```c
void phase_4(char* str)
{
    int var1, var2;
    if (sscanf(str, "%d %d", &var1, &var2) == 2 && var1 >= 0 && var1 <= 14)
        if (func4(var1, 0, 14) == 4 && var2 == 4)
            return;
    explode_bomb();
}
```

## func4

> `func4` 的主体是一个 `if...else` 分支结构，进行递归调用的判断

### block 1

```x86asm
 ; func4(int var1, int var2, int var3)
08048d12 <func4>:
 8048d12:	83 ec 1c             	sub    $0x1c,%esp

 ; initial
 8048d15:	89 5c 24 14          	mov    %ebx,0x14(%esp)
 8048d19:	89 74 24 18          	mov    %esi,0x18(%esp)
 8048d1d:	8b 54 24 20          	mov    0x20(%esp),%edx; %edx = var1
 8048d21:	8b 44 24 24          	mov    0x24(%esp),%eax; %eax = var2
 8048d25:	8b 5c 24 28          	mov    0x28(%esp),%ebx; %ebx = var3
 8048d29:	89 d9                	mov    %ebx,%ecx; %ecx = var3
```

第一块是一个初始化，腾出了 `%ebx` 和 `%esi` 两个寄存器，并将参数存入了寄存器。

### block 2

```x86asm
 ; %ecx = (var3 - var2) / 2 + var2
 8048d2b:	29 c1                	sub    %eax,%ecx; %ecx = var3 - var2
 8048d2d:	89 ce                	mov    %ecx,%esi; %esi = var3 - var2
 8048d2f:	c1 ee 1f             	shr    $0x1f,%esi; %esi = (unsigned)(var3 - var2) >> 31
 ;   %ecx = var3 - var2 + (unsigned)(var3 - var2) >> 31
 8048d32:	01 f1                	add    %esi,%ecx
 ;   %ecx = (int)(var3 - var2 + (unsigned)(var3 - var2) >> 31) >> 1
 8048d34:	d1 f9                	sar    %ecx
 ;   %ecx = (int)(var3 - var2 + (unsigned)(var3 - var2) >> 31) >> 1 + var2
 8048d36:	01 c1                	add    %eax,%ecx
```

第三块是几条运算指令，逐步分析得到一个表达式 `(int)(var3 - var2 + (unsigned)(var3 - var2) >> 31) >> 1 + var2`，如果熟悉的话很快就能反应过来前面的是一个除法，简化之后的表达式为 `(var3 - var2) / 2 + var2`，当然可以进一步简化为 `(var2 + var3) / 2`，运算的结果都是相同的。

### block 3

```x86asm
 ; if ((var3 - var2) / 2 + var2 > var1)
 8048d38:	39 d1                	cmp    %edx,%ecx
 8048d3a:	7e 17                	jle    8048d53 <func4+0x41>
 ;   return func4(var1, var2, (var3 - var2) / 2 + var2 - 1) * 2
 8048d3c:	83 e9 01             	sub    $0x1,%ecx; %ecx = (var3 - var2) / 2 + var2 - 1
 8048d3f:	89 4c 24 08          	mov    %ecx,0x8(%esp); 0x8(%esp) = (var3 - var2) / 2 + var2 - 1
 8048d43:	89 44 24 04          	mov    %eax,0x4(%esp); 0x4(%esp) = var2
 8048d47:	89 14 24             	mov    %edx,(%esp); (%esp) = var1
 8048d4a:	e8 c3 ff ff ff       	call   8048d12 <func4>
 8048d4f:	01 c0                	add    %eax,%eax; %eax = func4 * 2
 8048d51:	eb 20                	jmp    8048d73 <func4+0x61>

 ; else
 ;   return 0
 8048d53:	b8 00 00 00 00       	mov    $0x0,%eax; %eax = 0

 ; else if ((var3 - var2) / 2 + var2 < var1)
 8048d58:	39 d1                	cmp    %edx,%ecx
 8048d5a:	7d 17                	jge    8048d73 <func4+0x61>
 ;   return func4(var1, (var3 - var2) / 2 + var2 + 1, var3) * 2 + 1
 8048d5c:	89 5c 24 08          	mov    %ebx,0x8(%esp); 0x8(%esp) = var3
 8048d60:	83 c1 01             	add    $0x1,%ecx; %ecx = (var3 - var2) / 2 + var2 + 1
 8048d63:	89 4c 24 04          	mov    %ecx,0x4(%esp); 0x4(%esp) = (var3 - var2) / 2 + var2 + 1
 8048d67:	89 14 24             	mov    %edx,(%esp); (%esp) = var1
 8048d6a:	e8 a3 ff ff ff       	call   8048d12 <func4>
 8048d6f:	8d 44 00 01          	lea    0x1(%eax,%eax,1),%eax; %eax = func4 * 2 + 1

 8048d73:	8b 5c 24 14          	mov    0x14(%esp),%ebx
 8048d77:	8b 74 24 18          	mov    0x18(%esp),%esi
 8048d7b:	83 c4 1c             	add    $0x1c,%esp
 8048d7e:	c3                   	ret
```

第三块是对递归调用的判断，结构并不复杂，很快就能分析出来，接下来要做的就是找合适的输入使它的返回值为 `4`。

### code

```c
// int func4(int var1, int var2, int var3)
// {
//     if ((var2 + var3) / 2 > var1)
//         return func4(var1, var2, (var2 + var3) / 2 - 1) * 2;
//     else if ((var2 + var3) / 2 < var1)
//         return func4(var1, (var2 + var3) / 2 + 1, var3) * 2 + 1;
//     else
//         return 0;
// }

int func4(int var1, int var2, int var3)
{
    if ((var3 - var2) / 2 + var2 > var1)
        return func4(var1, var2, (var3 - var2) / 2 + var2 - 1) * 2;
    else if ((var3 - var2) / 2 + var2 < var1)
        return func4(var1, (var3 - var2) / 2 + var2 + 1, var3) * 2 + 1;
    else
        return 0;
}
```

#### 代入法

一种取巧的解法，只需要实现 `func4`，然后将所有可能的输入代入计算即可。由于只有 15 种情况，所以手算也是可行的，这里不作过多介绍了。

#### 分析法

`func4` 的分支共有 3 条：

1. `func4 * 2`
2. `func4 * 2 + 1`
3. `0`

终止条件是 `(var2 + var3) / 2 == var1`。

想要得到 `4`，至少需要 1 次 `+1`，否则无论如何计算结果都只能为 `0`。而经过简单的推导，我们发现前 2 次为 `+1` 不可能计算出 `4`，因为前 2 次为 `+1` 的解集为 ${3,6,12,...}$，不包含 `4`，所以结果只能是 1 次 `+1` 与 2 次 `*2`。

列公式如下

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2550 44557.4 4600" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style=""><defs><path id="MJX-24-TEX-S4-23A7" d="M712 899L718 893V876V865Q718 854 704 846Q627 793 577 710T510 525Q510 524 509 521Q505 493 504 349Q504 345 504 334Q504 277 504 240Q504 -2 503 -4Q502 -8 494 -9T444 -10Q392 -10 390 -9Q387 -8 386 -5Q384 5 384 230Q384 262 384 312T383 382Q383 481 392 535T434 656Q510 806 664 892L677 899H712Z"></path><path id="MJX-24-TEX-S4-23A9" d="M718 -893L712 -899H677L666 -893Q542 -825 468 -714T385 -476Q384 -466 384 -282Q384 3 385 5L389 9Q392 10 444 10Q486 10 494 9T503 4Q504 2 504 -239V-310V-366Q504 -470 508 -513T530 -609Q546 -657 569 -698T617 -767T661 -812T699 -843T717 -856T718 -876V-893Z"></path><path id="MJX-24-TEX-S4-23A8" d="M389 1159Q391 1160 455 1160Q496 1160 498 1159Q501 1158 502 1155Q504 1145 504 924Q504 691 503 682Q494 549 425 439T243 259L229 250L243 241Q349 175 421 66T503 -182Q504 -191 504 -424Q504 -600 504 -629T499 -659H498Q496 -660 444 -660T390 -659Q387 -658 386 -655Q384 -645 384 -425V-282Q384 -176 377 -116T342 10Q325 54 301 92T255 155T214 196T183 222T171 232Q170 233 170 250T171 268Q171 269 191 284T240 331T300 407T354 524T383 679Q384 691 384 925Q384 1152 385 1155L389 1159Z"></path><path id="MJX-24-TEX-S4-23AA" d="M384 150V266Q384 304 389 309Q391 310 455 310Q496 310 498 309Q502 308 503 298Q504 283 504 150Q504 32 504 12T499 -9H498Q496 -10 444 -10T390 -9Q386 -8 385 2Q384 17 384 150Z"></path><path id="MJX-24-TEX-N-28" d="M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z"></path><path id="MJX-24-TEX-I-1D463" d="M173 380Q173 405 154 405Q130 405 104 376T61 287Q60 286 59 284T58 281T56 279T53 278T49 278T41 278H27Q21 284 21 287Q21 294 29 316T53 368T97 419T160 441Q202 441 225 417T249 361Q249 344 246 335Q246 329 231 291T200 202T182 113Q182 86 187 69Q200 26 250 26Q287 26 319 60T369 139T398 222T409 277Q409 300 401 317T383 343T365 361T357 383Q357 405 376 424T417 443Q436 443 451 425T467 367Q467 340 455 284T418 159T347 40T241 -11Q177 -11 139 22Q102 54 102 117Q102 148 110 181T151 298Q173 362 173 380Z"></path><path id="MJX-24-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path><path id="MJX-24-TEX-I-1D45F" d="M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q161 442 183 430T214 408T225 388Q227 382 228 382T236 389Q284 441 347 441H350Q398 441 422 400Q430 381 430 363Q430 333 417 315T391 292T366 288Q346 288 334 299T322 328Q322 376 378 392Q356 405 342 405Q286 405 239 331Q229 315 224 298T190 165Q156 25 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-24-TEX-N-32" d="M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z"></path><path id="MJX-24-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-24-TEX-N-33" d="M127 463Q100 463 85 480T69 524Q69 579 117 622T233 665Q268 665 277 664Q351 652 390 611T430 522Q430 470 396 421T302 350L299 348Q299 347 308 345T337 336T375 315Q457 262 457 175Q457 96 395 37T238 -22Q158 -22 100 21T42 130Q42 158 60 175T105 193Q133 193 151 175T169 130Q169 119 166 110T159 94T148 82T136 74T126 70T118 67L114 66Q165 21 238 21Q293 21 321 74Q338 107 338 175V195Q338 290 274 322Q259 328 213 329L171 330L168 332Q166 335 166 348Q166 366 174 366Q202 366 232 371Q266 376 294 413T322 525V533Q322 590 287 612Q265 626 240 626Q208 626 181 615T143 592T132 580H135Q138 579 143 578T153 573T165 566T175 555T183 540T186 520Q186 498 172 481T127 463Z"></path><path id="MJX-24-TEX-N-29" d="M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z"></path><path id="MJX-24-TEX-N-2F" d="M423 750Q432 750 438 744T444 730Q444 725 271 248T92 -240Q85 -250 75 -250Q68 -250 62 -245T56 -231Q56 -221 230 257T407 740Q411 750 423 750Z"></path><path id="MJX-24-TEX-N-3E" d="M84 520Q84 528 88 533T96 539L99 540Q106 540 253 471T544 334L687 265Q694 260 694 250T687 235Q685 233 395 96L107 -40H101Q83 -38 83 -20Q83 -19 83 -17Q82 -10 98 -1Q117 9 248 71Q326 108 378 132L626 250L378 368Q90 504 86 509Q84 513 84 520Z"></path><path id="MJX-24-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-24-TEX-N-5B" d="M118 -250V750H255V710H158V-210H255V-250H118Z"></path><path id="MJX-24-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path><path id="MJX-24-TEX-N-5D" d="M22 710V750H159V-250H22V-210H119V710H22Z"></path><path id="MJX-24-TEX-N-7B" d="M434 -231Q434 -244 428 -250H410Q281 -250 230 -184Q225 -177 222 -172T217 -161T213 -148T211 -133T210 -111T209 -84T209 -47T209 0Q209 21 209 53Q208 142 204 153Q203 154 203 155Q189 191 153 211T82 231Q71 231 68 234T65 250T68 266T82 269Q116 269 152 289T203 345Q208 356 208 377T209 529V579Q209 634 215 656T244 698Q270 724 324 740Q361 748 377 749Q379 749 390 749T408 750H428Q434 744 434 732Q434 719 431 716Q429 713 415 713Q362 710 332 689T296 647Q291 634 291 499V417Q291 370 288 353T271 314Q240 271 184 255L170 250L184 245Q202 239 220 230T262 196T290 137Q291 131 291 1Q291 -134 296 -147Q306 -174 339 -192T415 -213Q429 -213 431 -216Q434 -219 434 -231Z"></path><path id="MJX-24-TEX-N-7D" d="M65 731Q65 745 68 747T88 750Q171 750 216 725T279 670Q288 649 289 635T291 501Q292 362 293 357Q306 312 345 291T417 269Q428 269 431 266T434 250T431 234T417 231Q380 231 345 210T298 157Q293 143 292 121T291 -28V-79Q291 -134 285 -156T256 -198Q202 -250 89 -250Q71 -250 68 -247T65 -230Q65 -224 65 -223T66 -218T69 -214T77 -213Q91 -213 108 -210T146 -200T183 -177T207 -139Q208 -134 209 3L210 139Q223 196 280 230Q315 247 330 250Q305 257 280 270Q225 304 212 352L210 362L209 498Q208 635 207 640Q195 680 154 696T77 713Q68 713 67 716T65 731Z"></path><path id="MJX-24-TEX-N-3C" d="M694 -11T694 -19T688 -33T678 -40Q671 -40 524 29T234 166L90 235Q83 240 83 250Q83 261 91 266Q664 540 678 540Q681 540 687 534T694 519T687 505Q686 504 417 376L151 250L417 124Q686 -4 687 -5Q694 -11 694 -19Z"></path><path id="MJX-24-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mrow"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-S4-23A7" transform="translate(0, 1651)"></use><use xlink:href="#MJX-24-TEX-S4-23A9" transform="translate(0, -1151)"></use><use xlink:href="#MJX-24-TEX-S4-23A8" transform="translate(0, 0)"></use><svg width="889" height="681" y="1060" x="0" viewBox="0 120 889 681"><use xlink:href="#MJX-24-TEX-S4-23AA" transform="scale(1, 3.349)"></use></svg><svg width="889" height="681" y="-1241" x="0" viewBox="0 120 889 681"><use xlink:href="#MJX-24-TEX-S4-23AA" transform="scale(1, 3.349)"></use></svg></g><g data-mml-node="mtable" transform="translate(889, 0)"><g data-mml-node="mtr" transform="translate(0, 1800)"><g data-mml-node="mtd"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(389, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(874, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(1403, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(1854, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(2576.2, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(3576.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(4061.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(4590.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(5041.4, 0)"><use xlink:href="#MJX-24-TEX-N-33"></use></g><g data-mml-node="mo" transform="translate(5541.4, 0)"><use xlink:href="#MJX-24-TEX-N-29"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(5930.4, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(6430.4, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(7208.2, 0)"><use xlink:href="#MJX-24-TEX-N-3E"></use></g><g data-mml-node="mi" transform="translate(8264, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(8749, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(9278, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(9729, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g></g></g><g data-mml-node="mtr" transform="translate(0, 600)"><g data-mml-node="mtd"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-5B"></use></g><g data-mml-node="mi" transform="translate(278, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(763, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(1292, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(1743, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(2465.2, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(3465.4, 0)"><use xlink:href="#MJX-24-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(3854.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(4339.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(4868.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(5319.4, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(6041.7, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(7041.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(7526.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(8055.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(8506.9, 0)"><use xlink:href="#MJX-24-TEX-N-33"></use></g><g data-mml-node="mo" transform="translate(9006.9, 0)"><use xlink:href="#MJX-24-TEX-N-29"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(9395.9, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(9895.9, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(10618.1, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(11618.3, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(12118.3, 0)"><use xlink:href="#MJX-24-TEX-N-5D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(12396.3, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(12896.3, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(13674.1, 0)"><use xlink:href="#MJX-24-TEX-N-3E"></use></g><g data-mml-node="mi" transform="translate(14729.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(15214.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(15743.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(16194.9, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g></g></g><g data-mml-node="mtr" transform="translate(0, -600)"><g data-mml-node="mtd"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-7B"></use></g><g data-mml-node="mi" transform="translate(500, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(985, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(1514, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(1965, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(2687.2, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(3687.4, 0)"><use xlink:href="#MJX-24-TEX-N-5B"></use></g><g data-mml-node="mi" transform="translate(3965.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(4450.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(4979.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(5430.4, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(6152.7, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(7152.9, 0)"><use xlink:href="#MJX-24-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(7541.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(8026.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(8555.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(9006.9, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(9729.1, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(10729.3, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(11214.3, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(11743.3, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(12194.3, 0)"><use xlink:href="#MJX-24-TEX-N-33"></use></g><g data-mml-node="mo" transform="translate(12694.3, 0)"><use xlink:href="#MJX-24-TEX-N-29"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(13083.3, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(13583.3, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(14305.6, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(15305.8, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(15805.8, 0)"><use xlink:href="#MJX-24-TEX-N-5D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(16083.8, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(16583.8, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(17306, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(18306.2, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(18806.2, 0)"><use xlink:href="#MJX-24-TEX-N-7D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(19306.2, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(19806.2, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(20584, 0)"><use xlink:href="#MJX-24-TEX-N-3C"></use></g><g data-mml-node="mi" transform="translate(21639.8, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(22124.8, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(22653.8, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(23104.8, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g></g></g><g data-mml-node="mtr" transform="translate(0, -1800)"><g data-mml-node="mtd"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-7B"></use></g><g data-mml-node="mo" transform="translate(500, 0)"><use xlink:href="#MJX-24-TEX-N-7B"></use></g><g data-mml-node="mi" transform="translate(1000, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(1485, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(2014, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(2465, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(3187.2, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(4187.4, 0)"><use xlink:href="#MJX-24-TEX-N-5B"></use></g><g data-mml-node="mi" transform="translate(4465.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(4950.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(5479.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(5930.4, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(6652.7, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(7652.9, 0)"><use xlink:href="#MJX-24-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(8041.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(8526.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(9055.9, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(9506.9, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(10229.1, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(11229.3, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(11714.3, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(12243.3, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(12694.3, 0)"><use xlink:href="#MJX-24-TEX-N-33"></use></g><g data-mml-node="mo" transform="translate(13194.3, 0)"><use xlink:href="#MJX-24-TEX-N-29"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(13583.3, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(14083.3, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(14805.6, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(15805.8, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(16305.8, 0)"><use xlink:href="#MJX-24-TEX-N-5D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(16583.8, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(17083.8, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(17806, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(18806.2, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(19306.2, 0)"><use xlink:href="#MJX-24-TEX-N-7D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(19806.2, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(20306.2, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(21028.4, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mn" transform="translate(22028.7, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(22750.9, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(23751.1, 0)"><use xlink:href="#MJX-24-TEX-N-5B"></use></g><g data-mml-node="mi" transform="translate(24029.1, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(24514.1, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(25043.1, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(25494.1, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(26216.3, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mo" transform="translate(27216.6, 0)"><use xlink:href="#MJX-24-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(27605.6, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(28090.6, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(28619.6, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(29070.6, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(29792.8, 0)"><use xlink:href="#MJX-24-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(30793, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(31278, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(31807, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(32258, 0)"><use xlink:href="#MJX-24-TEX-N-33"></use></g><g data-mml-node="mo" transform="translate(32758, 0)"><use xlink:href="#MJX-24-TEX-N-29"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(33147, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(33647, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(34369.2, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(35369.4, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(35869.4, 0)"><use xlink:href="#MJX-24-TEX-N-5D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(36147.4, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(36647.4, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(37369.7, 0)"><use xlink:href="#MJX-24-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(38369.9, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(38869.9, 0)"><use xlink:href="#MJX-24-TEX-N-7D"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(39369.9, 0)"><g data-mml-node="mo"><use xlink:href="#MJX-24-TEX-N-2F"></use></g></g><g data-mml-node="mn" transform="translate(39869.9, 0)"><use xlink:href="#MJX-24-TEX-N-32"></use></g><g data-mml-node="mo" transform="translate(40647.7, 0)"><use xlink:href="#MJX-24-TEX-N-3D"></use></g><g data-mml-node="mi" transform="translate(41703.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D463"></use></g><g data-mml-node="mi" transform="translate(42188.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D44E"></use></g><g data-mml-node="mi" transform="translate(42717.4, 0)"><use xlink:href="#MJX-24-TEX-I-1D45F"></use></g><g data-mml-node="mn" transform="translate(43168.4, 0)"><use xlink:href="#MJX-24-TEX-N-31"></use></g></g></g></g><g data-mml-node="mo" transform="translate(44557.4, 0)"></g></g></g></g></svg>

由于除法是整除，所以化简不一定能计算出精确的答案，但可以计算出一个大概的区间，然后逐个代入计算。由于情况较少，所以直接代入 $ (4) $ 式计算可能会更快。

计算结果：`0 0 4 0 2 2 6 0 1 1 5 1 3 3 7`，所以 `phase_4` 的答案为 `2 4`。

## phase_5

> `phase_5` 的主体是一个 `do...while` 的循环结构

### block 1

```x86asm
08048dee <phase_5>:
 8048dee:	83 ec 2c             	sub    $0x2c,%esp

 ; sscanf(char* str, "%d %d", int* pvar1, int* pvar2)
 8048df1:	8d 44 24 1c          	lea    0x1c(%esp),%eax; %eax = &var2
 8048df5:	89 44 24 0c          	mov    %eax,0xc(%esp); pvar1 = &var2
 8048df9:	8d 44 24 18          	lea    0x18(%esp),%eax; %eax = &var1
 8048dfd:	89 44 24 08          	mov    %eax,0x8(%esp); pvar2 = &var1
 8048e01:	c7 44 24 04 a3 a4 04 	movl   $0x804a4a3,0x4(%esp); "%d %d"
 8048e08:	08
 8048e09:	8b 44 24 30          	mov    0x30(%esp),%eax; %eax = str
 8048e0d:	89 04 24             	mov    %eax,(%esp); (%esp) = str
 8048e10:	e8 5b fa ff ff       	call   8048870 <__isoc99_sscanf@plt>
```

与 `phase_4` 完全相同的 `sscanf` 函数。

### block 2

```x86asm
 ; if (sscanf(/**/) <= 1)
 8048e15:	83 f8 01             	cmp    $0x1,%eax
 8048e18:	7f 05                	jg     8048e1f <phase_5+0x31>
 ;   explode_bomb()
 8048e1a:	e8 87 03 00 00       	call   80491a6 <explode_bomb>

 ; else
 8048e1f:	8b 44 24 18          	mov    0x18(%esp),%eax; %eax = var1
 8048e23:	83 e0 0f             	and    $0xf,%eax; %eax = var1 & 15
 8048e26:	89 44 24 18          	mov    %eax,0x18(%esp); var1 = var1 & 15
 ;   if(var1 & 15 != 15)
 8048e2a:	83 f8 0f             	cmp    $0xf,%eax
 8048e2d:	74 2a                	je     8048e59 <phase_5+0x6b>
 8048e2f:	b9 00 00 00 00       	mov    $0x0,%ecx; %ecx = 0
 8048e34:	ba 00 00 00 00       	mov    $0x0,%edx; %edx = 0
```

第二块首先对读取的结果进行检测，如果正确无误则对第一个整数 `var1` 取低 4 位，判断是否不等于 `15`，所以输入的 `var1` 只需要满足低 4 位相同就可以得到相同的计算结果。

### block 3

```x86asm
 ; int phase_5_arr[] = {10, 2, 14, 7, 8, 12, 15, 11, 0, 4, 1, 13, 3, 9, 6};
 ;     do
 8048e39:	83 c2 01             	add    $0x1,%edx; %edx = %edx + 1
 8048e3c:	8b 04 85 00 a3 04 08 	mov    0x804a300(,%eax,4),%eax; %eax = phase_5_arr[var1]
 8048e43:	01 c1                	add    %eax,%ecx; %ecx = 0 + phase_5_arr[var1]
 8048e45:	83 f8 0f             	cmp    $0xf,%eax;
 8048e48:	75 ef                	jne    8048e39 <phase_5+0x4b>
 ;     while (phase_5_arr[var1] != 15)

 8048e4a:	89 44 24 18          	mov    %eax,0x18(%esp); var1 = %eax
```

接 block 2 中的 `if(var1 & 15 != 15)`，当条件成立时进入 `do...while` 循环。

地址 `0x804a300` 应该是一个数组的首地址（博主命名为 `phase_5_arr` ），其中的元素应该为：`{10, 2, 14, 7, 8, 12, 15, 11, 0, 4, 1, 13, 3, 9, 6}`，共 15 个元素。

```x86asm
0804a300 <array.2957>:
 804a300:	0a 00                	or     (%eax),%al
 804a302:	00 00                	add    %al,(%eax)
 804a304:	02 00                	add    (%eax),%al
 804a306:	00 00                	add    %al,(%eax)
 804a308:	0e                   	push   %cs
 804a309:	00 00                	add    %al,(%eax)
 804a30b:	00 07                	add    %al,(%edi)
 804a30d:	00 00                	add    %al,(%eax)
 804a30f:	00 08                	add    %cl,(%eax)
 804a311:	00 00                	add    %al,(%eax)
 804a313:	00 0c 00             	add    %cl,(%eax,%eax,1)
 804a316:	00 00                	add    %al,(%eax)
 804a318:	0f 00 00             	sldt   (%eax)
 804a31b:	00 0b                	add    %cl,(%ebx)
 804a31d:	00 00                	add    %al,(%eax)
 804a31f:	00 00                	add    %al,(%eax)
 804a321:	00 00                	add    %al,(%eax)
 804a323:	00 04 00             	add    %al,(%eax,%eax,1)
 804a326:	00 00                	add    %al,(%eax)
 804a328:	01 00                	add    %eax,(%eax)
 804a32a:	00 00                	add    %al,(%eax)
 804a32c:	0d 00 00 00 03       	or     $0x3000000,%eax
 804a331:	00 00                	add    %al,(%eax)
 804a333:	00 09                	add    %cl,(%ecx)
 804a335:	00 00                	add    %al,(%eax)
 804a337:	00 06                	add    %al,(%esi)
 804a339:	00 00                	add    %al,(%eax)
 804a33b:	00 05 00 00 00 53    	add    %al,0x53000000
```

`%edx` 记录 `do...while` 循环执行的次数，循环体内将 `phase_5_arr` (定义为) 内的元素逐个相加并存入 `%ecx`，初始索引为输入的 `var1`，之后每次的索引是上一次循环的元素值，直到元素值为 `15` 时退出循环（`phase_5_arr` 可以看作是一个存放链表链节的数组）。

### block 4

```x86asm
 ;     if (%edx == 15)
 8048e4e:	83 fa 0f             	cmp    $0xf,%edx;
 8048e51:	75 06                	jne    8048e59 <phase_5+0x6b>
 ;       if (%ecx == var2)
 8048e53:	3b 4c 24 1c          	cmp    0x1c(%esp),%ecx
 8048e57:	74 05                	je     8048e5e <phase_5+0x70>

 ;   explode_bomb()
 8048e59:	e8 48 03 00 00       	call   80491a6 <explode_bomb>

 8048e5e:	83 c4 2c             	add    $0x2c,%esp
 8048e61:	c3                   	ret
```

首先检测循环的次数，要求循环次数为 15，而`phase_5_arr` 的元素个数就是 15，说明这 15 个链节形成了一个链表，输入的 `var1` 应当为链表的表头。

再检测累加的值是否与输入的第二个整数 `var2` 相等，要求 `var2` 与运算结果相同。

总体分析，`phase_5` 要求输入链表的表头以及各个链节的和，所以答案为 `5 115`，`0-15` 中缺失的元素为 `5`。

### code

```c
void phase_5(char* str)
{
    int var1, var2, count, sum;
    if (sscanf(str, "%d %d", &var1, &var2) <= 1)
        explode_bomb();
    var1 = var1 & 15;
    if (var1 != 15) {
        count = sum = 0;
        do {
            ++count;
            var1 = phase_5_arr[var1];
            sum += var1;
        } while (var1 != 15);
    }
    if (count != 15 || sum != var2)
        explode_bomb();
}
```

## phase_6

> `phase_6` 的结构比较复杂，存在许多分支以及嵌套的循环，跳转指令互相交错

### block 1

```x86asm
08048e62 <phase_6>:
 8048e62:	56                   	push   %esi
 8048e63:	53                   	push   %ebx
 8048e64:	83 ec 44             	sub    $0x44,%esp

 ; read_six_numbers(char* str, unsigned arr[])
 8048e67:	8d 44 24 10          	lea    0x10(%esp),%eax; %eax = arr
 8048e6b:	89 44 24 04          	mov    %eax,0x4(%esp); 0x4(%esp) = arr
 8048e6f:	8b 44 24 50          	mov    0x50(%esp),%eax; %eax = str
 8048e73:	89 04 24             	mov    %eax,(%esp); (%esp) = str
 8048e76:	e8 60 04 00 00       	call   80492db <read_six_numbers>
```

调用了 `phase_2` 中出现过的 `read_six_numbers`，将在之后逐步分析为什么应该是 `unsigned` 数组。

### block 2

```x86asm
 8048e7b:	be 00 00 00 00       	mov    $0x0,%esi; %esi = 0

 ; do
 8048e80:	8b 44 b4 10          	mov    0x10(%esp,%esi,4),%eax; %eax = arr[%esi]
 8048e84:	83 e8 01             	sub    $0x1,%eax; %eax -= arr[%esi] - 1
 ;   if (arr[%esi] - 1 > 5)
 8048e87:	83 f8 05             	cmp    $0x5,%eax
 8048e8a:	76 05                	jbe    8048e91 <phase_6+0x2f>
 ;     explode_bomb()
 8048e8c:	e8 15 03 00 00       	call   80491a6 <explode_bomb>

 ;   if (++%esi == 6)
 ;     break
 8048e91:	83 c6 01             	add    $0x1,%esi; %esi += 1
 8048e94:	83 fe 06             	cmp    $0x6,%esi
 8048e97:	74 33                	je     8048ecc <phase_6+0x6a>
 ;   for (%ebx = %esi, %ebx <= 5; ++%ebx)
 8048e99:	89 f3                	mov    %esi,%ebx; %ebx = %esi
 8048e9b:	8b 44 9c 10          	mov    0x10(%esp,%ebx,4),%eax; %eax = arr[%ebx]
 ;     if (arr[%esi-1] == arr[%ebx])
 8048e9f:	39 44 b4 0c          	cmp    %eax,0xc(%esp,%esi,4)
 8048ea3:	75 05                	jne    8048eaa <phase_6+0x48>
 ;       explode_bomb()
 8048ea5:	e8 fc 02 00 00       	call   80491a6 <explode_bomb>

 8048eaa:	83 c3 01             	add    $0x1,%ebx; %ebx += 1
 8048ead:	83 fb 05             	cmp    $0x5,%ebx
 8048eb0:	7e e9                	jle    8048e9b <phase_6+0x39>
 ;     loop for

 8048eb2:	eb cc                	jmp    8048e80 <phase_6+0x1e>
 ; while (true)
```

首先将 `%esi` 置 `0`，用于记录循环的次数，当 `%esi == 6` 时退出循环。

循环体内首先判断当前元素减 `1` 之后是否大于 `5`，若是则 `explode_bomb`，此处元素的类型将会影响结果。若为 `int`，则输入的值只需要不大于 `5` 即可，可以为负数；若为 `unsigned`，则输入的值的范围必须为 `1-6`。

判断完元素值之后，循环计数 `+1`，判断是否退出循环，若不退出循环，则进入 `for` 循环。

`for` 循环中首先将 `%esi` 存入 `%ebx`，作为 `for` 循环的迭代变量。循环体内比较 `arr[%ebx]` 与 `arr[%esi-1]` 的值，如果相等则 `explode_bomb`，直至变量完所有元素。

综合分析以上两个循环，可以发现其功能是判断输入的元素是否存在相同元素，如果存在则 `explode_bomb`，所以输入的元素应当不重复。如果类型为 `unsigned`，则进一步约束为 `1-6`，且每个值出现 1 次。

### block 3

```x86asm
 ;   do
 8048eb4:	8b 52 08             	mov    0x8(%edx),%edx; %edx = %edx -> next

 8048eb7:	83 c0 01             	add    $0x1,%eax; %eax += 1
 8048eba:	39 c8                	cmp    %ecx,%eax
 8048ebc:	75 f6                	jne    8048eb4 <phase_6+0x52>
 ;   while (++%eax != arr[%ebx])

 8048ebe:	89 54 b4 28          	mov    %edx,0x28(%esp,%esi,4); nodes[%esi] = %edx
 8048ec2:	83 c3 01             	add    $0x1,%ebx; %ebx += 1

 8048ec5:	83 fb 06             	cmp    $0x6,%ebx
 8048ec8:	75 07                	jne    8048ed1 <phase_6+0x6f>
 ; while (%ebx != 6)

 ;   else
 8048eca:	eb 1c                	jmp    8048ee8 <phase_6+0x86>

 8048ecc:	bb 00 00 00 00       	mov    $0x0,%ebx; %ebx = 0
 
 ; do
 8048ed1:	89 de                	mov    %ebx,%esi; %esi = %ebx
 8048ed3:	8b 4c 9c 10          	mov    0x10(%esp,%ebx,4),%ecx; %ecx = arr[%ebx]
 8048ed7:	b8 01 00 00 00       	mov    $0x1,%eax; %eax = 1
 8048edc:	ba 3c c1 04 08       	mov    $0x804c13c,%edx; %edx = 0x804c13c

 ;   if (arr[%ebx] > 1)
 8048ee1:	83 f9 01             	cmp    $0x1,%ecx
 8048ee4:	7f ce                	jg     8048eb4 <phase_6+0x52>

 ;   else
 8048ee6:	eb d6                	jmp    8048ebe <phase_6+0x5c>
```

第三块是两个嵌套的 `do...while` 循环，但是外层循环中代码并非按顺序分布，所以可能难以理解。

外层循环的起点为 `8048ed1`，其之前的地址为 `8048ecc` 的指令是循环计数的初始化指令，不在循环体内。

外层循环首先执行以下操作：

* 将外层循环计数器 `%ebx` 的值存入 `%esi` 中
* 将 `arr[%ebx]` 存入 `%ecx`
* 令内存循环计数器 `%eax = 1`
* 令 `%edx = 0x804c13c`

```x86asm
0804c13c <node1>:
 804c13c:	a6                   	cmpsb  %es:(%edi),%ds:(%esi)
 804c13d:	01 00                	add    %eax,(%eax)
 804c13f:	00 01                	add    %al,(%ecx)
 804c141:	00 00                	add    %al,(%eax)
 804c143:	00 48 c1             	add    %cl,-0x3f(%eax)
 804c146:	04 08                	add    $0x8,%al

0804c148 <node2>:
 804c148:	4b                   	dec    %ebx
 804c149:	03 00                	add    (%eax),%eax
 804c14b:	00 02                	add    %al,(%edx)
 804c14d:	00 00                	add    %al,(%eax)
 804c14f:	00 54 c1 04          	add    %dl,0x4(%ecx,%eax,8)
 804c153:	08 af 01 00 00 03    	or     %ch,0x3000001(%edi)

0804c154 <node3>:
 804c154:	af                   	scas   %es:(%edi),%eax
 804c155:	01 00                	add    %eax,(%eax)
 804c157:	00 03                	add    %al,(%ebx)
 804c159:	00 00                	add    %al,(%eax)
 804c15b:	00 60 c1             	add    %ah,-0x3f(%eax)
 804c15e:	04 08                	add    $0x8,%al

0804c160 <node4>:
 804c160:	a2 00 00 00 04       	mov    %al,0x4000000
 804c165:	00 00                	add    %al,(%eax)
 804c167:	00 6c c1 04          	add    %ch,0x4(%ecx,%eax,8)
 804c16b:	08 3a                	or     %bh,(%edx)

0804c16c <node5>:
 804c16c:	3a 03                	cmp    (%ebx),%al
 804c16e:	00 00                	add    %al,(%eax)
 804c170:	05 00 00 00 78       	add    $0x78000000,%eax
 804c175:	c1 04 08 c8          	roll   $0xc8,(%eax,%ecx,1)

0804c178 <node6>:
 804c178:	c8 02 00 00          	enter  $0x2,$0x0
 804c17c:	06                   	push   %es
 804c17d:	00 00                	add    %al,(%eax)
 804c17f:	00 00                	add    %al,(%eax)
 804c181:	00 00                	add    %al,(%eax)
```

查看地址单元，发现 `%edx` 存储的应该是 `node1` 的首地址，分析这几个 `node` 的内存结果，猜测其结构应该为：

```c
struct node {
    int value;
    int id;
    struct node* next;
};
```

每一个 `node` 分别指向编号 `+1` 的 `node`，形成一个链表。

完成值的设置之后，判断当前数组元素是否大于 `1`，若是则进入内层循环，若否则跳过内层循环。

内存循环执行如下操作：

1. `%edx = %edx -> next`，将指针指向下一节点
2. `%eax += 1`，再判断 `%eax` 是否等于当前数组元素，若是则退出循环，若否则内层循环迭代

所以内层循环的功能应该是找到编号与当前数组元素相等的节点，由于编号为 `1-6`，因此如果要避免死循环，则数组元素必须为 `1-6`，所以元素类型应当为 `unsigned`。

内层循环结束之后（或当前数组元素是否大于 `1` ），将指向的节点的首地址存入数组 `arr` 之后的地址中，如果以 `arr` 进行表示则是存入 `arr[6 + %esi]`。由于 `%esi` 是外层循环计数器，值在不停增加，所以 `arr` 之后应当还有一个数组，用于存放指向 `node` 的指针，记作 `struct node* nodes[]`。

总体分析上述内外层循环，发现实现的功能是按照数组元素的值，将相应编号的节点依次存入节点数组（通过指针访问，并没有存入相应的地址）中。

### block 4

```x86asm
 ; 循环展开
 8048ee8:	8b 5c 24 28          	mov    0x28(%esp),%ebx; %ebx = nodes[0]
 8048eec:	8b 44 24 2c          	mov    0x2c(%esp),%eax; %eax = nodes[1]
 8048ef0:	89 43 08             	mov    %eax,0x8(%ebx); nodes[0]->next = nodes[1]
 8048ef3:	8b 54 24 30          	mov    0x30(%esp),%edx; %edx = nodes[2]
 8048ef7:	89 50 08             	mov    %edx,0x8(%eax); nodes[1]->next = nodes[2]
 8048efa:	8b 44 24 34          	mov    0x34(%esp),%eax; %eax = nodes[3]
 8048efe:	89 42 08             	mov    %eax,0x8(%edx); nodes[2]->next = nodes[3]
 8048f01:	8b 54 24 38          	mov    0x38(%esp),%edx; %edx = nodes[4]
 8048f05:	89 50 08             	mov    %edx,0x8(%eax); nodes[3]->next = nodes[4]
 8048f08:	8b 44 24 3c          	mov    0x3c(%esp),%eax; %eax = nodes[5]
 8048f0c:	89 42 08             	mov    %eax,0x8(%edx); nodes[4]->next = nodes[5]
 8048f0f:	c7 40 08 00 00 00 00 	movl   $0x0,0x8(%eax); nodes[5]->next = NULL
```

第四块按节点数组中的顺序，将上一个节点指向下一个节点，结合 block 3 可以发现，两块指令实现的功能是按照输入的数组对节点进行了重新的排列，形成了一个新的链表。

### block 5

```x86asm
 8048f16:	be 05 00 00 00       	mov    $0x5,%esi; %esi = 5

 ; do
 8048f1b:	8b 43 08             	mov    0x8(%ebx),%eax; %eax = %ebx->next
 8048f1e:	8b 10                	mov    (%eax),%edx; %edx = %ebx->next->value
 ;   if (%ebx->value > %ebx->next->value)
 8048f20:	39 13                	cmp    %edx,(%ebx)
 8048f22:	7e 05                	jle    8048f29 <phase_6+0xc7>
 ;     explode_bomb()
 8048f24:	e8 7d 02 00 00       	call   80491a6 <explode_bomb>

 8048f29:	8b 5b 08             	mov    0x8(%ebx),%ebx; %ebx = %ebx->next
 8048f2c:	83 ee 01             	sub    $0x1,%esi; %esi -= 1
 8048f2f:	75 ea                	jne    8048f1b <phase_6+0xb9>
 ; while (--%esi)
```

第五块是一个简单的 `do...while` 循环，首先将计数器置为 `5`，然后进入循环。同时需要注意到，在 block 4 中，`nodes[0]` 存入 `%ebx` 之后 `%ebx` 的值没有被覆写，所以 `%ebx` 中存储的是 `nodes[0]` 的首地址。

`for` 循环中首先将 `%ebx` 指向的下一个节点存入 `%eax`，将下一个节点的值存入 `%edx`。然后判断当前节点的值是否大于下一节点的值，若是则 `explode_bomb`，若否则计数器 `-1`，循环迭代直至计数器为 `0`。

总体分析，`phase_6` 的要求我们按各节点值的大小从小到大进行排序，然后将各节点的顺序输入。

由于节点值为 `[ 0x1a6, 0x34b, 0x1af, 0xa2, 0x33a, 0x2c8 ]`，所以答案为 `4 1 3 6 5 2`。

### code

```c
void phase_6(char* str)
{
    unsigned arr[6];
    struct node* nodes[6];
    int i, j, index;
    struct node* p;
    read_six_numbers(str, arr);
    i = 0;
    do {
        if (arr[i] - 1 > 5)
            explode_bomb();
        if (++i == 6)
            break;
        for (j = i; j <= 5; ++j)
            if (arr[i - 1] == arr[j])
                explode_bomb();
    } while (1);
    i = 0;
    do {
        index = 1;
        p = &node1;
        if (arr[i] > 1)
            do
                p = p->next;
            while (++index != arr[i]);
        nodes[i] = p;
    } while (++i != 6);
    nodes[0]->next = nodes[1];
    nodes[1]->next = nodes[2];
    nodes[2]->next = nodes[3];
    nodes[3]->next = nodes[4];
    nodes[4]->next = nodes[5];
    nodes[5]->next = NULL;
    p = nodes[0];
    i = 5;
    do {
        if (p->value > p->next->value)
            explode_bomb();
        p = p->next;
    } while (--i);
}
```

## secret_phase_entrance

`secret_phase` 并没有在主函数中直接调用，我们需要先找到它的入口。汇编指令中直接有标注 `secret_phase` 的地址，我们找到调用它的地方即可，就在 `phase_defused` 中。

### phase_defused

```x86asm
0804932b <phase_defused>:
 804932b:	81 ec 8c 00 00 00    	sub    $0x8c,%esp

 ; 哨兵
 8049331:	65 a1 14 00 00 00    	mov    %gs:0x14,%eax
 8049337:	89 44 24 7c          	mov    %eax,0x7c(%esp)
 804933b:	31 c0                	xor    %eax,%eax

 ; if (*(int*)0x804c3cc == 6)
 804933d:	83 3d cc c3 04 08 06 	cmpl   $0x6,0x804c3cc
 8049344:	75 72                	jne    80493b8 <phase_defused+0x8d>
 ;   sscanf(char* str, "%d %d %s", int var1, int var2, char* s)
 8049346:	8d 44 24 2c          	lea    0x2c(%esp),%eax
 804934a:	89 44 24 10          	mov    %eax,0x10(%esp); 0x10(%esp) = s
 804934e:	8d 44 24 28          	lea    0x28(%esp),%eax
 8049352:	89 44 24 0c          	mov    %eax,0xc(%esp); 0xc(%esp) = var2
 8049356:	8d 44 24 24          	lea    0x24(%esp),%eax
 804935a:	89 44 24 08          	mov    %eax,0x8(%esp); 0x08(%esp) = var1
 804935e:	c7 44 24 04 a9 a4 04 	movl   $0x804a4a9,0x4(%esp); "%d %d %s"
 8049365:	08
 8049366:	c7 04 24 d0 c4 04 08 	movl   $0x804c4d0,(%esp);
 804936d:	e8 fe f4 ff ff       	call   8048870 <__isoc99_sscanf@plt>

 ; if (sscanf(/**/) == 3)
 8049372:	83 f8 03             	cmp    $0x3,%eax
 8049375:	75 35                	jne    80493ac <phase_defused+0x81>
 ;   strings_not_equal(char*, "DrEvil")
 8049377:	c7 44 24 04 b2 a4 04 	movl   $0x804a4b2,0x4(%esp); "DrEvil"
 804937e:	08
 804937f:	8d 44 24 2c          	lea    0x2c(%esp),%eax; %eax = s
 8049383:	89 04 24             	mov    %eax,(%esp); (%esp) = s
 8049386:	e8 09 fd ff ff       	call   8049094 <strings_not_equal>

 ;   if (strings_not_equal(/**/))
 ;     return
 804938b:	85 c0                	test   %eax,%eax
 804938d:	75 1d                	jne    80493ac <phase_defused+0x81>
 ; "Curses, you've found the secret phase!"
 804938f:	c7 04 24 78 a3 04 08 	movl   $0x804a378,(%esp)
 8049396:	e8 65 f4 ff ff       	call   8048800 <puts@plt>
 ; "But finding it and solving it are quite different..."
 804939b:	c7 04 24 a0 a3 04 08 	movl   $0x804a3a0,(%esp)
 80493a2:	e8 59 f4 ff ff       	call   8048800 <puts@plt>
 80493a7:	e8 dc fb ff ff       	call   8048f88 <secret_phase>
 ; "Congratulations! You've defused the bomb!"
 80493ac:	c7 04 24 d8 a3 04 08 	movl   $0x804a3d8,(%esp)
 80493b3:	e8 48 f4 ff ff       	call   8048800 <puts@plt>

 80493b8:	8b 44 24 7c          	mov    0x7c(%esp),%eax
 80493bc:	65 33 05 14 00 00 00 	xor    %gs:0x14,%eax
 80493c3:	74 05                	je     80493ca <phase_defused+0x9f>
 80493c5:	e8 06 f4 ff ff       	call   80487d0 <__stack_chk_fail@plt>
 80493ca:	81 c4 8c 00 00 00    	add    $0x8c,%esp
 80493d0:	c3                   	ret
```

我们直接来分析什么时候触发 `secret_phase`。首先来看 `0x804c3cc` 这个地址，我们直接找到相应的指令处：

```x86asm
0804c3cc <num_input_strings>:
 804c3cc:	00 00                	add    %al,(%eax)
```

发现它的命名是 `num_input_strings`，字面意思就是输入的字符串的个数，这大概率就是答题的次数，再搜索一下哪里出现了这个地址，并对它进行了写值：

```x86asm
080491cd <read_line>:
 8049287:	a1 cc c3 04 08       	mov    0x804c3cc,%eax
 804928c:	8d 50 01             	lea    0x1(%eax),%edx
 804928f:	89 15 cc c3 04 08    	mov    %edx,0x804c3cc
```

最终我们在 `read_line` 中找到了它，整个汇编指令中只有这第三行指令对它进行了写值，再结合上面的两条指令，我们发现是对其进行了自增 `1` 的操作，符合我们的猜测。由于 `read_line` 部分指令太多，也没有必要进行分析，我们去 `gdb` 中进行一下验证：

![][phase-0]
![][phase-1]
![][phase-2]
![][phase-3]
![][phase-4]
![][phase-5]
![][phase-6]

可以看到结果与我们分析的完全符合。

接着往下走，我们发现调用了 `sscanf` 函数，读取了两个整数和一个字符串，但是直接去指令中找，我们发现被读取的字符串是空的，所以这个字符串在运行时应当发生了改变，我们接着之前的 `gdb` 查看一下：

![][string-4]

很显然是我们输入的 `phase_4` 的答案，而这个 `sscanf` 还读取了一个字符串 `"DrEvil"`，显然我们 `phase_4` 的答案输入 `2 4 DrEvil` 就能进入 `secret_phase`：

![][secret-phase-entrance]

至此，我们已经找到了 `secret_phase` 的入口，接下来就是解决它。

## secret_phase

> `secret_phase` 的主体如 `phase_4` 是一个递归函数的调用

```x86asm
08048f88 <secret_phase>:
 8048f88:	53                   	push   %ebx
 8048f89:	83 ec 18             	sub    $0x18,%esp

 ; read_line()
 8048f8c:	e8 3c 02 00 00       	call   80491cd <read_line>; str = read_line()

 ; strtol(str, 0, 10)
 8048f91:	c7 44 24 08 0a 00 00 	movl   $0xa,0x8(%esp)
 8048f98:	00
 8048f99:	c7 44 24 04 00 00 00 	movl   $0x0,0x4(%esp)
 8048fa0:	00
 8048fa1:	89 04 24             	mov    %eax,(%esp)
 8048fa4:	e8 37 f9 ff ff       	call   80488e0 <strtol@plt>

 8048fa9:	89 c3                	mov    %eax,%ebx; %ebx = %eax
 8048fab:	8d 40 ff             	lea    -0x1(%eax),%eax; %eax = %eax-1

 ; if (%eax > 1000)
 8048fae:	3d e8 03 00 00       	cmp    $0x3e8,%eax
 8048fb3:	76 05                	jbe    8048fba <secret_phase+0x32>
 ;   explode_bomb()
 8048fb5:	e8 ec 01 00 00       	call   80491a6 <explode_bomb>

 ; fun7()
 8048fba:	89 5c 24 04          	mov    %ebx,0x4(%esp); 0x4(%esp) = %ebx
 8048fbe:	c7 04 24 88 c0 04 08 	movl   $0x804c088,(%esp); (%esp) = (int*)0x804c088
 8048fc5:	e8 6d ff ff ff       	call   8048f37 <fun7>

 ; if (fun7 != 4)
 8048fca:	83 f8 04             	cmp    $0x4,%eax
 8048fcd:	74 05                	je     8048fd4 <secret_phase+0x4c>
 ;   explode_bomb()
 8048fcf:	e8 d2 01 00 00       	call   80491a6 <explode_bomb>

 ; else
 ; "Wow! You've defused the secret stage!"
 8048fd4:	c7 04 24 94 a2 04 08 	movl   $0x804a294,(%esp)
 8048fdb:	e8 20 f8 ff ff       	call   8048800 <puts@plt>
 8048fe0:	e8 46 03 00 00       	call   804932b <phase_defused>
 8048fe5:	83 c4 18             	add    $0x18,%esp
 8048fe8:	5b                   	pop    %ebx
 8048fe9:	c3                   	ret
```

主体并不复杂，约束条件仅有  $ 0 < x \leq 1000 $，然后将其作为 `fun7` 的第二个参数。我们观察第一个参数：

```x86asm
0804c088 <n1>:
 804c088:	24 00                	and    $0x0,%al
 804c08a:	00 00                	add    %al,(%eax)
 804c08c:	94                   	xchg   %eax,%esp
 804c08d:	c0 04 08 a0          	rolb   $0xa0,(%eax,%ecx,1)
 804c091:	c0 04 08 08          	rolb   $0x8,(%eax,%ecx,1)

0804c094 <n21>:
 804c094:	08 00                	or     %al,(%eax)
 804c096:	00 00                	add    %al,(%eax)
 804c098:	c4                   	(bad)
 804c099:	c0 04 08 ac          	rolb   $0xac,(%eax,%ecx,1)
 804c09d:	c0 04 08 32          	rolb   $0x32,(%eax,%ecx,1)
```

发现是一个类似 `node` 的节点（还有很多就不贴上来了），不过似乎有两个指针，所以这个结构应该会比链表复杂，可能是**双向链表**或**树**或**图**。

最后要满足 `fun7` 的返回值为 `4`，那我们就进入 `fun7` 一探究竟。

### code

```c
void secret_phase(char* str)
{
    char* str;
    unsigned x;
    str = read_line();
    x = strtol(str, 0, 10);
    if (x - 1 > 1000)
        explode_bomb();
    if (fun7(&n1, x) != 4)
        explode_bomb();
    printf("Wow! You've defused the secret stage!");
}
```

## fun7

```x86asm
 ; fun7(n* p, int var)
08048f37 <fun7>:
 8048f37:	53                   	push   %ebx
 8048f38:	83 ec 18             	sub    $0x18,%esp

 8048f3b:	8b 54 24 20          	mov    0x20(%esp),%edx; %edx = p
 8048f3f:	8b 4c 24 24          	mov    0x24(%esp),%ecx; %ecx = var

 ; if (p != NULL)
 8048f43:	85 d2                	test   %edx,%edx
 8048f45:	74 37                	je     8048f7e <fun7+0x47>

 8048f47:	8b 1a                	mov    (%edx),%ebx; %ebx = p->value

 ;   if (p->value > var)
 8048f49:	39 cb                	cmp    %ecx,%ebx;
 8048f4b:	7e 13                	jle    8048f60 <fun7+0x29>
 ;     fun7(p->left, var)
 8048f4d:	89 4c 24 04          	mov    %ecx,0x4(%esp); 0x4(%esp) = var
 8048f51:	8b 42 04             	mov    0x4(%edx),%eax; %eax = p->left
 8048f54:	89 04 24             	mov    %eax,(%esp); (%esp) = p->left
 8048f57:	e8 db ff ff ff       	call   8048f37 <fun7>
 8048f5c:	01 c0                	add    %eax,%eax; return fun7 * 2
 8048f5e:	eb 23                	jmp    8048f83 <fun7+0x4c>

 ;   else
 8048f60:	b8 00 00 00 00       	mov    $0x0,%eax; return 0

 ;   else if (p->value != var)
 8048f65:	39 cb                	cmp    %ecx,%ebx
 8048f67:	74 1a                	je     8048f83 <fun7+0x4c>
 ;     fun7(p->right, var)
 8048f69:	89 4c 24 04          	mov    %ecx,0x4(%esp); 0x4(%esp) = var
 8048f6d:	8b 42 08             	mov    0x8(%edx),%eax; %eax = p->right
 8048f70:	89 04 24             	mov    %eax,(%esp); (%esp) = p->right
 8048f73:	e8 bf ff ff ff       	call   8048f37 <fun7>
 8048f78:	8d 44 00 01          	lea    0x1(%eax,%eax,1),%eax; return fun7 * 2 + 1
 8048f7c:	eb 05                	jmp    8048f83 <fun7+0x4c>

 ; else
 8048f7e:	b8 ff ff ff ff       	mov    $0xffffffff,%eax; return -1

 8048f83:	83 c4 18             	add    $0x18,%esp
 8048f86:	5b                   	pop    %ebx
 8048f87:	c3                   	ret
```

跟 `func4` 几乎是一个模子里刻出来的，只不过多了一步判断 `p` 是否指向 `NULL`，若是则返回 `-1`。

在 `p != NULL` 时，共有三条分支：

* `p->value > var`: `return fun7(p->left, var) * 2`
* `p->value < var`: `return fun7(p->right, var) * 2 + 1`
* `p->value == var`: `return 0`

这时候也确定了 `n` 具有两个指针，我们来分析一下它们之间的关系：

```json
"n1": {
    "value": 36,
    "n21": {
        "value": 8,
        "n31": {
            "value": 6,
            "n41": { "value": 1 },
            "n42": { "value": 7 }
        },
        "n32": {
            "value": 22,
            "n43": { "value": 20 },
            "n44": { "value": 35 }
        }
    },
    "n22": {
        "value": 50,
        "n33": {
            "value": 45,
            "n45": { "value": 40 },
            "n46": { "value": 47 }
        },
        "n34": {
            "value": 107,
            "n47": { "value": 99 },
            "n48": { "value": 1001 }
        }
    }
}
```

确定了这是一棵二叉树，同时树的高度为 `4`。结合之前的三条分支，得到我们的任务是在第 4 步时计算出 `4`。

步长只有 4，即使是穷举也很快，我们得到的唯一的解是：`{ "0", "fun7 * 2 + 1", "fun7 * 2", "fun7 * 2" }`，满足的比较关系从根节点开始为：`{ '<', '<', '>', '==' }`，在树中寻找到路径：`n1 -> n21 -> n31 -> n42`，答案为 `7`。

![][phases-defused]

### code

```c
int fun7(struct n* p, int var)
{
    if (p == NULL)
        return -1;
    if (p->value > var)
        return fun7(p->left, var) * 2;
    if (p->value != var)
        return fun7(p->right, var) * 2 + 1;
    return 0;
}
```

## 后记

至此 `bomblab` 也算是告一段落，这个实验的确是花费了不少功夫，包括最初的摸索，到后来的娴熟，成长也是很大。而写这篇博客花费的时间也许超过了我做实验的时间。

在此，我非常感谢你能阅读完这一篇长长的文章，也希望你能有所收获，你的每一次点击都是对我莫大的鼓励😁。

[equation]: http://static.wilfredshen.cn/images/CSAPP-bomblab/equation.svg
[phase-0]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-0.png
[phase-1]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-1.png
[phase-2]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-2.png
[phase-3]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-3.png
[phase-4]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-4.png
[phase-5]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-5.png
[phase-6]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phase-6.png
[string-4]: http://static.wilfredshen.cn/images/CSAPP-bomblab/string-4.png
[secret-phase-entrance]: http://static.wilfredshen.cn/images/CSAPP-bomblab/secret-phase-entrance.png
[phases-defused]: http://static.wilfredshen.cn/images/CSAPP-bomblab/phases-defused.png
