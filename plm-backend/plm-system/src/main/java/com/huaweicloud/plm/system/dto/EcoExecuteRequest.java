package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 工程变更执行（版本切换）请求。
 */
@Data
public class EcoExecuteRequest {

    /** 生效日期，为空时不更新。 */
    private LocalDate effectiveDate;

    /** 生效批次，为空时不更新。 */
    private String effectiveBatch;

    /** 本次执行切换的变更明细 ID 列表（eco_change_item.id）。 */
    private List<Long> switchedItems;
}
