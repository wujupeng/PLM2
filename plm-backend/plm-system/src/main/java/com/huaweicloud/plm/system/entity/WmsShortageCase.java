package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 欠料异常单（N7，DEV-083）：责任人/影响工单/原因/临时措施/预计恢复/关闭的闭环载体。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_shortage_case")
public class WmsShortageCase extends BaseEntity {

    /** 欠料单号（唯一）。 */
    private String caseNo;

    /** 关联缺料预警编号。 */
    private String warningNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线。 */
    private String lineCode;

    /** 影响工单（逗号分隔）。 */
    private String affectedWorkOrders;

    /** 责任人。 */
    private String owner;

    /** 欠料原因。 */
    private String cause;

    /** 临时措施。 */
    private String tempMeasure;

    /** 预计恢复日期。 */
    private LocalDate expectedRecoveryDate;

    /** 状态：OPEN/PROCESSING/CLOSED。 */
    private String caseStatus;

    /** 关闭证据。 */
    private String closeEvidence;

    /** 关闭人。 */
    private String closedBy;

    /** 关闭时间。 */
    private LocalDateTime closedAt;

    private String remark;
}
