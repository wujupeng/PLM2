package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import lombok.Data;

/**
 * 维修知识库保存入参（OA-DEV-079）。
 */
@Data
public class BizAssetKnowledgeSaveRequest {

    /** 资产类别：可配置字典 oa_asset_category。 */
    private String assetCategory;

    private String faultType;

    private String faultSymptom;

    private String faultCause;

    private String solution;

    private String spareParts;

    private BigDecimal referenceCost;

    private String sourceRepairNo;

    private String keyword;

    private String remark;
}
