package com.huaweicloud.plm.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 工艺路线保存请求。
 */
@Data
public class ProcessRouteSaveRequest {

    @NotBlank(message = "路线编码不能为空")
    private String routeCode;

    @NotBlank(message = "路线名称不能为空")
    private String routeName;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 版本号，为空时默认 V1。 */
    private String versionNo;

    /** 工艺版本。 */
    private String processVersion;

    /** 状态，为空时默认 draft。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 描述。 */
    private String description;

    private String remark;

    /** 工序明细。 */
    @Valid
    private List<ProcessOperationSaveRequest> operations;
}
