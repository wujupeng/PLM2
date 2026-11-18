package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 兼容性测试（OA-DEV-109）：记录浏览器/终端环境、网络条件、测试场景与阻塞问题。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_compat_test")
public class OaCompatTest extends BaseEntity {

    /** 测试编号。 */
    private String testNo;

    /** 环境类型：BROWSER/CLIENT/OS/NETWORK。 */
    private String envType;

    /** 测试环境名称。 */
    private String envName;

    /** 环境版本。 */
    private String envVersion;

    /** 网络条件。 */
    private String network;

    /** 测试场景。 */
    private String scene;

    /** 测试结论：PASS/PARTIAL/FAIL/PENDING。 */
    private String result;

    /** 阻塞级别：BLOCKER/MAJOR/MINOR。 */
    private String blockLevel;

    /** 问题描述。 */
    private String issue;

    /** 测试人员。 */
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
