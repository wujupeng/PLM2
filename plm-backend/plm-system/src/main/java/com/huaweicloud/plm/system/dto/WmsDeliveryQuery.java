package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料配送任务分页查询条件（N7，DEV-077）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsDeliveryQuery extends PageQuery {

    /** 任务编号。 */
    private String taskNo;

    /** 关联看板编号。 */
    private String kanbanNo;

    /** 物料编码。 */
    private String materialCode;

    /** 产线。 */
    private String lineCode;

    /** 任务状态：CREATED/ACCEPTED/DELIVERING/SIGNED/CANCELLED。 */
    private String taskStatus;

    /** 任务类型：REPLENISH/RETURN/TRANSFER。 */
    private String taskType;

    /** 配送人。 */
    private String assignee;
}
