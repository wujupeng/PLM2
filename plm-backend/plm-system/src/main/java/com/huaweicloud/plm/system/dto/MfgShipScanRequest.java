package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 出货扫码请求（N8，DEV-091）。
 */
@Data
public class MfgShipScanRequest {

    /** 扫描码（单件码/箱码/物料批次码）。 */
    @NotBlank(message = "扫描码不能为空")
    private String scanCode;

    /** 扫描类型：PACKAGE/SERIAL/MATERIAL_BATCH（留空按码自动识别）。 */
    private String scanType;

    /** 数量（按箱扫描时使用）。 */
    private BigDecimal qty;

    /** 操作人。 */
    private String operator;

    private String remark;
}
