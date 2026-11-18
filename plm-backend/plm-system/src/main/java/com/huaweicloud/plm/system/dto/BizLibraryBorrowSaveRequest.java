package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 图书借阅保存入参（OA-DEV-082）。
 */
@Data
public class BizLibraryBorrowSaveRequest {

    private Long bookId;

    private LocalDate borrowDate;

    private LocalDate dueDate;

    private String remark;
}
