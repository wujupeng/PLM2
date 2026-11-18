package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/**
 * 生产顺序表保存入参（OA-DEV-065）。排产权威归属待与 MES 确认。
 */
@Data
public class BizProductionSequenceSaveRequest {

    private String sequenceName;

    private Integer sequenceVersion;

    private String planPeriod;

    private String workshop;

    /** 计划来源：oa_plan_source（OA/MES/ERP）。 */
    private String planSource;

    private Long ownerUserId;

    private String ownerName;

    private String remark;

    private List<Item> items;

    /** 生产顺序明细行。 */
    @Data
    public static class Item {

        private String orderNo;

        private String materialCode;

        private String materialName;

        private BigDecimal planQty;

        private LocalDateTime planStart;

        private LocalDateTime planEnd;

        private String workstation;

        private Integer priorityNo;

        private String remark;
    }
}
