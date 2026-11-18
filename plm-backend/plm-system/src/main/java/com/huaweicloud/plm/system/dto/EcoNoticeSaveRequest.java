package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工程变更通知（ECN）保存请求。
 */
@Data
public class EcoNoticeSaveRequest {

    @NotBlank(message = "通知标题不能为空")
    private String title;

    /** 通知内容。 */
    private String content;

    @NotBlank(message = "通知对象类型不能为空")
    private String targetType;

    /** 通知对象编码。 */
    private String targetCode;

    /** 通知对象名称。 */
    private String targetName;

    private String remark;
}
