package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 用户验收（UAT）记录（OA-DEV-111）：记录验收场景、参与人、预期与实际结果、问题数量与验收结论。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_uat_record")
public class OaUatRecord extends BaseEntity {

    /** 验收编号。 */
    private String uatNo;

    /** 验收部门。 */
    private String dept;

    /** 验收场景名称。 */
    private String sceneName;

    /** 关联场景编号。 */
    private String scenarioRef;

    /** 验收状态：PENDING/RUNNING/PASSED/FAILED。 */
    private String uatStatus;

    /** 责任部门。 */
    private String ownerDept;

    /** 参与人。 */
    private String participant;

    /** 预期结果。 */
    private String expected;

    /** 实际结果。 */
    private String actual;

    /** 问题数量。 */
    private Integer issueCount;

    /** 阻塞问题数量。 */
    private Integer blockerCount;

    /** 验收结论。 */
    private String conclusion;

    /** 验收时间。 */
    private LocalDateTime uatTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
