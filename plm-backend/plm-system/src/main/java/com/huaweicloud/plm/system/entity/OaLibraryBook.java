package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 图书档案（OA-DEV-082）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_library_book")
public class OaLibraryBook extends BaseEntity {

    /** 图书编号。 */
    private String bookCode;

    /** 图书名称。 */
    private String bookName;

    /** 作者。 */
    private String author;

    /** 出版社。 */
    private String publisher;

    /** ISBN。 */
    private String isbn;

    /** 图书分类。 */
    private String category;

    /** 出版日期。 */
    private LocalDate publishDate;

    /** 存放位置。 */
    private String location;

    /** 总数量。 */
    private Integer totalQty;

    /** 可借数量。 */
    private Integer availableQty;

    /** 状态：0 停用，1 启用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
