package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpDeliveryOrder;
import com.huaweicloud.plm.system.entity.ErpDeliveryOrderLine;
import lombok.Data;

import java.util.List;

/**
 * 发货单详情：头信息与行项目。
 */
@Data
public class ErpDeliveryOrderDetailResponse {

    private ErpDeliveryOrder header;

    private List<ErpDeliveryOrderLine> lines;
}
