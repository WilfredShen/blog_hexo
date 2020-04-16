---
layout: post
title: Python 环境配置
date: 2019-08-26 18:00:00
tags:
- Environment
- Python
categories:
- install
- Python
---

本篇博客的装配教程以安装了Anaconda为基础，Anaconda的安装与[这篇博客](https://wilfredshen.cn/2019/08/26/%E5%AE%89%E8%A3%85%20Anaconda/)相同可保证无误，若按其他方式装配，本篇博客不保证绝对正确，仅供对比参考。

本篇所有命令若无特殊说明，均在Anaconda Prompt中运行

下载需要一个较好地网络环境，可能会遇到网络问题导致下载失败，请切换网络或多尝试几次

## 更新conda

```python
# 运行以下命令
    conda update -n base -c defaults conda
# 如果得到以下询问，请输入任意非n字符同意并继续
    Proceed([y]/n)?
# 确保conda版本为最新，否则可能无法展开进一步的装配
# 可以运行以下命令查询conda版本
    conda -V
# 或
    conda --version
# 我得到的是以下反馈
    conda 4.7.11
```

## 新建环境

```python
# 运行以下命令新建环境，其中py37是环境名，可以自定义，python=3.7表示python版本
    conda create -n py37 python=3.7
# 同上一步骤，遇到的所有以下询问均输入任意非n字符同意
    Proceed([y]/n)?
# 若遇到error则多尝试运行几次第一条命令，最终总会成功，并得到以下反馈
    Solving environment: done
```

## 切换环境

```python
# 运行以下命令切换到新创建的环境中
    conda activate py37
# 此时运行以下命令可以看到环境已经切换
    conda info --envs
# 应该得到以下反馈，其中*代表当前环境
    # conda environments:
    #
    base                     D:\Anaconda3
    py37                  *  D:\Anaconda3\envs\py37
# 这时运行以下命令可以查看已装配的环境组件
    conda list
# 我得到的是以下反馈（可能略有不同，并不影响）
    # packages in environment at D:\Anaconda3\envs\py37:
    #
    # Name                    Version                   Build  Channel
    ca-certificates           2019.5.15                     1
    certifi                   2019.6.16                py37_1
    openssl                   1.1.1c               he774522_1
    pip                       19.2.2                   py37_0
    python                    3.7.4                h5263a28_0
    setuptools                41.0.1                   py37_0
    sqlite                    3.29.0               he774522_0
    vc                        14.1                 h0510ff6_4
    vs2015_runtime            14.15.26706          h3a45250_4
    wheel                     0.33.4                   py37_0
    wincertstore              0.2                      py37_0
```

## 配置环境

* **本步骤中进行的配置是推荐配置，并非强制要求，请按需使用**
* **本步骤中的版本可能不同，并不影响**

```python
# 运行以下命令更新pip
    python -m pip install --upgrade pip
# 失败则多尝试几次，最终会得到以下反馈
    Successfully installed pip-19.2.3
# 运行以下命令安装pandas
    pip install pandas
# 得到以下反馈
    Successfully installed numpy-1.17.0 pandas-0.25.1 python-dateutil-2.8.0 pytz-2019.2 six-1.12.0
# 运行以下命令安装numpy（若pandas安装未出错，此时应该已安装完）
    pip install numpy
# 若已运行上一条命令，则应得到反馈
    Requirement already satisfied: numpy in d:\anaconda3\envs\py37\lib\site-packages (1.17.0)
# 运行以下命令安装matplotlib
    pip install matplotlib
# 得到以下反馈
    Successfully installed cycler-0.10.0 kiwisolver-1.1.0 matplotlib-3.1.1 pyparsing-2.4.2
# 此时运行以下命令
    conda list
# 我得到的是以下反馈，理论上应无过大出入，仅可能存在版本号差异
    # packages in environment at D:\Anaconda3\envs\py37:
    #
    # Name                    Version                   Build  Channel
    ca-certificates           2019.5.15                     1
    certifi                   2019.6.16                py37_1
    cycler                    0.10.0                   pypi_0    pypi
    kiwisolver                1.1.0                    pypi_0    pypi
    matplotlib                3.1.1                    pypi_0    pypi
    numpy                     1.17.0                   pypi_0    pypi
    openssl                   1.1.1c               he774522_1
    pandas                    0.25.1                   pypi_0    pypi
    pip                       19.2.3                   pypi_0    pypi
    pyparsing                 2.4.2                    pypi_0    pypi
    python                    3.7.4                h5263a28_0
    python-dateutil           2.8.0                    pypi_0    pypi
    pytz                      2019.2                   pypi_0    pypi
    setuptools                41.0.1                   py37_0
    six                       1.12.0                   pypi_0    pypi
    sqlite                    3.29.0               he774522_0
    vc                        14.1                 h0510ff6_4
    vs2015_runtime            14.15.26706          h3a45250_4
    wheel                     0.33.4                   py37_0
    wincertstore              0.2                      py37_0
```

## 完成

至此，Python环境配置基本完成，还剩下ide等工具，此处不再做介绍，以后可能会在此处添加链接。

我也是最近上手Python，大家共同学习进步。
