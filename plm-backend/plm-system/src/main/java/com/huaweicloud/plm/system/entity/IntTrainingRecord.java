package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 培训记录（N9，DEV-104）：按角色的培训与考核记录，支撑上线切换前的人员准备。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_training_record")
public class IntTrainingRecord extends BaseEntity {

    /** 培训编号（唯一）。 */
    private String trainingNo;

    /** 角色编码。 */
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

    /** 通过率（0-1）。 */
    private BigDecimal passRate;

    private String remark;
}
