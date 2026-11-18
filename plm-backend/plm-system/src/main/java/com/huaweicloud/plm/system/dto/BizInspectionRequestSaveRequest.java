package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 检测委托单保存入参（OA-DEV-070）。与 QMS/实验室系统接口边界待确认。
 */
@Data
public class BizInspectionRequestSaveRequest {

    private Long requestDeptId;

    private String requestDeptName;

    private String materialCode;

    private String materialName;

    private String batchNo;

    private BigDecimal sampleQty;

    private String inspectionItems;

    private LocalDate requireDate;

    private String labName;

    /** 检测结果：oa_inspection_result（PENDING/PASS/FAIL）。 */
    private String resultStatus;

    private String resultDesc;

    private String reportAttachmentJson;

    private String qmsRefNo;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
