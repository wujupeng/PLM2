package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesPatrolInspectionQuery;
import com.huaweicloud.plm.system.dto.MesPatrolInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesPatrolInspection;
import com.huaweicloud.plm.system.mapper.MesPatrolInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 巡检记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesPatrolInspectionService {

    private static final String DEFAULT_NO_PREFIX = "MPI";
    private static final String DEFAULT_INSPECTION_STATUS = "PENDING";

    private final MesPatrolInspectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesPatrolInspection> page(MesPatrolInspectionQuery query) {
        String keyword = query.getKeyword();
        Page<MesPatrolInspection> page = mapper.selectPage(query.toPage(), Wrappers.<MesPatrolInspection>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionStatus()), MesPatrolInspection::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getInspectionResult()), MesPatrolInspection::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesPatrolInspection::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesPatrolInspection::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesPatrolInspection::getEquipmentCode, query.getEquipmentCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesPatrolInspection::getPatrolNo, keyword).or()
                        .like(MesPatrolInspection::getWorkOrderNo, keyword).or()
                        .like(MesPatrolInspection::getMaterialCode, keyword).or()
                        .like(MesPatrolInspection::getProcessName, keyword))
                .orderByDesc(MesPatrolInspection::getId));
        return PageResult.of(page);
    }

    public MesPatrolInspection detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesPatrolInspectionSaveRequest request) {
        MesPatrolInspection entity;
        if (id == null) {
            entity = new MesPatrolInspection();
            entity.setPatrolNo(StringUtils.hasText(request.getPatrolNo())
                    ? request.getPatrolNo()
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

    private MesPatrolInspection require(Long id) {
        MesPatrolInspection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "巡检记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesPatrolInspection entity, MesPatrolInspectionSaveRequest request) {
        if (StringUtils.hasText(request.getPatrolNo())) {
            entity.setPatrolNo(request.getPatrolNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
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
        if (StringUtils.hasText(request.getInspectionItem())) {
            entity.setInspectionItem(request.getInspectionItem());
        }
        if (StringUtils.hasText(request.getStandardValue())) {
            entity.setStandardValue(request.getStandardValue());
        }
        if (StringUtils.hasText(request.getActualValue())) {
            entity.setActualValue(request.getActualValue());
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
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
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
