package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MaterialCategorySaveRequest;
import com.huaweicloud.plm.system.entity.MdMaterial;
import com.huaweicloud.plm.system.entity.MdMaterialCategory;
import com.huaweicloud.plm.system.mapper.MdMaterialCategoryMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 物料分类服务（DEV-018）。
 */
@Service
@RequiredArgsConstructor
public class MaterialCategoryService {

    private final MdMaterialCategoryMapper categoryMapper;
    private final MdMaterialMapper materialMapper;

    public List<MdMaterialCategory> list(String keyword) {
        return categoryMapper.selectList(Wrappers.<MdMaterialCategory>lambdaQuery()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MdMaterialCategory::getCategoryCode, keyword).or()
                        .like(MdMaterialCategory::getCategoryName, keyword))
                .orderByAsc(MdMaterialCategory::getSortNo)
                .orderByAsc(MdMaterialCategory::getId));
    }

    public MdMaterialCategory getById(Long categoryId) {
        return requireCategory(categoryId);
    }

    public Long create(MaterialCategorySaveRequest request) {
        if (categoryMapper.countByCode(request.getCategoryCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "分类编码已存在: " + request.getCategoryCode());
        }
        MdMaterialCategory category = new MdMaterialCategory();
        applyRequest(category, request);
        categoryMapper.insert(category);
        return category.getId();
    }

    public void update(Long categoryId, MaterialCategorySaveRequest request) {
        MdMaterialCategory category = requireCategory(categoryId);
        if (!category.getCategoryCode().equals(request.getCategoryCode())
                && categoryMapper.countByCode(request.getCategoryCode(), categoryId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "分类编码已存在: " + request.getCategoryCode());
        }
        applyRequest(category, request);
        categoryMapper.updateById(category);
    }

    public void delete(Long categoryId) {
        requireCategory(categoryId);
        if (categoryMapper.countByParent(categoryId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该分类下存在子分类，无法删除");
        }
        long referenced = materialMapper.selectCount(
                Wrappers.<MdMaterial>lambdaQuery().eq(MdMaterial::getCategoryId, categoryId));
        if (referenced > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该分类已被物料引用，无法删除");
        }
        categoryMapper.deleteById(categoryId);
    }

    private void applyRequest(MdMaterialCategory category, MaterialCategorySaveRequest request) {
        category.setCategoryCode(request.getCategoryCode());
        category.setCategoryName(request.getCategoryName());
        category.setParentId(request.getParentId() == null ? 0L : request.getParentId());
        category.setCodeRuleKey(request.getCodeRuleKey());
        category.setRequiredFields(request.getRequiredFields());
        category.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        category.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        category.setRemark(request.getRemark());
    }

    private MdMaterialCategory requireCategory(Long categoryId) {
        MdMaterialCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "物料分类不存在: " + categoryId);
        }
        return category;
    }
}
