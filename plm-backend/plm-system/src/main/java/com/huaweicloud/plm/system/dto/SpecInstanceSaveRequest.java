package com.huaweicloud.plm.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 技术规格实例保存请求，取值列表整体提交。
 */
@Data
public class SpecInstanceSaveRequest {

    @NotBlank(message = "实例编码不能为空")
    private String instanceCode;

    /** 来源模板 ID，传入后按模板字段自动生成取值行。 */
    private Long templateId;

    /** 来源模板编码。 */
    private String templateCode;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 版本号，缺省为 V1。 */
    private String versionNo;

    /** 状态：draft/released/obsolete。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    private String remark;

    /** 取值列表。 */
    @Valid
    private List<SpecInstanceValueSaveRequest> values;
}
