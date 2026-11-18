package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 切换门户入口与身份保存请求（OA-DEV-116）。
 */
@Data
public class OaEntrySwitchSaveRequest {

    /** 切换编号。 */
    private String switchNo;

    /** 切换名称。 */
    @NotBlank(message = "切换名称不能为空")
    private String switchName;

    /** 切换类型：PORTAL/SSO/MOBILE。 */
    private String switchType;

    /** 旧入口。 */
    private String oldEntry;

    /** 新入口。 */
    private String newEntry;

    /** 切换方案。 */
    private String switchPlan;

    /** DNS 缓存时间（分钟）。 */
    private Integer dnsTtlMinutes;

    /** 是否启用 SSO：1 启用，0 停用。 */
    private Integer ssoEnabled;

    /** 是否启用移动端：1 启用，0 停用。 */
    private Integer mobileEnabled;

    /** 切换状态：PENDING/DONE/ROLLBACK。 */
    private String switchStatus;

    /** 切换时间（yyyy-MM-dd HH:mm:ss）。 */
    private String switchTime;

    /** 验证结果。 */
    private String verifyResult;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
