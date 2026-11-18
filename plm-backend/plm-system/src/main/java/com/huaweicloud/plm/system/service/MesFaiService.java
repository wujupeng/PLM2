package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesFaiQuery;
import com.huaweicloud.plm.system.dto.MesFaiSaveRequest;
import com.huaweicloud.plm.system.entity.MesFai;
import com.huaweicloud.plm.system.mapper.MesFaiMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 首件确认服务。
 */
@Service
@RequiredArgsConstructor
public class MesFaiService {

    private static final String DEFAULT_NO_PREFIX = "MFA";
    private static final String DEFAULT_FAI_RESULT = "PASS";
    private static final String DEFAULT_FAI_STATUS = "PENDING";

    private final MesFaiMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesFai> page(MesFaiQuery query) {
        String keyword = query.getKeyword();
        Page<MesFai> page = mapper.selectPage(query.toPage(), Wrappers.<MesFai>lambdaQuery()
                .eq(StringUtils.hasText(query.getFaiStatus()), MesFai::getFaiStatus, query.getFaiStatus())
                .eq(StringUtils.hasText(query.getFaiResult()), MesFai::getFaiResult, query.getFaiResult())
                .eq(StringUtils.hasText(query.getProcessCode()), MesFai::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesFai::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesFai::getFaiNo, keyword).or()
                        .like(MesFai::getWorkOrderNo, keyword).or()
                        .like(MesFai::getProcessCode, keyword).or()
                        .like(MesFai::getMaterialCode, keyword))
                .orderByDesc(MesFai::getId));
        return PageResult.of(page);
    }

    public MesFai detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesFaiSaveRequest request) {
        MesFai entity;
        if (id == null) {
            entity = new MesFai();
            entity.setFaiNo(StringUtils.hasText(request.getFaiNo())
                    ? request.getFaiNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setFaiResult(StringUtils.hasText(request.getFaiResult())
                    ? request.getFaiResult() : DEFAULT_FAI_RESULT);
            entity.setFaiStatus(StringUtils.hasText(request.getFaiStatus())
                    ? request.getFaiStatus() : DEFAULT_FAI_STATUS);
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

    private MesFai require(Long id) {
        MesFai entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "首件确认不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesFai entity, MesFaiSaveRequest request) {
        if (StringUtils.hasText(request.getFaiNo())) {
            entity.setFaiNo(request.getFaiNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
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
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getInspector())) {
            entity.setInspector(request.getInspector());
        }
        if (request.getInspectTime() != null) {
            entity.setInspectTime(request.getInspectTime());
        }
        if (StringUtils.hasText(request.getFaiResult())) {
            entity.setFaiResult(request.getFaiResult());
        }
        if (StringUtils.hasText(request.getFaiStatus())) {
            entity.setFaiStatus(request.getFaiStatus());
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
