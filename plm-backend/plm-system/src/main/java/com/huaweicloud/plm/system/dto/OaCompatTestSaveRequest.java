package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 兼容性测试保存请求（OA-DEV-109）。
 */
@Data
public class OaCompatTestSaveRequest {

    /** 测试编号。 */
    private String testNo;

    /** 环境类型。 */
    private String envType;

    /** 测试环境名称。 */
    @NotBlank(message = "测试环境名称不能为空")
    private String envName;

    /** 环境版本。 */
    private String envVersion;

    /** 网络条件。 */
    private String network;

    /** 测试场景。 */
    private String scene;

    /** 测试结论。 */
    private String result;

    /** 阻塞级别。 */
    private String blockLevel;

    /** 问题描述。 */
    private String issue;

    /** 测试人员。 */
    private String tester;

    /** 测试时间（yyyy-MM-dd HH:mm:ss）。 */
    private String testTime;

    /** 备注。 */
    private String remark;
}
