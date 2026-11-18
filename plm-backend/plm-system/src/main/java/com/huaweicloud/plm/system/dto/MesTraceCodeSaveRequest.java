package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 追溯码保存请求。
 */
@Data
public class MesTraceCodeSaveRequest {

    /** 追溯码编号（为空时自动生成）。 */
    private String codeNo;

    /** 码制，为空默认 DATAMATRIX。 */
    private String codeType;

    /** 追溯码状态，为空默认 INACTIVE。 */
    private String codeStatus;

    /** 追溯码内容。 */
    @NotBlank(message = "追溯码内容不能为空")
    private String codeContent;

    /** 对象类型，为空默认 SERIAL。 */
    private String objectType;

    /** 对象编码。 */
    private String objectCode;

    /** 打印时间。 */
    private LocalDateTime printTime;

    /** 打印次数。 */
    private Integer printCount;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
