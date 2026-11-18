package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OA-N12 正式切换与现有OA退役通用分页查询条件。
 * 各字段按业务对象选择性使用：freezeType/freezeStatus（切换冻结）、migType/migStatus/verifyStatus（最终迁移）、
 * switchType/switchStatus（入口切换）、dutyRole/watchStatus（上线值守）、rollbackType/decisionResult/drillResult（回退决策）、
 * archiveType/archiveStatus（旧系统封存）、resourceType/decommissionStatus（资源回收）、
 * deliverableType/handoverStatus（运维交接）、startDate/endDate（时间区间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OaGoliveQuery extends PageQuery {

    private String freezeType;

    private String freezeStatus;

    private String migType;

    private String migStatus;

    private String verifyStatus;

    private String switchType;

    private String switchStatus;

    private String dutyRole;

    private String watchStatus;

    private String rollbackType;

    private String decisionResult;

    private String drillResult;

    private String archiveType;

    private String archiveStatus;

    private String resourceType;

    private String decommissionStatus;

    private String deliverableType;

    private String handoverStatus;

    private String startDate;

    private String endDate;
}
