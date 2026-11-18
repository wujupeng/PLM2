package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 需求分发请求（N6，DEV-070）。
 */
@Data
public class EdiDemandDispatchRequest {

    @NotBlank(message = "需求编号不能为空")
    private String demandNo;

    /** 指定供应商编码清单，为空时按物料全部供货关系分发。 */
    private List<String> supplierCodes;

    /** 分配规则：BY_SUPPLIER_SHARE/PRIORITY/MANUAL，为空取配置默认值。 */
    private String allocationRule;

    /** 发送渠道：API/MAIL/EDI。 */
    private String sendChannel;

    private String remark;

    /** 是否分发后立即发送。 */
    private Boolean autoSend;
}
