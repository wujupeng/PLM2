package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * BOM 头保存请求。
 */
@Data
public class BomSaveRequest {

    @NotBlank(message = "产品编码不能为空")
    private String productCode;

    private Long productId;

    @NotBlank(message = "BOM 类型不能为空")
    private String bomType;

    /** 业务版本号，为空时默认 V1。 */
    private String versionNo;

    /** 状态，为空时默认 draft。 */
    private String status;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private String description;

    private String remark;
}
