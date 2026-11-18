package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import lombok.Data;

import java.util.List;

/**
 * 正追溯（由物料批次反查）结果（N8，DEV-093）。
 */
@Data
public class MfgForwardTraceResponse {

    /** 物料编码。 */
    private String materialCode;

    /** 物料批次号。 */
    private String materialBatchNo;

    /** 命中追溯绑定。 */
    private List<MfgTraceBinding> bindings;

    /** 受影响生产批次。 */
    private List<MfgProductionBatch> productionBatches;

    /** 受影响产品追溯码（单件）。 */
    private List<String> affectedTraceCodes;

    /** 已发运出货单（客户与数量）。 */
    private List<MfgShipment> shipments;

    /** 受影响数量合计。 */
    private Integer affectedCount;
}
