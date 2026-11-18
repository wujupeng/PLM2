package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 连接器同步记录（OA-DEV-089 ~ OA-DEV-093，含来源标识、时间戳与回执）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_connector_sync_log")
public class OaConnectorSyncLog extends BaseEntity {

    /** 连接器ID。 */
    private Long connectorId;

    /** 连接器编号。 */
    private String connectorNo;

    /** 系统编码。 */
    private String systemCode;

    /** 对象类型。 */
    private String objectType;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 数据来源标识。 */
    private String sourceFlag;

    /** 数据时间戳。 */
    private LocalDateTime dataTimestamp;

    /** 记录数。 */
    private Integer recordCount;

    /** 同步状态：SUCCESS/FAILED/PARTIAL。 */
    private String syncStatus;

    /** 回执号。 */
    private String receiptNo;

    /** 回执状态。 */
    private String receiptStatus;

    /** 耗时（毫秒）。 */
    private Integer costMs;

    /** 错误信息。 */
    private String errorMsg;

    /** 操作人用户ID。 */
    private Long operatorUserId;

    /** 操作人姓名。 */
    private String operatorName;

    /** 同步时间。 */
    private LocalDateTime syncTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
