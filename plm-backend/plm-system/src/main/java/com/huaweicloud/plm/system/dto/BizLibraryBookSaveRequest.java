package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 图书信息保存入参（OA-DEV-082）。
 */
@Data
public class BizLibraryBookSaveRequest {

    private String bookCode;

    private String bookName;

    private String author;

    private String publisher;

    private String isbn;

    private String category;

    private LocalDate publishDate;

    private String location;

    private Integer totalQty;

    private Integer status;

    private String remark;
}
