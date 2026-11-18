package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * G1-N5 多组织多工厂通用分页查询条件。
 * 各字段按业务对象选择性使用：legalCode/factoryCode（层级归属）、
 * legalStatus/factoryType/factoryStatus/warehouseType/warehouseStatus/lineType/lineStatus（状态与类型）、
 * grantType/grantStatus/scopeType（跨组织授权）、
 * startDate/endDate（时间区间，作用于创建时间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OrgQuery extends PageQuery {

    /** 法人编码。 */
    private String legalCode;

    /** 工厂编码。 */
    private String factoryCode;

    /** 法人状态：ACTIVE/DISABLED。 */
    private String legalStatus;

    /** 工厂类型：MANUFACTURE/ASSEMBLY/WAREHOUSE/OEM。 */
    private String factoryType;

    /** 工厂状态：ACTIVE/DISABLED。 */
    private String factoryStatus;

    /** 仓库类型：RAW/SEMI/FINISHED/SPARE/INTRANSIT。 */
    private String warehouseType;

    /** 仓库状态：ACTIVE/DISABLED。 */
    private String warehouseStatus;

    /** 产线类型：ASSEMBLY/MACHINING/PACKAGING/TESTING。 */
    private String lineType;

    /** 产线状态：ACTIVE/DISABLED。 */
    private String lineStatus;

    /** 授权类型：LEGAL/FACTORY/WAREHOUSE/LINE/ORG。 */
    private String grantType;

    /** 授权状态：ACTIVE/EXPIRED/REVOKED。 */
    private String grantStatus;

    /** 作用范围类型：ALL/FACTORY/WAREHOUSE/LINE。 */
    private String scopeType;

    /** 起始日期（yyyy-MM-dd）。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd）。 */
    private String endDate;
}
