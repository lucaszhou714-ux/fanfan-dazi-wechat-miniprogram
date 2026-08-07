# GitHub 发布检查清单

## 发布前

1. 确认 `project.config.json` 的 `appid` 为 `XXXXXXXX`。
2. 确认 `miniprogram/config.js` 的 `envId` 为 `XXXXXXXX`。
3. 确认仓库中没有 AppSecret、API Key、Token、OpenID、真实邀请码或用户照片。
4. 不提交 `outputs/`、`work/` 和 `project.private.config.json`。
5. 运行项目测试与敏感信息扫描。

## 建议命令

```powershell
git init
git add .
git status
git diff --cached
```

确认暂存列表中没有本地配置和输出文件后再提交：

```powershell
git commit -m "chore: open source initial release"
```

然后在 GitHub 创建空仓库，并按照 GitHub 页面给出的地址添加远端和推送。

## GitHub 仓库建议内容

- 仓库简介：`情侣吃饭决策、双人饮食记录与菜谱发现微信小程序`
- Topics：`wechat-miniprogram`、`cloudbase`、`couple-app`、`meal-planner`、`javascript`
- 默认分支：`main`
- 建议启用：Secret scanning、Dependabot alerts、分支保护。

## 重要提醒

上传源码到 GitHub 不等于发布微信小程序；微信体验版和正式版仍需通过微信开发者工具及微信公众平台管理。
