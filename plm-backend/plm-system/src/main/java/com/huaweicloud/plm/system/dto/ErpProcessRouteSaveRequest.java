package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工艺路线保存请求（对应 G3-N7b ERP 工艺资源—工艺路线）。
 */
@Data
public class ErpProcessRouteSaveRequest {

    /** 工艺路线编码。 */
    @NotBlank(message = "工艺路线编码不能为空")
    private String routeCode;

    /** 工艺路线名称。 */
    private String routeName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 版本号，为空默认 V1.0。 */
    private String versionNo;

    /** 路线类型，为空默认 MAIN。 */
    private String routeType;

    /** 路线状态，为空默认 DRAFT。 */
    private String routeStatus;

    /** 工序数，为空默认 0。 */
    private Integer operationCount;

    /** 标准工艺编码。 */
    private String standardCode;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
