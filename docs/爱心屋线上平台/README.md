# axw2022 - 华东理工大学爱心屋线上平台

## 什么是爱心屋？

爱心屋主体位于大学生活动中心107室。

主要有两个功能：

- 当做会议室

- 售卖物品

网站负责管理虚拟货币“爱心币”的订单交易。绿色通道和家庭经济困难的同学可以用“爱心币”购买物品。

![image](asserts/1.png)

## 仓库说明
本项目的主仓库托管于 [Github](https://github.com/ITdep-Ecust/axw2022) ，国内镜像为 [Gitee](https://gitee.com/ecust_itdep/axw2022) ，为保障代码一致性，请注意以下事项：

### 代码提交规范

- 所有源码修改请**一律**提交至 [GitHub 主仓库](https://github.com/ITdep-Ecust/axw2022)

### 自动同步机制
- 在 GitHub Actions 中配置了自动化工作流，当主仓库检测到新提交后，Github 将自动向 Gitee 仓库推送相同改动
- 同步一般需要 1~2 分钟完成，可通过 [GitHub Actions 面板](https://github.com/ITdep-Ecust/axw2022/actions) 监控同步状态
- 工作流配置文件存放在 `.github\workflows\main.yml` ，目前仅自动检测 master 分支的提交改动。若后续要新增分支，请注意更新配置文件 

### 镜像仓库说明

- Gitee 仓库为只读镜像，**禁止**将改动直接提交至 Gitee
- 完成自动同步后，可在服务器控制台执行 `git pull` 命令同步更改
- 由于 Gitee 存在仓库协作人数上限，如**确有必要**查看镜像仓库状况，请联系组织管理员给予仓库访问权限

## To Do List

- [x] 订单管理逻辑 remake，统一移至 DjangoAdmin
- [ ] 导入功能 remake
  - [ ] 移至 DjangoAdmin
  - [x] 改用 pandas 读入
  - [ ] 用 Series 增强易读性
- [ ] 客户订单管理 remake，客户信息收集/密码修改功能
- [x] 下单逻辑 remake，限购逻辑 remake
- [x] 前端页面优化
  - [x] 商品搜索功能
- [ ] 饼：OAuth
- [ ] 改用 postgresql

## 爱心屋服务器维护

相关内容请参照[/maintenance](maintenance/readme.md)。

## 服务器重新部署

相关内容请参照[/deploy](deploy/readme.md)。


