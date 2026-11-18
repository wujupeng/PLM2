package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 交期延误协调单保存入参（OA-DEV-064）。
 */
@Data
public class BizDeliveryCoordinationSaveRequest {

    private String orderNo;

    private String customerCode;

    private String customerName;

    private String materialCode;

    private String materialName;

    private BigDecimal demandQty;

    private LocalDate originalDelivery;

    private LocalDate promisedDelivery;

    private String delayReason;

    private String capacityNote;

    private String shortageReason;

    private String responsibleDept;

    private Long responsibleUserId;

    private String responsibleName;

    private String correctiveAction;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
