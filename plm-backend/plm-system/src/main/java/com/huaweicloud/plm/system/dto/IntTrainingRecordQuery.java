package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 培训记录分页查询条件（N9，DEV-104）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntTrainingRecordQuery extends PageQuery {

    /** 培训编号。 */
    private String trainingNo;

    /** 角色编码。 */
    private String roleCode;

    /** 讲师。 */
    private String trainer;
}
