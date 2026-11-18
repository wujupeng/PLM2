package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * SOP作业指导书保存请求。
 */
@Data
public class MesSopSaveRequest {

    /** SOP单号（为空时自动生成）。 */
    private String sopNo;

    /** SOP名称。 */
    private String sopName;

    /** 工艺编码。 */
    private String processCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** SOP版本。 */
    private String sopVersion;

    /** 附件名称。 */
    private String fileName;

    /** 附件地址。 */
    private String fileUrl;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** SOP状态，为空默认 DRAFT。 */
    private String sopStatus;

    /** 编制人。 */
    private String author;

    /** 发布时间。 */
    private LocalDateTime publishTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
