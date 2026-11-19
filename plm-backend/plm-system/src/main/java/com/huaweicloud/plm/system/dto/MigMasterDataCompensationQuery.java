package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据迁移异常补偿分页查询条件。
 * keyword 匹配 compensationNo/objectNo/errorMessage。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MigMasterDataCompensationQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 错误类型。 */
    private String errorType;

    /** 补偿状态。 */
    private String compensationStatus;

    /** 批次号。 */
    private String batchNo;
}
