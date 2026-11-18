package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 新开模检查与零件试流保存入参（OA-DEV-077）。关联 PLM 物料与质量问题。
 */
@Data
public class BizMoldTrialSaveRequest {

    /** 检查/试流类型：oa_mold_trial_type（STANDARD_CHECK/MOLD_CHECK/PART_TRIAL）。 */
    private String trialType;

    private String moldCode;

    private String moldName;

    private String partCode;

    private String partName;

    private String materialCode;

    private String materialName;

    private String supplierCode;

    private String supplierName;

    private String checkItems;

    private String checkResult;

    private BigDecimal trialQty;

    private String trialResult;

    private String trialIssue;

    private String verifyConclusion;

    private String plmRefNo;

    private LocalDate trialDate;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
