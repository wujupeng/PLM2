package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 工程变更申请（ECR）转变更单（ECO）请求。
 */
@Data
public class EcrConvertRequest {

    /** 变更方案说明。 */
    private String planDesc;

    /** 变更类型：add/modify/delete/switch，为空时默认 modify。 */
    private String changeType;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 生效批次。 */
    private String effectiveBatch;

    /** 变更对象明细。 */
    private List<EcoChangeItemSaveRequest> items;
}
