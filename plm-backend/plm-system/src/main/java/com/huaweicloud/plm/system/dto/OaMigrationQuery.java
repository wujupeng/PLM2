package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OA-N10 历史数据迁移通用分页查询条件。
 * 各字段按业务对象选择性使用：objectCode（对象/映射/批次/附件/对账）、sourceType（对象/批次抽取方式）、
 * status（对象目录/字段映射启用状态）、batchType/batchStatus（批次）、ruleType（清洗规则）、
 * cleanResult（清洗日志）、transferStatus（附件任务）、instanceStatus（历史流程）、
 * reconcileStatus（对账）、compareResult（双跑对照）、startDate/endDate（时间区间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OaMigrationQuery extends PageQuery {

    private String objectCode;

    private String sourceType;

    private Integer status;

    private String batchType;

    private String batchStatus;

    private String ruleType;

    private String cleanResult;

    private String transferStatus;

    private String instanceStatus;

    private String reconcileStatus;

    private String compareResult;

    private Long batchId;

    private String startDate;

    private String endDate;
}
