package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocCategoryQuery;
import com.huaweicloud.plm.system.dto.DocCategorySaveRequest;
import com.huaweicloud.plm.system.entity.DocCategory;
import com.huaweicloud.plm.system.mapper.DocCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 图文档分类服务（DEV-033）。
 */
@Service
@RequiredArgsConstructor
public class DocCategoryService {

    private final DocCategoryMapper categoryMapper;

    public PageResult<DocCategory> page(DocCategoryQuery query) {
        Page<DocCategory> page = query.toPage();
        categoryMapper.selectPage(page, Wrappers.<DocCategory>lambdaQuery()
                .eq(StringUtils.hasText(query.getCategoryCode()), DocCategory::getCategoryCode, query.getCategoryCode())
                .eq(StringUtils.hasText(query.getDocType()), DocCategory::getDocType, query.getDocType())
                .eq(query.getStatus() != null, DocCategory::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(DocCategory::getCategoryCode, query.getKeyword()).or()
                        .like(DocCategory::getCategoryName, query.getKeyword()))
                .orderByAsc(DocCategory::getSortNo)
                .orderByAsc(DocCategory::getId));
        return PageResult.of(page);
    }

    public List<DocCategory> options() {
        return categoryMapper.selectList(Wrappers.<DocCategory>lambdaQuery()
                .orderByAsc(DocCategory::getSortNo)
                .orderByAsc(DocCategory::getId));
    }

    public DocCategory getById(Long categoryId) {
        return requireCategory(categoryId);
    }

    public Long create(DocCategorySaveRequest request) {
        if (categoryMapper.countByCode(request.getCategoryCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "分类编码已存在: " + request.getCategoryCode());
        }
        DocCategory category = new DocCategory();
        applyRequest(category, request);
        categoryMapper.insert(category);
        return category.getId();
    }

    public void update(Long categoryId, DocCategorySaveRequest request) {
        DocCategory category = requireCategory(categoryId);
        if (!category.getCategoryCode().equals(request.getCategoryCode())
                && categoryMapper.countByCode(request.getCategoryCode(), categoryId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "分类编码已存在: " + request.getCategoryCode());
        }
        applyRequest(category, request);
        categoryMapper.updateById(category);
    }

    public void delete(Long categoryId) {
        requireCategory(categoryId);
        long children = categoryMapper.selectCount(
                Wrappers.<DocCategory>lambdaQuery().eq(DocCategory::getParentId, categoryId));
        if (children > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "存在子分类，不能删除");
        }
        categoryMapper.deleteById(categoryId);
    }

    private void applyRequest(DocCategory category, DocCategorySaveRequest request) {
        category.setCategoryCode(request.getCategoryCode());
        category.setCategoryName(request.getCategoryName());
        category.setParentId(request.getParentId() == null ? 0L : request.getParentId());
        category.setDocType(request.getDocType());
        category.setFileTypes(request.getFileTypes());
        category.setRequiredMetadata(request.getRequiredMetadata());
        category.setReviewRequired(request.getReviewRequired() == null ? 0 : request.getReviewRequired());
        category.setReviewNodes(request.getReviewNodes());
        category.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        category.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        category.setRemark(request.getRemark());
    }

    private DocCategory requireCategory(Long categoryId) {
        DocCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图文档分类不存在: " + categoryId);
        }
        return category;
    }
}
