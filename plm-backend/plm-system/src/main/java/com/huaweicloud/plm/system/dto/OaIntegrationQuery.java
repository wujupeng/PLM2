package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OA-N9 集成平台通用分页查询条件。
 * 各字段按业务对象选择性使用：systemCode（连接器/同步记录）、status（策略/凭证/订阅/映射）、
 * eventType（订阅/投递）、taskType（任务）、objectType（同步记录/映射）、direction（同步记录）、
 * clientSystem（访问审计）、noticeType/handleStatus（EDI 通知）、startDate/endDate（时间区间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OaIntegrationQuery extends PageQuery {

    private String systemCode;

    private Integer status;

    private String eventType;

    private String taskType;

    private String taskStatus;

    private String objectType;

    private String direction;

    private String syncStatus;

    private String deliveryStatus;

    private String clientSystem;

    private String noticeType;

    private String handleStatus;

    private Integer alertFlag;

    private String bizKey;

    private Long connectorId;

    private String startDate;

    private String endDate;
}
