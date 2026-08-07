# 开源与敏感信息安全说明

## 已脱敏配置

| 文件 | 占位值 | 真实值获取位置 |
|---|---|---|
| `project.config.json` | `appid: "XXXXXXXX"` | 微信公众平台 → 开发 → 开发管理 → 开发设置 |
| `miniprogram/config.js` | `envId: "XXXXXXXX"` | 微信开发者工具 → 云开发控制台 → 环境设置 |

本项目不需要、也不应在小程序客户端保存微信 AppSecret。云函数通过微信运行上下文识别用户。

## 本地配置流程

1. 克隆仓库后，在本地替换两个 `XXXXXXXX`。
2. 不要提交替换后的文件；提交前使用 `git diff` 检查。
3. `project.private.config.json`、`.env*`、`*.local.js` 和输出目录已加入 `.gitignore`。

## 提交前安全检查

可在仓库根目录运行：

```powershell
rg -n --hidden "wx[0-9a-fA-F]{16}|cloud1-[A-Za-z0-9-]+|sk-[A-Za-z0-9_-]+|appsecret|api[_-]?key|token" .
```

正常情况下只应命中文档里的示例规则或说明，不应出现真实值。

还应检查：

- Git 历史中是否曾经提交真实配置。
- `outputs`、备份、压缩包、截图和日志中是否包含真实值。
- GitHub Actions、仓库 Secrets 和第三方平台变量是否配置正确。
- 云数据库是否禁止客户端直接读写。

## 如果密钥已经泄露

- AppSecret 或第三方 API Key：立即在对应平台重置或撤销。
- 云环境 ID：它通常不是单独的认证密钥，但仍应移除，并检查数据库权限和调用日志。
- AppID：它是应用标识而非服务端密钥，但公开前仍可按项目要求脱敏。
- 已进入 Git 历史的值不能只靠最新提交删除，应使用历史清理工具并重新检查远端分支和标签。
