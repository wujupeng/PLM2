package com.huaweicloud.plm.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 技术规格模板保存请求，字段明细整体提交。
 */
@Data
public class SpecTemplateSaveRequest {

    @NotBlank(message = "模板编码不能为空")
    private String templateCode;

    @NotBlank(message = "模板名称不能为空")
    private String templateName;

    /** 产品系列。 */
    private String productSeries;

    /** 产品编码。 */
    private String productCode;

    /** 规格分类。 */
    private String specCategory;

    /** 版本号，缺省为 V1。 */
    private String versionNo;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 描述。 */
    private String description;

    private String remark;

    /** 字段明细列表。 */
    @Valid
    private List<SpecTemplateFieldSaveRequest> fields;
}
