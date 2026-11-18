package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 欠料异常单创建请求（N7，DEV-083）。
 */
@Data
public class WmsShortageCaseCreateRequest {

    /** 关联缺料预警编号。 */
    private String warningNo;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线。 */
    private String lineCode;

    /** 影响工单（逗号分隔）。 */
    private String affectedWorkOrders;

    /** 责任人（为空时取配置项默认角色）。 */
    private String owner;

    /** 欠料原因。 */
    private String cause;

    /** 临时措施。 */
    private String tempMeasure;

    /** 预计恢复日期。 */
    private LocalDate expectedRecoveryDate;

    private String remark;
}
