package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 标签模板保存请求（对应 WBS G3-N7a ERP 条码管理）。
 */
@Data
public class ErpBarcodeTemplateSaveRequest {

    /** 模板编码。 */
    @NotBlank(message = "模板编码不能为空")
    private String templateCode;

    /** 模板名称。 */
    private String templateName;

    /** 模板类型，为空默认 MATERIAL。 */
    private String templateType;

    /** 标签宽度，为空默认 40。 */
    private BigDecimal labelWidth;

    /** 标签高度，为空默认 30。 */
    private BigDecimal labelHeight;

    /** 内容配置。 */
    private String contentConfig;

    /** 打印权限。 */
    private String printPermission;

    /** 模板状态，为空默认 ACTIVE。 */
    private String templateStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
