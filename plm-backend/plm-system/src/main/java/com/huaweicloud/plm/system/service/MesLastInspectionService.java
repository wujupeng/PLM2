package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesLastInspectionQuery;
import com.huaweicloud.plm.system.dto.MesLastInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesLastInspection;
import com.huaweicloud.plm.system.mapper.MesLastInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 末件检验单服务。
 */
@Service
@RequiredArgsConstructor
public class MesLastInspectionService {

    private static final String DEFAULT_NO_PREFIX = "MLA";
    private static final String DEFAULT_INSPECTION_STATUS = "PENDING";

    private final MesLastInspectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesLastInspection> page(MesLastInspectionQuery query) {
        String keyword = query.getKeyword();
        Page<MesLastInspection> page = mapper.selectPage(query.toPage(), Wrappers.<MesLastInspection>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionStatus()), MesLastInspection::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getInspectionResult()), MesLastInspection::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesLastInspection::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesLastInspection::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesLastInspection::getEquipmentCode, query.getEquipmentCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesLastInspection::getLastNo, keyword).or()
                        .like(MesLastInspection::getWorkOrderNo, keyword).or()
                        .like(MesLastInspection::getMaterialCode, keyword).or()
                        .like(MesLastInspection::getProcessName, keyword))
                .orderByDesc(MesLastInspection::getId));
        return PageResult.of(page);
    }

    public MesLastInspection detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesLastInspectionSaveRequest request) {
        MesLastInspection entity;
        if (id == null) {
            entity = new MesLastInspection();
            entity.setLastNo(StringUtils.hasText(request.getLastNo())
                    ? request.getLastNo()
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

    private MesLastInspection require(Long id) {
        MesLastInspection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "末件检验单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesLastInspection entity, MesLastInspectionSaveRequest request) {
        if (StringUtils.hasText(request.getLastNo())) {
            entity.setLastNo(request.getLastNo());
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
