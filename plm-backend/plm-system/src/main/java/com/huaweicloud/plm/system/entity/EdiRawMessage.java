package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * EDI 原始报文与解析结果（N6，DEV-064/065/066/068）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_raw_message")
public class EdiRawMessage extends BaseEntity {

    /** 报文编号（唯一）。 */
    private String messageNo;

    /** 控制号（报文内唯一标识）。 */
    private String controlNo;

    /** 伙伴编码。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 标准：X12/EDIFACT。 */
    private String standard;

    /** 传输协议。 */
    private String protocol;

    /** 文件名。 */
    private String fileName;

    /** 原始报文内容。 */
    private String rawContent;

    /** 报文字节大小。 */
    private Integer rawSize;

    /** 校验和。 */
    private String checksum;

    /** 接收时间。 */
    private LocalDateTime receivedAt;

    /** 解析状态：RECEIVED/PARSED/FAILED。 */
    private String parseStatus;

    /** 解析消息。 */
    private String parseMessage;

    /** 解析后标准对象 JSON。 */
    private String parsedJson;

    /** 是否重复：1 是 / 0 否。 */
    private Integer duplicateFlag;

    /** 重试次数。 */
    private Integer retryCount;

    /** 最近重试时间。 */
    private LocalDateTime lastRetryAt;

    /** 关联单据号。 */
    private String relatedDocNo;

    private String remark;
}
