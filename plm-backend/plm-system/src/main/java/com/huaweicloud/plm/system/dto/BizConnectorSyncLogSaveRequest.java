package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 连接器同步记录入参（OA-DEV-089 ~ OA-DEV-093）。
 */
@Data
public class BizConnectorSyncLogSaveRequest {

    private Long connectorId;

    private String objectType;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    private String sourceFlag;

    /** 数据时间戳（yyyy-MM-dd HH:mm:ss）。 */
    private String dataTimestamp;

    private Integer recordCount;

    /** 同步状态：SUCCESS/FAILED/PARTIAL。 */
    private String syncStatus;

    private String receiptNo;

    private String receiptStatus;

    private Integer costMs;

    private String errorMsg;

    private String remark;
}
