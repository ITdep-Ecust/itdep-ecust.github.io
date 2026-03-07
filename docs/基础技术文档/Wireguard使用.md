# WG食用完全指南

## 前言

要想精通计算机网络，虚拟局域网技术一定必不可少。在校园网入站封闭的环境下，通过虚拟局域网技术构建内网穿透非常有必要；更不用说即使 **在校园网的环境下，IT部也无法访问勤助中心的服务器命令行**，所以必须依靠穿透。

那么虚拟局域网究竟是什么原理呢？笔者尚未学习过计算机网络，但通过实践所得经验，可以将其做一个简单的阐释（如有错误，及时修正）：一台公网可访问的、固定ip或者域名的服务器作为所有我们想要连在一起的机器（包括wall内、wall外）的路由，其余的机器向它传递信息进行转发。从理论上讲，通过联网，所有的无论公网内网的机器都可以与之连接。这台公网机器将互相之间要传输的数据进行转发，就如同和网站交换信息一样顺利。

## 第一部分：Wireguard

Wireguard这款软件的作用就是协调好虚拟局域网中机器之间的关系。想象一个真实的局域网环境，所有的机器都直接或通过交换机间接与路由器相连，因此路由器仅需将建立实际连接的机器分配一个ip地址，那么tcp等协议便能生效，机器之间就可以无阻碍地访问。但是在虚拟局域网中，连接必须借助公共互联网，因此机器之间要想确认彼此的身份，必须提供密钥。当第一台机器的公钥（密钥公开部分）被第二台机器收到后，与第二台机器内部提前保存的密钥（密钥私密部分）相匹配时，第二台机器就可以相信是要相互连接的机器。同时，由于虚拟局域网并非真实的连接，ip也是要提前约定好的，不存在dhcp的功能。而Wireguard的作用就是验证密钥并且传递ip信息。

## 第二部分：Ubuntu配置

本文以Ubuntu-server作为公网服务器的系统搭建Wireguard服务器，客户端系统任意。构建的结果是所有客户端，和任意客户端以及Ubuntu-server都是联通的，前提仅仅是客户端联网并运行wireguard和相应配置。

那么现在开始搭建。首先需要确保以下设置，本文不多叙述：

1. 公网服务器固定公网ip或者域名可访问

2. 公网服务器开启一个UDP端口供wireguard使用，默认应为51820

3. 决定好你的内网网段，本文使用10.77.0.0

至此准备完毕。搭建具体步骤如下：

### 1.Ubuntu安装wireguard:
```
sudo apt update & sudo apt install wireguard -y
```	

### 2.生成服务端密钥对
```
umask 077
wg genkey | tee server_private.key | wg pubkey > server_public.key
```

执行成功之后，会在执行目录生成两个文件。私钥文件需要写在服务端配置中，公钥文件需要写在客户端配置中:

- server_private.key（服务端私钥）
- server_public.key（服务端公钥）

### 3.服务端wireguard配置
```
sudo wg show
touch /etc/wireguard/wg0.conf
wg-quick save wg0
wg-quick down wg0
sudo nano /etc/wireguard/wg0.conf
```	

输入：
```
[Interface]
Address = 10.77.0.1/24 #作为路由的ip
ListenPort = 51820    #udp开放端口
PrivateKey = 服务端私钥
```	

## 第三部分：客户端安装wireguard

不同系统参照不同安装，这里不再阐述
Ubuntu和上文类似，这里以windows系统为例
启动wireguard后，创建空白配置文件，可以看到公钥和私钥
补充配置：

```
[Interface]
PrivateKey = 图示自动生成的私钥
Address = 10.77.0.11/24  #作为本机内网的ip
DNS = 114.114.114.114
MTU = 1420
[Peer]
PublicKey = 服务端公钥
AllowedIPs = 10.77.0.0/16 #内网网段/16
Endpoint = 公网ip/域名:51820
PersistentKeepalive = 25
```

然后回到服务端，补充配置：
```
[Peer]
PublicKey = windows图示生成公钥
AllowedIPs = 10.77.0.11/32
```

之后记得运行：
```
wg-quick up wg0
systemctl enable wg-quick@wg0 –now
```

确保开机自启。

现在windows端连接后，ping 10.77.0.1。能够ping通则隧道建立成功。
