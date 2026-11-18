package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.MfgOperationRecord;
import com.huaweicloud.plm.system.entity.MfgPackage;
import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgTestResult;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import lombok.Data;

import java.util.List;

/**
 * 反追溯（由产品码反查）结果（N8，DEV-093）。
 */
@Data
public class MfgTraceResponse {

    /** 查询追溯码。 */
    private String traceCode;

    /** 单件/批次。 */
    private String traceType;

    /** 生产批次档案。 */
    private MfgProductionBatch productionBatch;

    /** 物料批次绑定（物料、供应商）。 */
    private List<MfgTraceBinding> materialBindings;

    /** 工序过站记录。 */
    private List<MfgOperationRecord> operationRecords;

    /** 测试结果。 */
    private List<MfgTestResult> testResults;

    /** 包装。 */
    private List<MfgPackage> packages;

    /** 发运/出货。 */
    private List<MfgShipment> shipments;

    /** 是否命中召回。 */
    private Boolean recalled;
}
