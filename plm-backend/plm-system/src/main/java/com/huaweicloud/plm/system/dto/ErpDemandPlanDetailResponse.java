package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpDemandPlan;
import com.huaweicloud.plm.system.entity.ErpDemandPlanLine;
import lombok.Data;

import java.util.List;

/**
 * 需求计划详情：头信息与行项目（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Data
public class ErpDemandPlanDetailResponse {

    private ErpDemandPlan header;

    private List<ErpDemandPlanLine> lines;
}
