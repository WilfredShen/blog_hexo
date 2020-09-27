---
layout: post
title: 从零开始的 Spring Boot 学习
tags:
  - Spring
  - Spring Boot
categories:
  - 技术
  - Java
description: >-
  博主最近准备做一个 Spring Boot + Vue 的项目，所以上手学习了 Spring Boot，从对 Java 注解不甚了解到能够跑起一个 SSM
  框架的服务器，其中经历了颇多艰辛，所以准备写这么一篇博客，一是沉淀一下学习到的知识，二也是为了给像我一样的萌新一个能够跑起 SSM
  框架项目的教程，而对其原理不求甚解...
abbrlink: 9cdcf3f4
date: 2020-07-13 21:24:21
---

> 前排劝退：本教程只针对 Spring Boot 以及 SSM 框架的初学者，展示 SSM 框架的大概的工作流程，此外也不会讲类似 SpringMVC 这些概念，目的单纯是为了能够跑起一个 SSM 框架的项目，而对其他的东西不求甚解。

## 前期准备

| 工具/环境           | 备注                                                         |
| ------------------- | ------------------------------------------------------------ |
| `Windows 10`        | 博主系统是 win10，当然考虑到语言是 `Java`，所以系统的差异可能并不会影响到这个项目。 |
| `IDEA ultimate`     | 请尽可能使用 ultimate 版本，community 版本功能不全，可能在本教程中会遇到各种问题。<br />如果您是在校大学生，那么使用学校邮箱大概率可以得到一年免费的 ultimate 版本使用权。<br />如果您是 eclipse 党，可以考虑更换 IDEA 。 |
| `JDK 8`             | `Java` 的经典版本，如果您的版本过低，可能会遇到一些问题，推荐升级。 |
| `MySQL 5.7`         | 同样是一个经典版本，过低的推荐升级，因为 5.7 之前的版本和 5.7 之后的版本可以类比为 1 和 2。 |
| `Navicat for MySQL` | 可选项，但是强烈推荐（可以寻找替代品）。有一个图形化界面怎么也比小黑框好。 |

## 创建项目

博主的 IDEA 装了中文插件（2020.1 版本之后有），不装也可以，见仁见智。

这是 ultimate 版的界面，如果是 community，左边那一列基本上是空荡荡的（金钱的力量）。选择 `Spring Initializer` ，右边的如图设置即可。

![](https://static.wilfredshen.cn/images/%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%20Spring%20Boot%20%E5%AD%A6%E4%B9%A0/1cjxm-1.png)

这一页的重点在图上都有写。看这一页起了好多名字，起名困难的我留下了眼泪（别急，后面还要起名字）。

![](https://static.wilfredshen.cn/images/%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%20Spring%20Boot%20%E5%AD%A6%E4%B9%A0/1cjxm-2.png)

这一页的功能是选择**预装**的依赖，可以什么都不选，之后自己按需添加。

![](https://static.wilfredshen.cn/images/%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%20Spring%20Boot%20%E5%AD%A6%E4%B9%A0/1cjxm-3.png)

起名字又来了，这回是项目的本地名称，也就是只记录在 IDEA 中，之前的名字是记录在项目信息中的。

起完名字点击 `Finish`，准备进入新的篇章。

![](https://static.wilfredshen.cn/images/%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%20Spring%20Boot%20%E5%AD%A6%E4%B9%A0/1cjxm-4.png)

## 项目结构

作为一个与时俱进的项目，结构当然也要随大流，下面放一下项目最基本的包结构：

```
src/main/
    java/com/example/demo/
        controller/
            Controller.java
        entity/
            User.java
        mapper/
            UserMapper.java
            UserMapper.xml
        service/
            impl/
                UserServiceImpl.java
            UserService.java
        DemoApplication.java
    resources/
```

上面给出了大致的结构，接下来讲一下它们（之中的文件）应当承担的功能：

| 名称           | 功能                                                         |
| -------------- | ------------------------------------------------------------ |
| `controller`   | 在 `MVC` 中，它直观的对应其中的 `C`。                        |
| `entity`       | 也有人叫 `PO (Persistent Object)`，`PO` 这个名字直观地看出它对应数据库中的记录，它的每一个属性都对应一个字段。 |
| `mapper`       | 它的同类是 `DAO (Data Access Object)`，显然它是用来处理数据的，它封装了 `jdbc`。<br />`Mybatis` 是一种半自动化的 `ORM` 框架，所以 `UserMapper.java` 是一个 `interface`，而非 `class`，具体的`SQL` 语句我们写在同级目录下的**同名** `xml` 文件中。<br />`mapper` 和 `DAO` 是两种可以互相取代实现方式，界限没有那么绝对。 |
| `service`      | 它显然是用来实现服务的，这里一般定义一些接口。               |
| `service/impl` | 这里实现 `service` 中的接口，当然可以不用分化那么细，不写接口直接写一个类也是没问题的。 |
| `dto`          | `Data Transfer Object`，是传输数据的对象。在上面的结构中没有体现，因为它完全可以被 `entity` 取代。<br />你可以把 `DTO` 理解为 `PO` 的 瘦身版，比如有时候返回给用户的时候不希望返回密码等等数据：<br />1. 你可以选择置为 `null`<br />2. 或者用一个 `DTO`，其中根本没有 `password`。<br />在项目越来越大的时候后者是一个几乎必然的选择。 |

这几个包已经描述完了，你大概可以感受到这样一个项目是怎样运作的了：

1. 用户发来请求，被某个 `controller` 接收到
2. `controller` 调用 `service` 来完成服务
3. `service` 完成服务，调用 `mapper` 将数据持久化至数据库中，并返回结果
4. 在这其中，传递数据的应当是 `entity`，细化一点就是 `DTO`，简单一点就是普通的 `Java` 对象

还有一个 `DemoApplication.java` 文件没有提到，在下一节中将揭晓它的功能。

## Spring 注解

上一节讲了项目的整体结构，这里将把 Spring 添加到我们的项目中。

思考一下，如果没有 Spring，我们可能会在 `controller` 中 `new` 一些 `socket` 来监听端口，然后将接收到的数据打包成一个对象，然后创建一个 `service` 来处理……

随便一想这都是上百行的代码量，一不小心可能还会来几个 `NullPointerException` 🤓。

所以我们选择了 Spring 来帮助我们管理这么多的对象，我们只需要关注逻辑即可，而 Spring 给我们的接口，就是一个个的注解。

首先我们来看 `DemoApplication.java`：

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

这是 Spring 项目初始自带的，也是整个 Spring 应用的入口（看到 `main` 函数就该懂了）。你可以看到代码非常简洁，一个 `@SpringBootApplication` 注解，`main` 函数中也只有一行代码。我们不深究它们到底怎么实现的，你只要知道，这个文件大部分情况下你都不用动，这里就是一个入口。

程序开始运行的时候，会扫描这个文件的同级目录，将扫描到的类型一个个“入籍”，这样 Spring 就知道它手底下有哪些类，当你要用到某一个类的对象的时候， Spring 就会帮你创建一个对象，把创建的对象交给你，你就只需要关注逻辑了。

至于如何“入籍”，你需要先了解一个概念叫做 `Bean`，你不用深究它到底为什么叫 `Bean` （大神们一拍脑袋想的名字多了去了，不用管他们），你只要知道，每一个被 Spring “入籍”的类，都是一个 `Bean`。反过来说，如果你要添加一个 `Bean`，请给它“入籍”。

接下来的工作就是给你写的类一个个“入籍”，这通过注解来完成（也可以通过 `xml` 文件进行配置，但这显然一点也不优雅）。每一个类的功能都不同，就像人的能力也是各不相同，所以“入籍”的时候要进行区分，这通过不同的注解来完成。

注意，在“入籍”的时候，如果没有特别指定名字，则会根据类名自动生成相应的 `id`。

### 给 controller “入籍”

`controller` 用到的注解是 `@Controller`，这样它的方法就可以匹配到各种各样的请求。

显然，我们是要把不同的请求区分开来的，如果统统写到一个方法里面，那想想就可怕，所以我们通过 `@RequestMapping` 来注解一个方法，指定它匹配的请求是哪些。如下，我们将匹配到对 `URI=/api/user/login` 的请求，同时限定这是一个 `POST` 请求：

```java
@RequestMapping(value = "/api/user/login", method = RequestMethod.POST)
@ResponseBody
public Result login(@RequestBody User user) {
    /* ... */
}
```

我们看到还用到了两个注解 `@ResponseBody` 和 `@RequestBody`，前者表明我要把 `Result` 转换成一个 `json` 或其他格式的字符串返回，而非一个页面，后者表明我要把请求体封装成 `User` 对象。这些 Spring 都帮我们完成了，我们不用再花费时间去做这些重复性的工作，我们只需要按规范写好 `getter/setter`（IDEA 可以一键生成），同时保证属性命名符合规范即可（应当使用驼峰式）。

注解也是可以简化的，比如我们可以用 `@PostMapping("/api/user/login")` 来取代上面的注解，相应的也有 `@GetMapping` 等等，而 `@Controller` 也有很多组合的注解，比如 `@RestController = @ResponseBody + @Controller`，这样里面的方法就不用写上 `@ResponseBody` 了。

如果我们希望这个访问能够跨域，我们只需要使用 `@CrossOrigin` 注解即可，注解到类上，则所有方法都允许跨域，只添加到一个方法上，则只允许该方法跨域，当然也可以设置允许的域名（默认使用通配符 `*`，即允许所有域名）。

在这里不得不提的一个注解是 `@Autowired`，如果添加在某个属性上，那么在创建这个类的对象的时候，Spring 就会从已“入籍”的类中找到符合的类创建一个对象，赋给这个属性，这个注解更推荐用在构造函数或 `setter` 上，但我们的 `controller` 不需要构造函数和 `setter`，所以直接注解在属性上就好。

### 给 mapper “入籍”

也许你会好奇为什么跳过了 `entity`，这是因为 `entity` 对应数据库中的一条条记录，所以它应该只有属性以及相应的 `getter/setter`，它没有也不该有任何逻辑，专业一点地讲，它就是一个 `POJO (Plain Ordinary Java Object)`。

`mapper` 用到的注解是 `@Mapper`。此外，它还可能需要用到一个注解 `@Repository`，用于告诉 IDE 将 `mapper` “入籍”。这是因为 `@Mapper` 不是 Spring 土生土长的注解，所以只用 `@Mapper` 在 IDEA 中进行自动装配的时候会报错（IDEA 误以为没有“入籍”，但其实 Spring 已经将它“入籍”了，程序可以正常运行），所以如果报错了，不妨加上 `@Repository`。

看看下面这个栗子（假定 `username` 可以重复）：

```java
@Repository
@Mapper
public interface UserMapper {
    boolean register(User user) throws Exception;
    boolean login(User user) throws Exception;
    List<User> getByUsername(String username) throws Exception;
}
```

在同名的 `xml` 文件中，切记 `id` 与方法名要相同，类名应当使用全限定名：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.mapper.UserMapper">
    <!-- insert -->
    <insert id="register" parameterType="com.example.demo.entity.User">
        INSERT INTO user (username, password, register_datetime, latest_login_datetime)
        VALUES (#{username}, #{password}, now(), null);
    </insert>
    <!-- update -->
    <update id="login" parameterType="com.example.demo.entity.User">
        UPDATE user
        SET latest_login_datetime = now()
        WHERE uid = #{uid};
    </update>
    <!-- select -->
    <select id="getByUsername" parameterType="java.lang.String" resultType="com.example.demo.entity.User">
        SELECT (uid, username, password, register_datetime, latest_login_datetime)
        FROM user
        WHERE username = #{username};
    </select>
</mapper>
```

在 `xml` 中使用 `#{}` 或 `${}` 可以将 `Java` 对象转换成 `SQL` 对象（依照命名规则，调用相应的 `getter`），前者是将其作为一个字符串单元使用，可以防止 `SQL` 注入攻击，而后者只是单纯地将字符串替换进 `SQL` 语句，不够安全。

另外，你应当发现，返回 `List` 对象时，`xml` 文件中声明的 `resultType` 应当为 `List` 中的对象，更多的规则可以自行搜索。

在这里推荐在 `MySQL` 中使用下划线式命名（因为有些系统可能会全转成小写，驼峰命名不适合阅读），而在 `Java` 中推荐驼峰式命名，只需要在 `application.properties` 中配置 `mybatis.configuration.map-underscore-to-camel-case=true` 即可启用下划线式和驼峰式的自动转换。

### 给 service “入籍”

`service` 用到的注解是 `@Service`。到这里其实没有什么特别的东西了，就直接上个栗子：

```java
public interface UserService {
    boolean register(User user);
    boolean login(User user);
    boolean logout(User user);
}
```

```java
@Service("UserService")
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public boolean register(User user) {
        /* ... */
    }

    @Override
    public boolean login(User user) {
        /* ... */
    }

    @Override
    public boolean logout(User user) {
        /* ... */
    }
}
```

而在 `controller` 中，可以直接使用接口类作为属性即可，不必使用实现类：

```java
@CrossOrigin
@RestController
public class UserController {
    @Autowired
    private UserService userService;
    /* ... */
}
```

## 项目链接

这里给一个已经测试过的链接（其实是老师的作业）：[https://github.com/WilfredShen/HNUTest](https://github.com/WilfredShen/HNUTest)