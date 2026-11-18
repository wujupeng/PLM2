package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工序过站记录分页查询条件（N8，DEV-086）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgOperationQuery extends PageQuery {

    /** 记录编号。 */
    private String recordNo;

    /** 生产批次号。 */
    private String batchNo;

    /** 序列号。 */
    private String serialNo;

    /** 工序编码。 */
    private String operationCode;

    /** 工位。 */
    private String workStation;

    /** 结果：OK/NG/REWORK。 */
    private String result;

    /** 接口状态：RECEIVED/PROCESSED/FAILED/COMPENSATED。 */
    private String interfaceStatus;
}
