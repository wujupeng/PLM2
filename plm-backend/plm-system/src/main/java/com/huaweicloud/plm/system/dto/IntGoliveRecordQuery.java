package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 上线切换记录分页查询条件（N9，DEV-104）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntGoliveRecordQuery extends PageQuery {

    /** 上线编号。 */
    private String goliveNo;

    /** 切换状态。 */
    private String cutoverStatus;

    /** 责任人。 */
    private String owner;
}
