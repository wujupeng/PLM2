package com.huaweicloud.plm.common.api;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.Data;

/**
 * 分页查询基类，接口入参统一继承该类。
 */
@Data
public class PageQuery {

    private static final long DEFAULT_PAGE_NUM = 1L;
    private static final long DEFAULT_PAGE_SIZE = 20L;
    private static final long MAX_PAGE_SIZE = 200L;

    private Long pageNum = DEFAULT_PAGE_NUM;
    private Long pageSize = DEFAULT_PAGE_SIZE;
    private String keyword;

    public long normalizedPageNum() {
        return pageNum == null || pageNum < 1 ? DEFAULT_PAGE_NUM : pageNum;
    }

    public long normalizedPageSize() {
        if (pageSize == null || pageSize < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);
    }

    public <T> Page<T> toPage() {
        return new Page<>(normalizedPageNum(), normalizedPageSize());
    }
}
