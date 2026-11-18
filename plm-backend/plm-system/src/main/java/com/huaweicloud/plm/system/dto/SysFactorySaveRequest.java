package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工厂保存请求（G1-N5 公共平台底座—多组织多工厂 WBS T100）。
 */
@Data
public class SysFactorySaveRequest {

    /** 工厂编码（为空时自动生成）。 */
    private String factoryCode;

    /** 工厂名称。 */
    @NotBlank(message = "工厂名称不能为空")
    private String factoryName;

    /** 所属法人编码。 */
    private String legalCode;

    /** 工厂类型：MANUFACTURE/ASSEMBLY/WAREHOUSE/OEM。 */
    private String factoryType;

    /** 国家。 */
    private String country;

    /** 地区。 */
    private String region;

    /** 地址。 */
    private String address;

    /** 时区。 */
    private String timezone;

    /** 负责人。 */
    private String manager;

    /** 工厂状态：ACTIVE/DISABLED。 */
    private String factoryStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
