package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesQuarantineQuery;
import com.huaweicloud.plm.system.dto.MesQuarantineSaveRequest;
import com.huaweicloud.plm.system.entity.MesQuarantine;
import com.huaweicloud.plm.system.mapper.MesQuarantineMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 隔离记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesQuarantineService {

    private static final String DEFAULT_NO_PREFIX = "MQT";
    private static final String DEFAULT_QUARANTINE_TYPE = "SUSPECT";
    private static final String DEFAULT_QUARANTINE_STATUS = "PENDING";

    private final MesQuarantineMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesQuarantine> page(MesQuarantineQuery query) {
        String keyword = query.getKeyword();
        Page<MesQuarantine> page = mapper.selectPage(query.toPage(), Wrappers.<MesQuarantine>lambdaQuery()
                .eq(StringUtils.hasText(query.getQuarantineStatus()), MesQuarantine::getQuarantineStatus, query.getQuarantineStatus())
                .eq(StringUtils.hasText(query.getQuarantineType()), MesQuarantine::getQuarantineType, query.getQuarantineType())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesQuarantine::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesQuarantine::getQuarantineNo, keyword).or()
                        .like(MesQuarantine::getMaterialCode, keyword).or()
                        .like(MesQuarantine::getMaterialName, keyword).or()
                        .like(MesQuarantine::getSourceNo, keyword))
                .orderByDesc(MesQuarantine::getId));
        return PageResult.of(page);
    }

    public MesQuarantine detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesQuarantineSaveRequest request) {
        MesQuarantine entity;
        if (id == null) {
            entity = new MesQuarantine();
            entity.setQuarantineNo(StringUtils.hasText(request.getQuarantineNo())
                    ? request.getQuarantineNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setQuarantineType(StringUtils.hasText(request.getQuarantineType())
                    ? request.getQuarantineType() : DEFAULT_QUARANTINE_TYPE);
            entity.setQuarantineStatus(StringUtils.hasText(request.getQuarantineStatus())
                    ? request.getQuarantineStatus() : DEFAULT_QUARANTINE_STATUS);
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

    private MesQuarantine require(Long id) {
        MesQuarantine entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "隔离记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesQuarantine entity, MesQuarantineSaveRequest request) {
        if (StringUtils.hasText(request.getQuarantineNo())) {
            entity.setQuarantineNo(request.getQuarantineNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getQuarantineQty() != null) {
            entity.setQuarantineQty(request.getQuarantineQty());
        }
        if (StringUtils.hasText(request.getQuarantineType())) {
            entity.setQuarantineType(request.getQuarantineType());
        }
        if (StringUtils.hasText(request.getQuarantineStatus())) {
            entity.setQuarantineStatus(request.getQuarantineStatus());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getLocation())) {
            entity.setLocation(request.getLocation());
        }
        if (StringUtils.hasText(request.getReason())) {
            entity.setReason(request.getReason());
        }
        if (StringUtils.hasText(request.getApplicant())) {
            entity.setApplicant(request.getApplicant());
        }
        if (request.getApplyTime() != null) {
            entity.setApplyTime(request.getApplyTime());
        }
        if (StringUtils.hasText(request.getHandler())) {
            entity.setHandler(request.getHandler());
        }
        if (request.getHandleTime() != null) {
            entity.setHandleTime(request.getHandleTime());
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
