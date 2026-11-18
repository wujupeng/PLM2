package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 附件线束端子（DEV-044）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_harness")
public class SpecHarness extends BaseEntity {

    /** 线束编码。 */
    private String harnessCode;

    /** 线束名称。 */
    private String harnessName;

    /** 所属产品编码。 */
    private String productCode;

    /** 关联物料编码。 */
    private String materialCode;

    /** 关联 BOM 头 ID。 */
    private Long bomHeaderId;

    /** 关联 BOM 编码。 */
    private String bomCode;

    /** BOM 位置。 */
    private String bomPosition;

    /** 关联图纸编号。 */
    private String docNo;

    /** 线束总长度。 */
    private BigDecimal totalLength;

    /** 连接器数量。 */
    private Integer connectorQty;

    /** 状态：draft/released 等。 */
    private String status;

    /** 描述。 */
    private String description;

    private String remark;
}
