package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OA-N11 测试与验收通用分页查询条件。
 * 各字段按业务对象选择性使用：module/caseType/priority/execStatus（测试用例）、
 * sceneType/result（权限测试）、checkType/severity/fixStatus（安全测试）、envType（兼容测试）、
 * drillType/restoreResult（备份恢复演练）、dept/uatStatus（UAT）、materialType/targetRole/status（培训材料）、
 * planType/cutoverStatus/rehearsalResult（切换预案）、startDate/endDate（时间区间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OaTestQuery extends PageQuery {

    private String module;

    private String caseType;

    private String priority;

    private String execStatus;

    private String sceneType;

    private String result;

    private String checkType;

    private String severity;

    private String fixStatus;

    private String envType;

    private String drillType;

    private String restoreResult;

    private String dept;

    private String uatStatus;

    private String materialType;

    private String targetRole;

    private Integer status;

    private String planType;

    private String cutoverStatus;

    private String rehearsalResult;

    private String startDate;

    private String endDate;
}
