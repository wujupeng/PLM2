package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 标准工艺保存请求（对应 G3-N7b ERP 工艺资源）。
 */
@Data
public class ErpProcessStandardSaveRequest {

    /** 标准工艺编码。 */
    @NotBlank(message = "标准工艺编码不能为空")
    private String standardCode;

    /** 标准工艺名称。 */
    private String standardName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 版本号。 */
    private String versionNo;

    /** 工艺路线编码。 */
    private String routeCode;

    /** 标准工时，为空默认 0。 */
    private BigDecimal standardHours;

    /** 准备工时，为空默认 0。 */
    private BigDecimal setupHours;

    /** 工序数，为空默认 0。 */
    private Integer operationCount;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 标准状态，为空默认 DRAFT。 */
    private String standardStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
