package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 欠料处理记录（N7，DEV-083）：欠料单处理过程留痕。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_shortage_action")
public class WmsShortageAction extends BaseEntity {

    /** 欠料单 ID。 */
    private Long caseId;

    /** 欠料单号。 */
    private String caseNo;

    /** 处理动作类型：REGISTER/MEASURE/ESCALATE/RECOVER/CLOSE。 */
    private String actionType;

    /** 处理内容。 */
    private String content;

    /** 处理人。 */
    private String operatorName;

    /** 处理时间。 */
    private LocalDateTime actionAt;

    private String remark;
}
