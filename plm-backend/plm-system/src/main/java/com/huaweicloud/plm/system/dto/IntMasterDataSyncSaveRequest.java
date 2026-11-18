package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 主数据同步保存请求（N9，DEV-095）。 */
@Data
public class IntMasterDataSyncSaveRequest {

    /** 同步编号（可选，留空自动生成）。 */
    private String syncNo;

    @NotBlank(message = "主数据类型不能为空")
    private String masterType;

    @NotBlank(message = "主数据编码不能为空")
    private String masterCode;

    /** 主数据名称。 */
    private String masterName;

    /** 主数据版本。 */
    private String masterVersion;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标系统。 */
    private String targetSystem;

    /** 同步方向：PLM_TO_ERP/ERP_TO_PLM/PLM_TO_MES/MES_TO_PLM。 */
    private String syncDirection;

    /** 来源端版本。 */
    private String sourceVersion;

    /** 来源端摘要。 */
    private String sourceHash;

    private String remark;
}
