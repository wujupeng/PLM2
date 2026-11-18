package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 主数据同步（N9，DEV-095）：PLM 与 ERP/MES 之间物料、BOM、版本、供应商、工艺的同步状态与一致性校验。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_master_data_sync")
public class IntMasterDataSync extends BaseEntity {

    /** 同步编号。 */
    private String syncNo;

    /** 主数据类型：MATERIAL/BOM/SUPPLIER/PRODUCT/PROCESS。 */
    private String masterType;

    /** 主数据编码。 */
    private String masterCode;

    /** 主数据名称。 */
    private String masterName;

    /** 主数据版本。 */
    private String masterVersion;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 同步方向：PLM_TO_ERP/ERP_TO_PLM/PLM_TO_MES/MES_TO_PLM。 */
    private String syncDirection;

    /** 同步状态：PENDING/SYNCED/FAILED/DIFF。 */
    private String syncStatus;

    /** 来源端版本。 */
    private String sourceVersion;

    /** 目标端版本。 */
    private String targetVersion;

    /** 来源端摘要。 */
    private String sourceHash;

    /** 目标端摘要。 */
    private String targetHash;

    /** 是否存在差异：1 有差异 / 0 一致。 */
    private Integer diffFlag;

    /** 最近同步时间。 */
    private LocalDateTime lastSyncAt;

    /** 已重试次数。 */
    private Integer retryCount;

    private String remark;
}
