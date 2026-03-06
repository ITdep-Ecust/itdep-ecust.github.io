此页面为网站维护文档，如有任何维护问题请先参照此处。

## 简介

爱心屋运行在 IT 部的服务器上，无论是网站、后台、服务器后端，目前都只能通过校园网访问。Web软件目前使用caddy，网站的后端使用Django（Python开发）框架，数据库使用mysql，服务器虚拟机系统是Ubuntu。全栈维护需要计算机网络、Python、数据库和Linux基础。

- **域名**：`axw.ecust.edu.cn`（`axw.itdep.tech` 是学长的馈赠，似乎会在 2027 年过期，目前已不使用）
  - **后台管理**（主要是爱心屋管理同学使用）：`axw.ecust.edu.cn/admin`
  - **信息导入**：`axw.ecust.edu.cn/User_Admin/batch_add_user`
- **IP地址**：`172.18.58.54`
  - **虚拟机用户名**：`itdep` **虚拟机密码**：常用
- **Linux 后端连接方式**：用ssh，或者用 EXSI 虚拟机管理平台
  - **EXSI 平台IP地址**：`172.18.58.11` **用户名**：`root` **密码**：常用
- **源码仓库上游在 Github**（gitee只是作为中转使用，不要把代码上传到gitee）：[点此处访问，一般需代理](https://github.com/ITdep-Ecust/axw2022/tree/master/)
- **测试环境**：虚拟机 `AXW-TestEnv`
  - **ip地址**：`172.18.58.177`
  - **数据库管理**：`172.18.58.177:81/phpmyadmin/`
  - **启动方式**：先切换至`Django_Axw`虚拟环境，然后输入` python /var/www/html/axw2022/manage.py runserver 0.0.0.0:8000`
  - **源码更新方式**：可以直接在系统修改Django源码。验证成功后可以应用到主源码，**注意测试平台源码和主源码是不同的，不要直接覆盖文件到源码。**
  - **测试环境上网**：请参照部署文档，使用`curl`命令

- **NEW**服务器管理面板
  - **地址**：`https://172.18.58.54:56210/panel`
  - 安全检查时，可以关闭
  - 用户名`admin`，密码常用。
  
## 网站主要功能

管理爱心屋的货物商品登记和爱心币数量，同时可以用学号登录，预定一些商品。

### 服务

服务器上只有三个重要服务：**网站**、**反代**、**数据库**。出了问题只要检查一遍这几个就行了。所有服务都能自启动，非常方便，所以服务器重启后，不需要人工干预，爱心屋的网站理论上是能自动在本地运行的。如何修改服务/查看运行状态/查看日志可以看[这里](https://absx.pages.dev/articles/linux/basic.html#服务)。

1. 网站

   网站是作为服务运行的（服务名称是 `axw`）。

   - Django 会自动检测源代码变化。源码位置：`/var/www/html/axw2022`，一般可以通过 `z axw` 进入。

     - `z` 命令是软件 zoxide 提供的，它是 `cd` 的替代品，可以根据用户习惯模糊搜索进入的目录。

   - **源码更新方式**：上传至github后，在EXSI打开服务器控制台或者用ssh连接，用`git pull`同步仓库源码，最后重启Django。不要直接在后端动源码。如果确需试验代码功能或者实践各类技术，可以去**爱心屋测试平台**。

     - `ssh`命令： `ssh itdep@172.18.58.54` 密码为常用密码

     - `git`命令：
    
       - 先进行网络连接：`~/scripts/srun.sh` 使用老学长的校园网账号密码认证，如果不能用了可以修改一下脚本。
	   
	     或者在`~/scripts`文件夹下 `srun login -s http://172.20.13.100 -u 学号 -p 密码 -d --acid 18` 如果连接超时，Ctrl+C退出然后再次尝试。

       - 命令 `git pull origin master` 即可下载仓库源码，届时需要输入在gitee的账号和密码。
	   
	   - （已通过修改dns服务文件修复）如果提示无法解析域名，请输入 `sudo nano /etc/resolv.conf` 修改DNS配置文件，添加`nameserver 114.114.114.114`即可。

   - Django 重启，即重新拉起 `axw` 服务，请使用以下代码：

    ```
    journalctl -xeu axw
    ```

2. 反代

   之前用 nginx，我改成了用caddy（服务名称 `caddy`）。caddy 的好处是配置非常简单，缺点是性能差了点，不过爱心屋这并发量不差这点性能。

   - caddy 配置在 `/etc/caddy/Caddyfile`，不在仓库源码的范围内，所以请直接在后端修改，改完请 reload。
    
   - 根据信息办要求，我们已经启用以下caddy配置：
   
     - （取消）启用`servers`的`timeouts`设置，以减轻慢速HTTP攻击的影响

	 - 启用了`CSP`、`X-Frame-Options`、`Strict-Transport-Security`、`X-Download-Options`、`X-Permitted-Cross-Domain-Policies`的请求头防护
	 
	 - 拒绝了`OPTIONS`和`PUT`的请求
	 
	 - 拒绝了`.map`文件的访问请求

3. 数据库

   在对数据库进行操作前，请先[备份](https://absx.pages.dev/coding/sql.html#mysql-%E8%BF%90%E7%BB%B4)。

   - `apt`更新数据库老是出毛病，一怒之下放到了docker容器中。现在数据库地址为`172.17.0.1`，端口还是3306，用户名`root`，密码常用。
   
     - 如果要重新配置还是挺麻烦的。首先拉取镜像后使用`microdnf install nano`安装文本编辑器，然后在`/etc/my.cnf`中写入`mysql_native_password=ON`，然后再在数据库中修改用户权限：
	 ```
	 >update user set authentication_string='' where user='root';

     >flush privileges;

     >select user,host from user; ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123';
	 
	 ```
	 
   - 可以在面板里面轻松管理。

   - 配套`phpmyadmin`：http://172.18.58.54:3307/ 也是用docker容器跑，所以如果不安全都是可以在面板关掉的。或者用防火墙。
   
   - 关于数据库的导入：需要上传对应的**media文件夹**。因此，**在导出数据库文件的同时，请下载服务器中 `/var/www/html/axw2022/media` 的文件夹，其中包括各种图片资源，否则网站页面无法正确加载。**

4. 虚拟机系统

   - 虽然我使用 poetry 进行 python 本地开发包管理，但是服务器上搞 poetry 挺麻烦的，所以上面用的还是 conda。虚拟环境名称是 `Django_Axw`。

   - 系统安装了 fish shell，如果想使用可以输入 `fish` 进入，`exit` 退出。
   
   - `↑` 进入历史记录，界面是由 atuin 提供的。选中命令以后按 `Enter` 执行，按 `Tab` 上屏不执行。

5. 关于此目录下的附件

   附件分别是Caddy配置，数据库备份和联网脚本。
   
   - Caddy配置重命名为 `Caddyfile`,放到`/etc/caddy`目录下即可。

   - 脚本请放到`/home/itdep`目录下。比如联网脚本路径应为`/home/itdep/scripts/srun.sh`。
   
### 如果维护时遇到了一些问题，最终解决了，一定要记录于本文档里，便于查找与避坑。

---

## 主要维护问题

### 一. 应对服务器突然断电等情况，没及时将服务挂起造成的服务瘫痪，如何恢复

- 先登录EXSI管理平台。

- 打开 `172.18.58.2` 也就是 router 的电源，否则无法正确配置虚拟机网络。

  - 如需配置路由，**router 管理账号**：`ROS-ESX` **密码**：常用

- 打开 `172.18.58.54`  AXW服务器电源。

- 最后一步：设置。

  （目前已不需要，所有服务在开机后都会自动启动）虚拟机服务器无法自动获取ip地址，需要使用 `dhclient` 进行自动设置。

1. 首先使用 `sudo ip addr show` 查看网络状态，请检查 IPv4 地址是否被正确分配到（图示为正常情况）。

    ![image](.assert/2.png)
  
    如果服务器刚刚重启，没有 DHCP 服务，使用 `sudo dhclient` 开启动态地址服务。
  
    ![image](.assert/3.png)

    之后再次检查 IPv4 地址。一般到此就可以打开网页了。

2. 如果网站页面仍打不开，检查 axw、caddy 服务。
  
    ```
    journalctl -xeu caddy
    journalctl -xeu axw
    ```

    顺序可以颠倒。

    ![image](.assert/4.png)

#### 如果服务没有恢复的话请恢复快照版本，并且注意保护快照版本!

### 二.服务器定期更换证书

注：2025年3月18日网址换为校内内网域名，**新的证书存放于`/var/www/html/cert/axw.ecust.edu.cn/cert.pem`**，同时如果没有需要请不要动`cert.key`文件

1. win+R并输入 `cmd` ，使用sftp命令访问服务器存储： `sftp itdep@axw.itdep.tech`  

2. 用`get`和`put`命令保存旧证书文件，上传新证书文件。证书配置可以在`/etc/caddy/Caddyfile`中找到  

3. 重启Caddy服务

   在Linux系统输入以下命令：
  
   ``` 
   sudo systemctl restart caddy
   ```

### 三.新增认定人员数据如何导入

每学年都会有大量同学成为爱心屋新用户，创建新用户虽然不难，但目前还是交给了IT部来做。以下是方法：

1. 在校园网环境下打开网站： `https://axw.ecust.edu.cn/User_Admin/batch_add_user/`

2. 下载模板，把爱心屋提供的人员信息填进去，**注意学号、姓名、身份证号都是字符类型，表格底部数字为爱心币数量**（eg. 1000）

3. 上传，写下备注，最后submit

注：成功会返回success，若返回overlap.txt表明和已有人员重复，需要删除后再上传。

### 四.如何远程修改数据库

你可以选择在`phpmyadmin`中修改，这很简单。当然，这里也会给出如何使用命令行修改。

首先，请在EXSI平台**保存服务器快照**并备份数据库，然后再进行任何数据修改。

1. （使用`ssh`，跳过此步）远程主机安装 mysql community server
   
   网站地址： `https://dev.mysql.com/downloads/mysql/`

2. CMD用 `cd` 命令进入mysql/bin目录（通常在C盘，可以通过查mysql服务定位），然后校园网环境下输入：

   `mysql -h 172.18.58.54 -u itdep -p`

   然后输入密码（常用）。
   
   **如果使用 `ssh` **,直接输入 `mysql -u itdep -p` 即可。 

3. 使用`show`命令查询数据库、数据表，使用`use`选择数据库，使用`select`输出符合条件的数据。

   修改使用`update`命令。

4. 修改密码比较特殊，由于密码经过加密，无法直接修改。在数据库修改的密码和在登录时所需填写的密码不一致。这是因为密钥头会更改，因此提前在 `axw.itdep.tech/admin` 设置好一个用户的密码然后到数据库复制给其他人比较方便。

### 五.爱心屋网站出现bug或者信息办反馈漏洞怎么办

1. 关于bug

   bug并不是网站加载不出来、用户登不进去等表象，而是系统性的问题。笔者以近期解决的bug问题为例，说明bug修复方法：

   近期，由于爱心屋服务器主板更换，爱心屋网站的下单功能出现了异常。具体表现为：快速点击下单按键会重复下单，限购失效，而且进一步造成后台订单数据错误，需要爱心屋管理人员在后台不断修改数据。最终通过在前端页面增加按钮禁用办法解决了这一问题。

   在修bug过程中，遇到了按钮禁用也卡顿的问题，把对应js代码在html文件中提前解决了这一问题。

   实在无法解决的bug可以求助GPT、学长和信息办老师（不大可能）。

2. 关于漏洞或者各种调整要求

   大部分漏洞可以通过修改Caddyfile（Web通信管理）和settings.py（后端配置）解决。

### 六.更换域名相关事宜（基本不会再发生）

1. 修改`/etc/caddy/Caddyfile`中的域名设置。2025年3月，域名名称为`axw.ecust.edu.cn`。

2. 修改`/var/www/html/axw2022/Django_Axw/settings.py`中的`CSRF_TRUSTED_ORIGINS`设置和`ALLOWED_HOSTS`设置。

3. 在`qzzx.ecust.edu.cn/admin`中修改友情链接爱心屋网站域名。

### 七.服务器如何备份

关于备份和快照的区别，请参照[此处](https://blog.csdn.net/Rex_WUST/article/details/96349878)。

关于Linux系统如何备份和恢复，请参照[此处](https://blog.csdn.net/Chiyunyinlong/article/details/119430236)。

连接上服务器后，输入以下指令即可在`/`目录下生成`backup.tgz`备份文件：

```
cd /
tar cvpzf backup.tgz --exclude=./proc --exclude=./lost+found --exclude=backup.tgz --exclude=./mnt --exclude=./sys --exclude=./media ./
```

备份时间很长，请耐心等待。备份后**请重命名`backup.tgz`并妥善保存**好该文件。

目前保存在IT的电脑里，位置：`F:/服务器tar备份`

为了预防服务器数据丢失，我写了一个自动备份数据库并上传到gitee仓库和IT电脑的脚本，即 `~/scripts/AXWbak.sh`。

所有数据库备份文件都经过加密，解密方式为 `openssl enc -d -aes-256-cbc -in backup.enc -out backup.sql -pass pass:"*"` `*`处是常用密码。

**对于虚拟机硬盘的操作，比如扩容等，请先tar备份。**

- 25年5月因为扩容格式错误导致系统损坏，非常难搞。最后是靠tar备份提取数据库文件才修复的。