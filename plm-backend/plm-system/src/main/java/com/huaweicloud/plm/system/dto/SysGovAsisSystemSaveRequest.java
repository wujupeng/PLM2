package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 存量系统保存请求（G1-N7 治理中心 T002 现状盘点）。
 */
@Data
public class SysGovAsisSystemSaveRequest {

    /** 系统编号（为空时自动生成）。 */
    private String systemNo;

    /** 系统编码。 */
    private String systemCode;

    /** 系统名称。 */
    @NotBlank(message = "系统名称不能为空")
    private String systemName;

    /** 系统类型：ERP/PLM/OA/MES/WMS/SRM/OTHER，为空默认 OTHER。 */
    private String systemType;

    /** 厂商。 */
    private String vendor;

    /** 部署模式。 */
    private String deployMode;

    /** 用户数。 */
    private Integer userCount;

    /** 系统状态，为空默认 ACTIVE。 */
    private String systemStatus;

    /** 迁移策略。 */
    private String migrateStrategy;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
