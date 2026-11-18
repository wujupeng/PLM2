package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/** 培训记录保存请求（N9，DEV-104）。 */
@Data
public class IntTrainingRecordSaveRequest {

    /** 培训编号（留空则自动生成）。 */
    private String trainingNo;

    /** 角色编码。 */
    @NotBlank(message = "角色编码不能为空")
    private String roleCode;

    /** 培训主题。 */
    private String title;

    /** 讲师。 */
    private String trainer;

    /** 参训人数。 */
    private Integer traineeCount;

    /** 通过人数。 */
    private Integer passedCount;

    /** 培训时间。 */
    private LocalDateTime trainedAt;

    /** 培训材料地址。 */
    private String materialUrl;

    /** 备注。 */
    private String remark;
}
