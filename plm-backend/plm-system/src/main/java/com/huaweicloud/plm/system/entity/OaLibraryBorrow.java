package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 图书借阅（OA-DEV-082）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_library_borrow")
public class OaLibraryBorrow extends BaseEntity {

    /** 借阅单号。 */
    private String borrowNo;

    /** 图书ID。 */
    private Long bookId;

    /** 图书编号。 */
    private String bookCode;

    /** 图书名称。 */
    private String bookName;

    /** 借阅人用户ID。 */
    private Long borrowerUserId;

    /** 借阅人姓名。 */
    private String borrowerName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 借阅日期。 */
    private LocalDate borrowDate;

    /** 应还日期。 */
    private LocalDate dueDate;

    /** 归还日期。 */
    private LocalDate returnDate;

    /** 续借次数。 */
    private Integer renewCount;

    /** 借阅状态：BORROWED/RETURNED/OVERDUE 等。 */
    private String borrowStatus;

    /** 逾期天数。 */
    private Integer overdueDays;

    /** 备注。 */
    private String remark;
}
