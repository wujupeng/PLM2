package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 物料配送任务创建请求（N7，DEV-077）。
 */
@Data
public class WmsDeliveryCreateRequest {

    /** 关联看板编号。 */
    private String kanbanNo;

    /** 任务类型：REPLENISH/RETURN/TRANSFER。 */
    private String taskType;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 来源库位。 */
    private String fromLocationCode;

    /** 目标库位。 */
    private String toLocationCode;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 批次号。 */
    private String batchNo;

    /** 优先级（1 最高）。 */
    private Integer priority;

    private String remark;
}
