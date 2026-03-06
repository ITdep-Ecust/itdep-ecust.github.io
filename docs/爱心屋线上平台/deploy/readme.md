## 这篇文档的由来

在IT工作的几个月里，爱心屋服务器有时会出现bug，需要我们员工来修。

然而，对于我这样的rookie而言，一步到位的修复是不可能的，我常常需要多次提交测试才能弄清楚修改的方式。由于爱心屋网站一直处于活跃状态，测试会影响到爱心屋的工作，因此现在非常有必要再部署一个测试环境。幸运的是，在25年过年期间，在不断摸索下，我成功再次部署了爱心屋网站，并写下这篇教程，正好作为部署教程，供所有为爱心屋网站服务的同学查看。

本人创建的虚拟机名称为：`AXW-TestEnv`。

#### 重要：本文如有错误或过时的内容，请联系作者：2329537849@qq.com。在此提前感谢您的勘误！

## I. 系统和环境搭建

虚拟机建立系统就使用EXSI里保存的ubuntu系统镜像即可。在EXSI管理界面增加新的虚拟机，并安装相应系统。

- 关于虚拟机资源分配：具体可以在EXSI中查询。axw配置：2CPU，2GB内存，24GB存储空间。

- 进入虚拟机后，**用户名**请设置为`itdep`，**密码**请设置为**常用密码**。

- 关于如何联网
  - 首先必须要保证ROS所对应的虚拟机是开启状态。
  - 注意在系统安装过程中请勾选安装ssh（即openssh），进入系统后首先启动ssh服务，并设为自启动服务，具体请看[这里](https://blog.csdn.net/GitHub_miao/article/details/135050696)。
    - 使用ssh远程连接而不是直接在exsi操作的好处在于，你可以复制我写好的命令，右键在cmd中粘贴。我想你肯定不想一个一个字母手敲吧？
  - 输入该指令，登录校园网认证：`curl -d "username=学号&password=认证密码" http://172.20.13.100/index_18.html`
    - `curl` 命令可以模拟浏览器访问，并且返回网页源代码。如果需要测试登录页面，可输入 `curl -v http://172.20.13.100/`，具体请看[这里](https://blog.csdn.net/u013514928/article/details/102810250)。
    - 如果仍然无法联网，请重启系统：`sudo reboot` 。

- ubuntu逻辑分区存储可能需要扩容一下，可以参考这篇[解决 Linux /dev/mapper/ubuntu--vg-ubuntu--lv 磁盘空间不足的问题](https://blog.csdn.net/Fly_1213/article/details/105142427)和[【linux】lsblk和df -h显示的磁盘信息不同](https://blog.csdn.net/weixin_59128094/article/details/135427721)。
    
联网之后，就可以下载相应的软件了。安装时请在命令前加上 `sudo` 命令。

首先是web服务器软件，apache、nginx、iis、caddy都可以，哪一种熟悉就用哪一种。我在家里尝试的时候使用的是 `apache2`，最好使用现在（2025.01）爱心屋服务器使用的 `caddy`，这样更换证书和修漏洞都是可以直接照抄的。当然，相应的扩展要下载齐全，apache2可以参照这篇[文章](https://blog.csdn.net/adMan_kpa/article/details/79571651)。

[caddy安装文档](https://caddy2.dengxiaolong.com/docs/install)

你可以直接用我的caddy配置，在附件中有。

其次是mysql，使用如下命令安装：

  `sudo apt-get update`

  `sudo apt-get install mysql-client`

  `sudo apt-get install mysql-server`

  `sudo mysql_secure_installation` 

按照提示输入信息即可。参考[文章](https://blog.csdn.net/lianghecai52171314/article/details/113807099)。

- 数据库名：`AXW`，根用户名：`root`，密码请设置为常用密码。

- mysql装好后需要建立数据库。
  - `mysql -u root -p` 登录数据库。
  - `create DATABASE AXW;` 即可建立所需数据库。
  - 如果在启动时想要以root用户名登录数据库（settings.py里），那么请输入该指令：`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '这里改成常用密码';`。

然后是python。首先安装conda，直接复制以下代码即可。如果conda有更新可以更换为新版本，只要把sh文件名称换一下即可。

  `wget -c https://repo.anaconda.com/archive/Anaconda3-2024.10-1-Linux-x86_64.sh`

conda默认会安装在 `/home/itdep` 目录下，可以修改。注意，安装时会询问是否需要添加环境变量，如果不会在linux系统中添加，请输入 `yes`。总之想省事一路 `yes` 就行了，然后输入以下指令刷新环境变量：

  `source /home/itdep/.bashrc`

想要卸载conda也很简单，直接删除 `/home/itdep/anaconda3` 文件夹即可。

  `rm -rf /home/itdep/anaconda3`

安装成功后，输入以下指令，若返回conda版本信息，则conda安装成功。

  `conda -V`
  
要创建python3.9的虚拟环境，指令如下（-n后面的名称任意）：

  `conda create -n Django_Axw python==3.9`

想要删除虚拟环境：
  
  `conda remove -n Django_Axw --all`

创建好之后启动虚拟环境：

  `conda activate Django_Axw`

启动成功后用户名前面会出现 `(axw2022)` 的前缀。

## II. 库安装

接下来就是安装所需的库。最好先换源，pip和conda都要，怎么换源就不详细说明了。安装库可以使用git仓库里面的requirement.txt文件，也可以复制下面的代码（已使用清华源）。

  `pip install Django django-simpleui django-imagekit pymysql pandas cryptography django-cors-headers Pillow -i https://pypi.tuna.tsinghua.edu.cn/simple/`

不要忘记清理缓存，输入以下指令：

  `conda clean --all`

  `pip cache purge`

## III. 启动

安装好库文件之后，先把git仓库pull下来，把python配置设置好。这里是pull到了 `/var/www/html/axw2022`

然后要连接数据库，关键在于 `settings.py`。首次启动需要注释掉 `staticfile_dirs` 设置，启用 `static_root` 设置。第一次启动完成后再改回来。可以使用我已经改好的 `settings.py` 文件，在附件中有。

启动的话，`cd /var/www/html/axw2022`，再按照如下次序依次启动即可。
    
  ```
    python manage.py makemigrations
    python manage.py migrate
    python manage.py createsuperuser
    python manage.py collectstatic
    python /var/www/html/axw2022/manage.py runserver 0.0.0.0:8000
  ```

最后校内访问：IT部测试平台为172.18.58.177.

## 其他讯息

报错：
- > "Can't connect to local MySQL server through socket '/tmp/mysql.sock`
  - `sudo find / -name mysql.sock` 然后 `ln -s <path/to/mysqld.sock> /tmp/mysql.sock`
- `Error loading MySQLdb module`
  - [Django运行报错： Error loading MySQLdb module解决办法](https://blog.csdn.net/jyr2014/article/details/126712167)
  - 使用附件中的__init__.py文件（settings.py同目录）。