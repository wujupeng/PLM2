package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 主数据同步分页查询条件（N9，DEV-095）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntMasterDataSyncQuery extends PageQuery {

    /** 同步编号。 */
    private String syncNo;

    /** 主数据类型：MATERIAL/BOM/SUPPLIER/PRODUCT/PROCESS。 */
    private String masterType;

    /** 主数据编码。 */
    private String masterCode;

    /** 同步状态：PENDING/SYNCED/FAILED/DIFF。 */
    private String syncStatus;

    /** 同步方向：PLM_TO_ERP/ERP_TO_PLM/PLM_TO_MES/MES_TO_PLM。 */
    private String syncDirection;

    /** 目标系统。 */
    private String targetSystem;
}
