package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * BOM 发布与下游同步记录（DEV-032 / IF-02）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_publish_log")
public class BomPublishLog extends BaseEntity {

    /** 所属 BOM 头 ID。 */
    private Long headerId;

    /** BOM 编码。 */
    private String bomCode;

    /** 版本号。 */
    private String versionNo;

    /** 目标系统：ERP/MES 等。 */
    private String targetSystem;

    /** 同步状态：pending/success/failed。 */
    private String status;

    /** 重试次数。 */
    private Integer retryCount;

    /** 请求报文摘要。 */
    private String requestPayload;

    /** 下游回执信息。 */
    private String responseMessage;

    /** 发布时间。 */
    private LocalDateTime publishedAt;
}
