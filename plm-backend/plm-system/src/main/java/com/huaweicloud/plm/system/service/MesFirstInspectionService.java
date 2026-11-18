package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesFirstInspectionQuery;
import com.huaweicloud.plm.system.dto.MesFirstInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesFirstInspection;
import com.huaweicloud.plm.system.mapper.MesFirstInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 首件检验单服务。
 */
@Service
@RequiredArgsConstructor
public class MesFirstInspectionService {

    private static final String DEFAULT_NO_PREFIX = "MFA";
    private static final String DEFAULT_INSPECTION_STATUS = "PENDING";

    private final MesFirstInspectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesFirstInspection> page(MesFirstInspectionQuery query) {
        String keyword = query.getKeyword();
        Page<MesFirstInspection> page = mapper.selectPage(query.toPage(), Wrappers.<MesFirstInspection>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionStatus()), MesFirstInspection::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getInspectionResult()), MesFirstInspection::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesFirstInspection::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesFirstInspection::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesFirstInspection::getEquipmentCode, query.getEquipmentCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesFirstInspection::getFirstNo, keyword).or()
                        .like(MesFirstInspection::getWorkOrderNo, keyword).or()
                        .like(MesFirstInspection::getMaterialCode, keyword).or()
                        .like(MesFirstInspection::getProcessName, keyword))
                .orderByDesc(MesFirstInspection::getId));
        return PageResult.of(page);
    }

    public MesFirstInspection detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesFirstInspectionSaveRequest request) {
        MesFirstInspection entity;
        if (id == null) {
            entity = new MesFirstInspection();
            entity.setFirstNo(StringUtils.hasText(request.getFirstNo())
                    ? request.getFirstNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setInspectionStatus(StringUtils.hasText(request.getInspectionStatus())
                    ? request.getInspectionStatus() : DEFAULT_INSPECTION_STATUS);
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

    private MesFirstInspection require(Long id) {
        MesFirstInspection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "首件检验单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesFirstInspection entity, MesFirstInspectionSaveRequest request) {
        if (StringUtils.hasText(request.getFirstNo())) {
            entity.setFirstNo(request.getFirstNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (StringUtils.hasText(request.getDispatchNo())) {
            entity.setDispatchNo(request.getDispatchNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getProcessName())) {
            entity.setProcessName(request.getProcessName());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getInspectionItem())) {
            entity.setInspectionItem(request.getInspectionItem());
        }
        if (StringUtils.hasText(request.getInspectionResult())) {
            entity.setInspectionResult(request.getInspectionResult());
        }
        if (StringUtils.hasText(request.getInspectionStatus())) {
            entity.setInspectionStatus(request.getInspectionStatus());
        }
        if (StringUtils.hasText(request.getInspector())) {
            entity.setInspector(request.getInspector());
        }
        if (request.getInspectionTime() != null) {
            entity.setInspectionTime(request.getInspectionTime());
        }
        if (StringUtils.hasText(request.getJudgeNo())) {
            entity.setJudgeNo(request.getJudgeNo());
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
