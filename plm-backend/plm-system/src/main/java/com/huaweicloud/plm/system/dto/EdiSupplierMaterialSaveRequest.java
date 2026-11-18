package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 供应商供货关系保存请求。
 */
@Data
public class EdiSupplierMaterialSaveRequest {

    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 供货份额百分比。 */
    private BigDecimal sharePct;

    /** 交付提前期（天）。 */
    private Integer leadTimeDays;

    /** 优先级。 */
    private Integer priority;

    /** 发送渠道：API/MAIL/EDI。 */
    private String sendChannel;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    private String remark;
}
