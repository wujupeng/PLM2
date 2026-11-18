package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工序明细（DEV-047）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("process_operation")
public class ProcessOperation extends BaseEntity {

    /** 所属工艺路线 ID。 */
    private Long routeId;

    /** 工序号。 */
    private Integer seqNo;

    /** 工序编码。 */
    private String operationCode;

    /** 工序名称。 */
    private String operationName;

    /** 工作中心。 */
    private String workCenter;

    /** 工艺参数。 */
    private String processParams;

    /** 工装夹具。 */
    private String fixtureTooling;

    /** 作业指导书编号。 */
    private String workInstructionDocNo;

    /** 标准工时。 */
    private String standardTime;

    /** 是否需要检验：0-否 1-是。 */
    private Integer inspectionRequired;

    /** 关联检验规范编码。 */
    private String inspectionSpecCode;

    /** 是否关键工序：0-否 1-是。 */
    private Integer keyOperation;

    private String remark;
}
