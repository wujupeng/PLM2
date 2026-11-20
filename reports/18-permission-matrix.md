# 第二轮角色权限矩阵

## 结果

任务书草案中的 12 个角色，以及额外要求验证的研发经理孙八，均为 **BLOCKED**。本轮没有通过系统创建或验证任何测试账号，因此没有把“菜单未显示”或未经认证的 API 响应解释为角色权限结果。匿名 `/api/auth/me` 和 `/api/system/users` 返回 401 属于认证守卫冒烟，不属于此岗位矩阵验证。

| 角色 | 用户名 | 登录 | 菜单/按钮 | API 权限 | 结论 |
|---|---|---|---|---|---|
| 张三（销售） | zhangsan | 未测 | 未测 | 未测 | BLOCKED |
| 李四（销售经理） | lisi | 未测 | 未测 | 未测 | BLOCKED |
| 王五（采购员） | wangwu | 未测 | 未测 | 未测 | BLOCKED |
| 赵六（采购经理） | zhaoliu | 未测 | 未测 | 未测 | BLOCKED |
| 钱七（研发） | qianqi | 未测 | 未测 | 未测 | BLOCKED |
| 孙八（研发经理） | sunba | 未测 | 未测 | 未测 | BLOCKED |
| 周九（计划） | zhoujiu | 未测 | 未测 | 未测 | BLOCKED |
| 吴十（车间） | wushi | 未测 | 未测 | 未测 | BLOCKED |
| 郑十一（质检） | zhengyi | 未测 | 未测 | 未测 | BLOCKED |
| 王十二（仓管） | wanger | 未测 | 未测 | 未测 | BLOCKED |
| 冯十三（财务） | fengsan | 未测 | 未测 | 未测 | BLOCKED |
| 陈总 | chenzong | 未测 | 未测 | 未测 | BLOCKED |
| guest | guest_qk | 未测 | 未测 | 未测 | BLOCKED |

销售/采购审批工作分离、跨部门对象水平越权、岗位纵向越权、BOM 发布和财务只读均未验证。管理员 `admin_qk` 也未配置凭据。
