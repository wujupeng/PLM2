package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工程变更对象明细保存请求。
 */
@Data
public class EcoChangeItemSaveRequest {

    @NotBlank(message = "变更对象类型不能为空")
    private String objectType;

    @NotBlank(message = "变更对象编码不能为空")
    private String objectCode;

    /** 变更对象名称。 */
    private String objectName;

    /** 变更动作：add/modify/delete/switch，为空时默认 modify。 */
    private String changeAction;

    /** 变更前版本。 */
    private String beforeVersion;

    /** 变更后版本。 */
    private String afterVersion;

    private String remark;
}
