package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ProcessOperation;
import com.huaweicloud.plm.system.entity.ProcessRoute;
import lombok.Data;

import java.util.List;

/**
 * 工艺路线详情：路线本体与工序明细。
 */
@Data
public class ProcessRouteDetailResponse {

    private ProcessRoute route;

    private List<ProcessOperation> operations;
}
