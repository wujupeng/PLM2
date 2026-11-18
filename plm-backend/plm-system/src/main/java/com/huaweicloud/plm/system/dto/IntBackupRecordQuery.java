package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 备份恢复记录分页查询条件（N9，DEV-103）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntBackupRecordQuery extends PageQuery {

    /** 记录编号。 */
    private String recordNo;

    /** 记录类型。 */
    private String recordType;

    /** 范围。 */
    private String scope;

    /** 结果状态。 */
    private String resultStatus;

    /** 是否已验证：1 是 / 0 否。 */
    private Integer verified;
}
