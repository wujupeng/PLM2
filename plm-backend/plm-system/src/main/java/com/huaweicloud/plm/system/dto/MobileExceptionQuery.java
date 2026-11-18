package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 移动异常队列分页查询条件（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MobileExceptionQuery extends PageQuery {

    /** 场景编码。 */
    private String sceneCode;

    /** 异常类型：SCAN_FAIL/LABEL_INVALID/OFFLINE_SYNC/PERMISSION/DATA_MISMATCH。 */
    private String errorType;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED。 */
    private String exceptionStatus;
}
