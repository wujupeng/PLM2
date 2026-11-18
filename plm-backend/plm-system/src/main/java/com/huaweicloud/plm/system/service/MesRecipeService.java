package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesRecipeQuery;
import com.huaweicloud.plm.system.dto.MesRecipeSaveRequest;
import com.huaweicloud.plm.system.entity.MesRecipe;
import com.huaweicloud.plm.system.mapper.MesRecipeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 参数配方服务。
 */
@Service
@RequiredArgsConstructor
public class MesRecipeService {

    private static final String DEFAULT_NO_PREFIX = "MRC";
    private static final String DEFAULT_RECIPE_STATUS = "DRAFT";

    private final MesRecipeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesRecipe> page(MesRecipeQuery query) {
        String keyword = query.getKeyword();
        Page<MesRecipe> page = mapper.selectPage(query.toPage(), Wrappers.<MesRecipe>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecipeStatus()), MesRecipe::getRecipeStatus, query.getRecipeStatus())
                .eq(StringUtils.hasText(query.getProcessCode()), MesRecipe::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesRecipe::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getParamCode()), MesRecipe::getParamCode, query.getParamCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesRecipe::getRecipeNo, keyword).or()
                        .like(MesRecipe::getRecipeName, keyword).or()
                        .like(MesRecipe::getProcessCode, keyword).or()
                        .like(MesRecipe::getMaterialCode, keyword))
                .orderByDesc(MesRecipe::getId));
        return PageResult.of(page);
    }

    public MesRecipe detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesRecipeSaveRequest request) {
        MesRecipe entity;
        if (id == null) {
            entity = new MesRecipe();
            entity.setRecipeNo(StringUtils.hasText(request.getRecipeNo())
                    ? request.getRecipeNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setRecipeStatus(StringUtils.hasText(request.getRecipeStatus())
                    ? request.getRecipeStatus() : DEFAULT_RECIPE_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MesRecipe require(Long id) {
        MesRecipe entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "参数配方不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesRecipe entity, MesRecipeSaveRequest request) {
        if (StringUtils.hasText(request.getRecipeNo())) {
            entity.setRecipeNo(request.getRecipeNo());
        }
        if (StringUtils.hasText(request.getRecipeName())) {
            entity.setRecipeName(request.getRecipeName());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getParamCode())) {
            entity.setParamCode(request.getParamCode());
        }
        if (StringUtils.hasText(request.getParamName())) {
            entity.setParamName(request.getParamName());
        }
        if (StringUtils.hasText(request.getParamValue())) {
            entity.setParamValue(request.getParamValue());
        }
        if (StringUtils.hasText(request.getParamUnit())) {
            entity.setParamUnit(request.getParamUnit());
        }
        if (request.getUpperLimit() != null) {
            entity.setUpperLimit(request.getUpperLimit());
        }
        if (request.getLowerLimit() != null) {
            entity.setLowerLimit(request.getLowerLimit());
        }
        if (StringUtils.hasText(request.getRecipeStatus())) {
            entity.setRecipeStatus(request.getRecipeStatus());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
