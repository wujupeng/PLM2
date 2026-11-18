package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 检验判定分页查询条件。
 * keyword 匹配 judgeNo/sourceNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesInspectionJudgeQuery extends PageQuery {

    /** 判定状态。 */
    private String judgeStatus;

    /** 判定结果。 */
    private String judgeResult;

    /** 来源类型。 */
    private String sourceType;

    /** 物料编码。 */
    private String materialCode;
}
