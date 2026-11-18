package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 上线切换记录（N9，DEV-104）：上线计划、切换状态与回退预案。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_golive_record")
public class IntGoliveRecord extends BaseEntity {

    /** 上线编号（唯一）。 */
    private String goliveNo;

    /** 方案名称。 */
    private String planName;

    /** 切换范围。 */
    private String scope;

    /** 计划切换时间。 */
    private LocalDateTime plannedAt;

    /** 实际切换时间。 */
    private LocalDateTime actualAt;

    /** 切换状态：PLANNED/RUNNING/SUCCESS/ROLLED_BACK。 */
    private String cutoverStatus;

    /** 回退预案。 */
    private String rollbackPlan;

    /** 回退时间。 */
    private LocalDateTime rollbackAt;

    /** 责任人。 */
    private String owner;

    private String remark;
}
