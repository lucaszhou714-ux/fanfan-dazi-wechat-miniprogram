# 饭饭搭子

一个面向情侣的微信小程序：到饭点时快速决定吃什么，吃完顺手记录，并与伴侣共享两个人的饮食日常。

## 功能

- 今天：根据预算与忌口快速决定一餐，每日限制选择次数。
- 记录：拍照、文字和详细饮食记录组成双人时间线。
- 发现：本周尝鲜主题、菜谱、步骤与收藏。
- 我们：情侣邀请绑定、相伴天数、情侣奖励和个人偏好。
- 云同步：基于微信云开发同步双方状态和图片。

## 快速开始

1. 注册微信小程序并取得 AppID。
2. 将 `project.config.json` 中的 `XXXXXXXX` 替换为自己的 AppID。
3. 开通微信云开发，将 `miniprogram/config.js` 中的 `XXXXXXXX` 替换为自己的环境 ID。
4. 按照 `docs/DEPLOYMENT.md` 创建数据库集合并部署云函数。
5. 使用微信开发者工具导入仓库根目录。

公开仓库中没有真实 AppID、云环境 ID、AppSecret 或第三方 API Key。请勿提交本地真实配置。

## 文档

- 产品说明：`docs/PRODUCT.md`
- 系统架构：`docs/ARCHITECTURE.md`
- 部署手册：`docs/DEPLOYMENT.md`
- 云函数接口：`docs/API.md`
- 测试方案：`docs/TEST-PLAN.md`
- 开源安全说明：`docs/OPEN_SOURCE_SECURITY.md`

## 技术栈

- 微信小程序原生 WXML / WXSS / JavaScript
- 微信云开发、云函数、云数据库、云存储
- 本地缓存与云端状态同步

## 免责声明

饮食标签和周趋势仅用于生活记录，不构成医疗或营养建议。
