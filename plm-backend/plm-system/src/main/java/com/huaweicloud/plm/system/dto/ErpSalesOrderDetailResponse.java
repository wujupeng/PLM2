package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpSalesOrder;
import com.huaweicloud.plm.system.entity.ErpSalesOrderLine;
import lombok.Data;

import java.util.List;

/**
 * 销售订单详情：头信息与行项目（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesOrderDetailResponse {

    private ErpSalesOrder header;

    private List<ErpSalesOrderLine> lines;
}
