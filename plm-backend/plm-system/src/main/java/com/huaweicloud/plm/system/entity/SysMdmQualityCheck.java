package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据平台—质量校验（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记主数据完整性/一致性/唯一性等校验结果与评分。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_quality_check")
public class SysMdmQualityCheck extends BaseEntity {

    /** 校验记录编号（唯一）。 */
    private String checkNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 主数据编码。 */
    private String masterCode;

    /** 校验项。 */
    private String checkItem;

    /** 校验结果，默认 PASS。 */
    private String checkResult;

    /** 校验评分，默认 100。 */
    private Integer score;

    /** 校验信息。 */
    private String message;

    /** 校验时间。 */
    private LocalDateTime checkTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
