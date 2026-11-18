package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 角色与数据隔离测试（OA-DEV-106）：记录测试场景、角色、数据范围、预期与实际结果及隔离结论。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_permission_test")
public class OaPermissionTest extends BaseEntity {

    /** 测试编码。 */
    private String testNo;

    /** 测试场景名称。 */
    private String sceneName;

    /** 场景类型：CROSS_DEPT/CROSS_FACTORY。 */
    private String sceneType;

    /** 测试角色。 */
    private String roleName;

    /** 测试主体。 */
    private String subject;

    /** 数据范围。 */
    private String dataScope;

    /** 预期结果。 */
    private String expectedResult;

    /** 实际结果。 */
    private String actualResult;

    /** 数据隔离是否通过：0/1。 */
    private Integer isolationPass;

    /** 测试结论：PASS/FAIL/PENDING。 */
    private String result;

    /** 关联缺陷编号。 */
    private String defectNo;

    /** 测试执行人。 */
    private String tester;

    /** 测试时间。 */
    private LocalDateTime testTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
