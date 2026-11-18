package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 检测委托单（OA-DEV-070，与 QMS/实验室系统边界待确认）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_inspection_request")
public class OaBizInspectionRequest extends BaseEntity {

    /** 委托单号。 */
    private String requestNo;

    private Long requestDeptId;

    private String requestDeptName;

    private Long requesterUserId;

    private String requesterName;

    private String materialCode;

    private String materialName;

    private String batchNo;

    private BigDecimal sampleQty;

    private String inspectionItems;

    private LocalDate requireDate;

    private String labName;

    /** 结果状态：PENDING/PASS/FAIL 等。 */
    private String resultStatus;

    private String resultDesc;

    private String reportAttachmentJson;

    private String qmsRefNo;

    private Long orgId;

    private String orgName;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
