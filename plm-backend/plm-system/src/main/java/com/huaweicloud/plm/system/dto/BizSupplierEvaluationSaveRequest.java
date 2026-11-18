package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

/**
 * 供方考评保存入参（OA-DEV-068）。评分规则、权重与等级阈值均为可配置项。
 */
@Data
public class BizSupplierEvaluationSaveRequest {

    /** 考评周期：oa_eval_period（MONTH/QUARTER/YEAR）。 */
    private String evalPeriod;

    private Integer evalYear;

    private Integer evalQuarter;

    private Integer evalMonth;

    private String supplierCode;

    private String supplierName;

    private String evalBasis;

    private String evalOpinion;

    private String attachmentJson;

    private String remark;

    private Boolean submit;

    private List<Item> items;

    /** 考评评分项。 */
    @Data
    public static class Item {

        private String itemCode;

        private String itemName;

        private BigDecimal weight;

        private BigDecimal maxScore;

        private BigDecimal score;

        private String scoreBasis;

        private String remark;
    }
}
