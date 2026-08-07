# 云函数接口

所有接口通过 `wx.cloud.callFunction({ name: 'sync' })` 调用，身份由云函数上下文中的 OpenID 确定，客户端不得传入用户ID。

| action | 输入 | 输出 | 说明 |
|---|---|---|---|
| `push` | `state` | `{ok}` | 保存当前用户状态，并同步到情侣空间 |
| `pull` | 无 | `state, partnerState, sharedDraw, spaceId` | 获取自己、伴侣及最新共同抽取数据 |
| `createInvite` | `state` | `code, spaceId` | 创建24小时、一次性邀请码 |
| `joinInvite` | `code, state` | `spaceId` | 加入最多两人的情侣空间 |
| `shareDraw` | `draw` | `{ok}` | 将最新抽取结果同步给伴侣 |
| `unbind` | 无 | `{ok}` | 双方解除空间关系，保留各自用户状态 |

## 错误码

- `UNAUTHORIZED`：无法取得微信身份。
- `INVITE_NOT_FOUND`：邀请码不存在。
- `INVITE_EXPIRED`：邀请码过期或已使用。
- `CANNOT_JOIN_SELF`：不能加入自己创建的邀请。
- `SPACE_FULL`：情侣空间已经有两名成员。
- `NOT_BOUND`：尚未绑定伴侣。

## 数据集合

### users

文档ID为OpenID，保存本人状态和情侣空间ID。

### couple_spaces

保存两个成员OpenID、双方状态快照和最新共同抽取。客户端不得直接访问。

### couple_invites

文档ID为六位邀请码，保存创建人、空间、过期时间和使用状态。
