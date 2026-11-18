package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

/**
 * 办公用品申请保存入参（OA-DEV-081）。
 */
@Data
public class BizOfficeSupplyRequestSaveRequest {

    private LocalDate requireDate;

    private String purpose;

    private String receiverName;

    private String attachmentJson;

    private String remark;

    private List<Item> items;

    /** 是否保存后直接提交审批。 */
    private Boolean submit;

    /** 办公用品申请明细行。 */
    @Data
    public static class Item {

        private Long itemId;

        private String itemCode;

        private String itemName;

        private String unit;

        private BigDecimal requestQty;
    }
}
