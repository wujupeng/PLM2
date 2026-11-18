package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 维修知识库（OA-DEV-079）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_asset_repair_knowledge")
public class OaAssetRepairKnowledge extends BaseEntity {

    /** 知识编号。 */
    private String knowledgeNo;

    /** 资产类别：MACHINE 等。 */
    private String assetCategory;

    /** 故障类型。 */
    private String faultType;

    /** 故障现象。 */
    private String faultSymptom;

    /** 故障原因。 */
    private String faultCause;

    /** 解决方案。 */
    private String solution;

    /** 更换备件。 */
    private String spareParts;

    /** 参考费用。 */
    private BigDecimal referenceCost;

    /** 来源维修单号。 */
    private String sourceRepairNo;

    /** 关键词。 */
    private String keyword;

    /** 命中次数。 */
    private Integer hitCount;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
