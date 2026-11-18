package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 接口调用日志分页查询条件（N9，DEV-096）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntInterfaceLogQuery extends PageQuery {

    /** 日志编号。 */
    private String logNo;

    /** 接口编码。 */
    private String endpointCode;

    /** 业务接口代码。 */
    private String interfaceCode;

    /** 业务键（如物料编码、工单号）。 */
    private String bizKey;

    /** 结果状态：SUCCESS/FAILED/RETRYING/COMPENSATED。 */
    private String resultStatus;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;
}
