package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 线束端子保存请求。
 */
@Data
public class SpecHarnessSaveRequest {

    @NotBlank(message = "线束编码不能为空")
    private String harnessCode;

    @NotBlank(message = "线束名称不能为空")
    private String harnessName;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 关联 BOM 头 ID。 */
    private Long bomHeaderId;

    /** 关联 BOM 编码。 */
    private String bomCode;

    /** BOM 位置。 */
    private String bomPosition;

    /** 关联图纸编号。 */
    private String docNo;

    /** 线束总长度。 */
    private BigDecimal totalLength;

    /** 连接器数量。 */
    private Integer connectorQty;

    /** 状态。 */
    private String status;

    /** 描述。 */
    private String description;

    private String remark;

    /** 端子明细。 */
    private List<SpecHarnessTerminalSaveRequest> terminals;
}
