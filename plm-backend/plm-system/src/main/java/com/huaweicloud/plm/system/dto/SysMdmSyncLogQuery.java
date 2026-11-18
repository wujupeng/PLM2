package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据同步日志分页查询条件（G1-N8 主数据平台 T007 同步日志）。
 * keyword 匹配 logNo/masterCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmSyncLogQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 同步状态。 */
    private String syncStatus;
}
