package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 追溯关联保存请求。
 */
@Data
public class MesTraceLinkSaveRequest {

    /** 追溯关联编号（为空时自动生成）。 */
    private String linkNo;

    /** 对象类型，为空默认 SERIAL。 */
    private String objectType;

    /** 对象编码。 */
    @NotBlank(message = "对象编码不能为空")
    private String objectCode;

    /** 关联类型，为空默认 PERSON。 */
    private String linkType;

    /** 关联编码。 */
    private String linkCode;

    /** 关联名称。 */
    private String linkName;

    /** 关联取值。 */
    private String linkValue;

    /** 关联时间。 */
    private LocalDateTime linkTime;

    /** 操作人。 */
    private String operator;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
