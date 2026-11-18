package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * G1-N1 集成平台通用分页查询条件。
 * 各字段按业务对象选择性使用：systemCode/direction/apiStatus（接口注册）、changeType/versionStatus（版本记录）、
 * domain/topicStatus（事件主题）、subscriptionStatus/deliveryMode（事件订阅）、messageStatus/targetType（事件消息）、
 * deadStatus（死信）、recordStatus（幂等记录）、healthStatus（集成监控）、startDate/endDate（时间区间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntegrationQuery extends PageQuery {

    private String systemCode;

    private String direction;

    private String apiStatus;

    private String changeType;

    private String versionStatus;

    private String domain;

    private String topicStatus;

    private String subscriptionStatus;

    private String deliveryMode;

    private String messageStatus;

    private String targetType;

    private String deadStatus;

    private String recordStatus;

    private String healthStatus;

    private String startDate;

    private String endDate;
}
