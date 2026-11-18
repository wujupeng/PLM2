package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesToolLifeQuery;
import com.huaweicloud.plm.system.dto.MesToolLifeSaveRequest;
import com.huaweicloud.plm.system.entity.MesToolLife;
import com.huaweicloud.plm.system.mapper.MesToolLifeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 工装寿命服务。
 */
@Service
@RequiredArgsConstructor
public class MesToolLifeService {

    private static final String DEFAULT_NO_PREFIX = "MTL";
    private static final String DEFAULT_LIFE_STATUS = "DRAFT";

    private final MesToolLifeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesToolLife> page(MesToolLifeQuery query) {
        String keyword = query.getKeyword();
        Page<MesToolLife> page = mapper.selectPage(query.toPage(), Wrappers.<MesToolLife>lambdaQuery()
                .eq(StringUtils.hasText(query.getLifeStatus()), MesToolLife::getLifeStatus, query.getLifeStatus())
                .eq(StringUtils.hasText(query.getToolType()), MesToolLife::getToolType, query.getToolType())
                .eq(StringUtils.hasText(query.getToolCode()), MesToolLife::getToolCode, query.getToolCode())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesToolLife::getEquipmentCode, query.getEquipmentCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesToolLife::getToolNo, keyword).or()
                        .like(MesToolLife::getToolCode, keyword).or()
                        .like(MesToolLife::getToolName, keyword).or()
                        .like(MesToolLife::getToolType, keyword))
                .orderByDesc(MesToolLife::getId));
        return PageResult.of(page);
    }

    public MesToolLife detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesToolLifeSaveRequest request) {
        MesToolLife entity;
        if (id == null) {
            entity = new MesToolLife();
            entity.setToolNo(StringUtils.hasText(request.getToolNo())
                    ? request.getToolNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setLifeStatus(StringUtils.hasText(request.getLifeStatus())
                    ? request.getLifeStatus() : DEFAULT_LIFE_STATUS);
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

    private MesToolLife require(Long id) {
        MesToolLife entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工装寿命记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesToolLife entity, MesToolLifeSaveRequest request) {
        if (StringUtils.hasText(request.getToolNo())) {
            entity.setToolNo(request.getToolNo());
        }
        if (StringUtils.hasText(request.getToolCode())) {
            entity.setToolCode(request.getToolCode());
        }
        if (StringUtils.hasText(request.getToolName())) {
            entity.setToolName(request.getToolName());
        }
        if (StringUtils.hasText(request.getToolType())) {
            entity.setToolType(request.getToolType());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (request.getTotalLife() != null) {
            entity.setTotalLife(request.getTotalLife());
        }
        if (request.getUsedLife() != null) {
            entity.setUsedLife(request.getUsedLife());
        }
        if (request.getRemainingLife() != null) {
            entity.setRemainingLife(request.getRemainingLife());
        }
        if (StringUtils.hasText(request.getLifeUnit())) {
            entity.setLifeUnit(request.getLifeUnit());
        }
        if (StringUtils.hasText(request.getLifeStatus())) {
            entity.setLifeStatus(request.getLifeStatus());
        }
        if (request.getInstallDate() != null) {
            entity.setInstallDate(request.getInstallDate());
        }
        if (request.getScrappedDate() != null) {
            entity.setScrappedDate(request.getScrappedDate());
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
