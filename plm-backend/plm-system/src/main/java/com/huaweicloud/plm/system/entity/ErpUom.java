package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 基础资料—计量单位业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 记录计量单位的编码、类型与小数精度等主数据，
 * 供物料、库存、采购、销售等业务统一引用。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_uom")
public class ErpUom extends BaseEntity {

    /** 计量单位档案编号（唯一，支持人工指定，为空时自动生成）。 */
    private String uomNo;

    /** 计量单位编码。 */
    private String uomCode;

    /** 计量单位名称。 */
    private String uomName;

    /** 计量单位类型，默认 BASE。 */
    private String uomType;

    /** 小数精度位数，默认 0。 */
    private Integer precisionDigits;

    /** 计量单位状态，默认 ACTIVE。 */
    private String uomStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
