package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * EDI 交易日志（N6，DEV-073）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_transaction_log")
public class EdiTransactionLog extends BaseEntity {

    /** 日志编号（唯一）。 */
    private String logNo;

    /** 报文编号。 */
    private String messageNo;

    /** 伙伴编码。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 动作类型：RECEIVE/PARSE/SEND/ACK/RETRY/REPLAY。 */
    private String actionType;

    /** 结果：SUCCESS/FAIL。 */
    private String result;

    /** 日志消息。 */
    private String message;

    /** 关联业务号。 */
    private String refNo;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 日志时间。 */
    private LocalDateTime logAt;

    private String remark;
}
