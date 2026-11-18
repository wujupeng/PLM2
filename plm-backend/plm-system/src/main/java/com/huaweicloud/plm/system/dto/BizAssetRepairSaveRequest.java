package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 设备维修工单保存入参（OA-DEV-078）。资产台账权威归属资产/财务系统。
 */
@Data
public class BizAssetRepairSaveRequest {

    /** 资产类别：可配置字典 oa_asset_category。 */
    private String assetCategory;

    private String assetCode;

    private String assetName;

    private String assetModel;

    private String location;

    private String faultType;

    private String faultDesc;

    /** 优先级：可配置字典 oa_repair_priority。 */
    private String priority;

    private LocalDate requireFinish;

    private String attachmentJson;

    private String remark;

    /** 是否保存后直接提交审批。 */
    private Boolean submit;
}
