package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 功能与回归测试用例（OA-DEV-105）：记录用例编码、关联需求/页面/接口/表、执行状态与结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_test_case")
public class OaTestCase extends BaseEntity {

    /** 用例编码。 */
    private String caseNo;

    /** 用例名称。 */
    private String caseName;

    /** 所属功能模块。 */
    private String module;

    /** 关联需求编号。 */
    private String requirementRef;

    /** 关联页面。 */
    private String pageRef;

    /** 关联接口。 */
    private String apiRef;

    /** 关联数据表。 */
    private String tableRef;

    /** 用例类型：FUNCTION/REGRESSION。 */
    private String caseType;

    /** 优先级：P0/P1/P2。 */
    private String priority;

    /** 前置条件。 */
    private String precondition;

    /** 操作步骤。 */
    private String steps;

    /** 预期结果。 */
    private String expected;

    /** 执行状态：NOT_RUN/PASS/FAIL/BLOCKED。 */
    private String execStatus;

    /** 实际测试结果。 */
    private String testResult;

    /** 测试执行人。 */
    private String tester;

    /** 最近执行时间。 */
    private LocalDateTime lastRunTime;

    /** 状态：0/1。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
