---
layout: post
title: CSAPP-datalab
tags:
  - CSAPP
  - Binary
categories:
  - 技术
  - Binary
mathjax: true
description: 本文详细拆解了 CSAPP 提供的 datalab，共计 15 道题目，提供了原题以及详尽的注释和解题思路，并保持了良好的排版提供良好的阅读体验...
abbrlink: 572b4f3b
date: 2020-04-12 18:00:00
---

本实验除个别题目借鉴了其他博客（有标注），其余题目均为博主自己的解法，不保证最优。

* 实验环境：Windows10 系统下 VMware 虚拟机 Ubuntu12.04 桌面版 32 位
* 原址链接：[https://csapp.cs.cmu.edu/3e/labs.html](https://csapp.cs.cmu.edu/3e/labs.html)

## 1. bitAnd

```c
/* 
 * bitAnd - x&y using only ~ and | 
 *   Example: bitAnd(6, 5) = 4
 *   Legal ops: ~ |
 *   Max ops: 8
 *   Rating: 1
 */
int bitAnd(int x, int y)
{
    return ~(~x | ~y);
}
```

第一题要求使用取反以及或运算来实现与运算。

这题非常简单，使用离散数学中的**德摩根定律**就可以求解，有兴趣可以自己去搜索，这里不做展开介绍。

## 2. getByte

```c
/* 
 * getByte - Extract byte n from word x
 *   Bytes numbered from 0 (LSB) to 3 (MSB)
 *   Examples: getByte(0x12345678,1) = 0x56
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 6
 *   Rating: 2
 */
int getByte(int x, int n)
{
    return (x >> (n << 3)) & 0xff;
}
```

第二题要求取出某一字节的值。

只需将该字节移动至低八位并使用与运算取出即可，不需要考虑算术移位等问题，`n << 3` 等价 `n * 8`

## 3. logicalShift

```c
/* 
 * logicalShift - shift x to the right by n, using a logical shift
 *   Can assume that 0 <= n <= 31
 *   Examples: logicalShift(0x87654321,4) = 0x08765432
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 20
 *   Rating: 3 
 */
int logicalShift(int x, int n)
{
    return (x >> n) ^ (((x & (1 << 31)) >> n) << 1);
}
```

第三题要求使用算术移位实现逻辑移位。

由于算术移位会在高位补符号位，要实现逻辑移位需要将负数高位补的 `1` 转变为 `0`，同时保证非负数高位的 `0` 依旧是 `0`，所以我采用取出符号位拓展至 `n-1` 位并**异或**的方法。当然，取反之后再进行与运算也是一种选择。

由于该题限制，只能使用 `0x00 - 0xff` 范围内的值，所以采用了上述方法，如果不对字面值常量做限制，则使用如下代码即可求解：

```c
return (x & 0xffffffff) >> n;
// 不能使用 (x | 0) >> n 或者 (x ^ 0) >> n 等
```

经测试，整型变量 (测试过 `int` 与 `long long int` ) 与字面值常量进行与运算之后，其结果类似无符号类型 (可能是被拓展成了更大的数据类型，其符号位为 `0` )，所以可以实现逻辑移位的效果。

## 4. bitCount

```c
/*
 * bitCount - returns count of number of 1's in word
 *   Examples: bitCount(5) = 2, bitCount(7) = 3
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 40
 *   Rating: 4
 */
int bitCount(int x)
{
    int a = 0x55 | (0x55 << 8);
    int b = 0x33 | (0x33 << 8);
    int c = 0x0f | (0x0f << 8);
    int d = 0xff | (0xff << 16);
    int e = 0xff | (0xff << 8);
    a = a | (a << 16);
    b = b | (b << 16);
    c = c | (c << 16);
    x = (x & a) + ((x >> 1) & a);
    x = (x & b) + ((x >> 2) & b);
    x = (x & c) + ((x >> 4) & c);
    x = (x & d) + ((x >> 8) & d);
    return (x & e) + ((x >> 16) & e);
}
```

第四题要求计算 `int` 中 `1` 的个数，可以将 32 位相加，最终的和就是 `1` 的个数。

由于操作符限制为 40 个，逐位相加必然无法实现，需要尽可能在一次操作内完成多位相加，采用分治归并的思想可以解决问题（类似归并排序）：

* 首先将 32 位分为 16 组，每组为连续 2 位，令每组前后 1 位相加，得到的值存储在该 2 位中
* 再将 32 位分为 8 组，每组为连续 4 位，将 4 位的前后 2 位相加，得到的值存储在该 4 位中
* 依次类推，最终得到 32 位相加的值
* `n` 位长度的数只需要相加 $ \lceil \log_{2}{n} \rceil $ 次即可

参考自：[https://www.cnblogs.com/graphics/archive/2010/06/21/1752421.html](https://www.cnblogs.com/graphics/archive/2010/06/21/1752421.html)

## 5. bang

```c
/* 
 * bang - Compute !x without using !
 *   Examples: bang(3) = 0, bang(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4 
 */
int bang(int x)
{
    return ((((~x + 1) | x) >> 31) + 1) & 1;
}
```

第五题要求使用位运算来实现 `!` 的功能。

由于 `0` 取非为 `1`，任何 `非0值` 取非均为 `0`，所以我们可以考虑如何判断值为 `0`。我们可以通过 `取反+1` 来得到一个数的负数。由于 `0` 的负数还是 `0`，而 `非0值` 的负数依旧是 `非0值`，且必定有一个数的符号位为 `1`。所以 `非0值` 的原值和其取负数之后的值进行或运算，其符号位必定为 `1`，可以通过其符号位来实现取非操作。

## 6. tmin

```c
/* 
 * tmin - return minimum two's complement integer 
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void)
{
    return 1 << 31;
}
```

第六题要求返回二进制最小整数的补码。

根据二进制补码的编码规则，最小数符号位为 `1`，其余位全 `0`。

## 7. fitsBits

```c
/* 
 * fitsBits - return 1 if x can be represented as an 
 *  n-bit, two's complement integer.
 *   1 <= n <= 32
 *   Examples: fitsBits(5,3) = 0, fitsBits(-4,3) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 2
 */
int fitsBits(int x, int n)
{
    x >>= n + ~0;
    return ((((x + 1) | (~x + 1)) >> 31) + 1) & 1;
}
```

第七题要求判断 `x` 是否可以被 `n` 位的二进制补码所表示，其实就是要求我们判断 `x` 是否满足 $ -2^{n-1} \leq x \leq 2^{n-1}-1 $。

简单推导可以发现，满足条件的 `x`，除去低 `n-1` 位，其余位必定相同，即全 `0` 或全 `1`。所以可以利用算术移位的特性，使 `x` 右移 `n-1` 位，则右移后的值应当全 `0` 或者全 `1`。`(x + 1) | (~x + 1)` 的值只有在 `x` 全 `0` 或者全 `1` 时，符号位才为 `0`，之后再判断符号位即可。

## 8. divpwr2

```c
/* 
 * divpwr2 - Compute x/(2^n), for 0 <= n <= 30
 *  Round toward zero
 *   Examples: divpwr2(15,1) = 7, divpwr2(-33,4) = -2
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 2
 */
int divpwr2(int x, int n)
{
    int fs = x >> 31;
    int f = fs & 1;
    int result = ~(((~x + f) >> n) + fs);
    return result | (((f & !!result) << 31) >> n);
}
```

第八题要求求出 `x/(2^n)` 的值，结果向 `0` 舍入。

如果 `x` 是非负数，则直接右移 `n` 位即可，所以负数则可以考虑先转换成正数，右移完之后再转换成负数。

由于最小值 (32 位下的 `0x80000000`) 取负数之后会产生溢出，其结果还是其本身，导致移位之后再次取负数时可能变成一个正数，所以需要判断这种情况并将高 `n` 位置 `1`，同时要避免结果为 `0` 时误将值更改为负数。

## 9. negate

```c
/* 
 * negate - return -x 
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x)
{
    return ~x + 1;
}
```

第九题要求使用位运算实现取负数。

这题非常简单，在之前的题目中已有多次运用。

## 10. isPositive

```c
/* 
 * isPositive - return 1 if x > 0, return 0 otherwise 
 *   Example: isPositive(-1) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 8
 *   Rating: 3
 */
int isPositive(int x)
{
    return !((x >> 31) | !x);
}
```

第十题要求判断一个数是否为正数。

我们只需要通过符号位来判断是否是非负数，并排除 `0` 的情况即可。

## 11. isLessOrEqual

```c
/* 
 * isLessOrEqual - if x <= y  then return 1, else return 0 
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y)
{
    int t = x + (~y + 1);
    int ft = t >> 31;
    int fx = x >> 31;
    int fy = y >> 31;
    int fneq = fx ^ fy;
    return ((ft | !t) & !fneq) | (fx & !fy);
}
```

第十一题要求判断 `x,y` 是否满足 $ x \leq y $。

判断 `x,y` 是否满足 $ x \leq y $，只需要判断 $ x-y \leq 0 $ 即可。由于可能存在溢出，我们在 `x,y` **异号**时直接判断 `x,y` 的大小，不通过减法来判断。`((ft | !t) & !fneq)` 判断同号的情况，`(fx & !fy)` 判断异号的情况。

## 12. ilog2

```c
/*
 * ilog2 - return floor(log base 2 of x), where x > 0
 *   Example: ilog2(16) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 90
 *   Rating: 4
 */
int ilog2(int x)
{
    int t = (!!(x >> 16)) << 4;
    t += (!!(x >> (t + 8))) << 3;
    t += (!!(x >> (t + 4))) << 2;
    t += (!!(x >> (t + 2))) << 1;
    t += !!(x >> (t + 1));
    return t;
}
```

第十二题要求求出 $ \lfloor \log_{2}{n} \rfloor $ 的值。

经过简单推导可以发现，我们只需要找到最高位的 `1` 即可。如果逐位查找，在 90 次操作的限制内不可能完成 31 位的查找，所以我们可以采取二分法：每次将查找区间分为两份，首先使用两次取非来判断高位是否存在 `1`，若有则在高位区间继续二分查找，若没有则在低位区间继续二分查找，直到区间长度为 `1`。

## 13. float_neg

```c
/* 
 * float_neg - Return bit-level equivalent of expression -f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representations of
 *   single-precision floating point values.
 *   When argument is NaN, return argument.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 10
 *   Rating: 2
 */
unsigned float_neg(unsigned uf)
{
    int E, M, f;
    E = (uf << 1);
    E >>= 24;
    M = (uf << 9) >> 9;
    f = (E + 1) || !M;
    return uf ^ (f << 31);
}
```

第十三题要求对一个浮点数求负数，在值为 `NaN` 的情况下返回原值。

求负数比较简单，对符号位取反即可，主要需要判断是否为 `NaN`。我们将阶码取出，并拓展至 32 位，如果全 `1` 则阶码全 `1` ，值可能为 `NaN` 。再判断 `M` 部分是否全 `0`，若不全 `0` 则是 `NaN`，返回原值。

## 14. float_i2f

```c
/* 
 * float_i2f - Return bit-level equivalent of expression (float) x
 *   Result is returned as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point values.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned float_i2f(int x)
{
    int t = 0x80000000;
    int count = 31;
    unsigned result = x & t;
    unsigned tail;
    if (!x)
        return 0;
    if (x < 0)
        x = -x;
    while (!(x & t))
    {
        x <<= 1;
        --count;
    }
    tail = x & 0xff;
    x = (x & ~t) >> 8;
    result |= ((count + 127) << 23) | x;
    if (tail > 0x80)
        ++result;
    else if ((tail == 0x80) & result)
        ++result;
    return result;
}
```

第十四题要求将 `int` 型 `x` 转换为 `float` 型，并将其编码输出。

`float` 型编码可以分解为 `s-e-f` 格式。

* 首先取出符号位，存入 `result` 中
* 之后我们需要得到除符号位以外的最高位的 `1` 所在的位数，其位数即是最低位到其的距离，也就是小数点移动的位数，位数 `+127` 即是阶码的移码
* 最高位的 `1` 之后的 23 位即是浮点数的小数。如果最高位的 `1` 之后超过 23 位，则需要进行**向偶舍入**。将其取出并在低位补足 8 位，判断是否大于 `0.5`，如果相等则判断尾数末位是否为 `1`，若是则进位。进位时若尾数部分溢出则阶码需要 `+1`。

## 15. float_twice

```c
/* 
 * float_twice - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned float_twice(unsigned uf)
{
    int E;
    E = (uf << 1);
    E >>= 24;
    if (!~E)
        return uf;
    if (E == 0)
        return (0x80000000 & uf) | (uf << 1);
    return uf + 0x00800000;
}
```

第十五题要求对给定编码的浮点数，返回 2 倍的值，如果为 `NaN` 则返回原值。

其中有一隐含条件：如果值为 `INF` 也返回原值，所以不需要判断是否为 `INF`。

所以我们只需要判断阶码是否全 `1` 即可。

* 若全 `1` 则返回原值
* 若全 `0` 则令其尾数左移 `1` (若溢出则阶码 `+1` )
* 若既有 `0` 又有 `1` 则阶码 `+1`
