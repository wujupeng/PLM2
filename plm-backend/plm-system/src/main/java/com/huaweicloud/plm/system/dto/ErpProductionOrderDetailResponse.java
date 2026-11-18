package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpProductionOrder;
import com.huaweicloud.plm.system.entity.ErpProductionOrderLine;
import lombok.Data;

import java.util.List;

/**
 * 生产订单详情：头信息与行项目（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Data
public class ErpProductionOrderDetailResponse {

    private ErpProductionOrder header;

    private List<ErpProductionOrderLine> lines;
}
