package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesEquipmentFaultQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentFaultSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentFault;
import com.huaweicloud.plm.system.mapper.MesEquipmentFaultMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 设备故障记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesEquipmentFaultService {

    private static final String DEFAULT_NO_PREFIX = "MEF";
    private static final String DEFAULT_FAULT_LEVEL = "MEDIUM";
    private static final String DEFAULT_FAULT_STATUS = "DRAFT";

    private final MesEquipmentFaultMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesEquipmentFault> page(MesEquipmentFaultQuery query) {
        String keyword = query.getKeyword();
        Page<MesEquipmentFault> page = mapper.selectPage(query.toPage(), Wrappers.<MesEquipmentFault>lambdaQuery()
                .eq(StringUtils.hasText(query.getFaultLevel()), MesEquipmentFault::getFaultLevel, query.getFaultLevel())
                .eq(StringUtils.hasText(query.getFaultStatus()), MesEquipmentFault::getFaultStatus, query.getFaultStatus())
                .eq(StringUtils.hasText(query.getFaultType()), MesEquipmentFault::getFaultType, query.getFaultType())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesEquipmentFault::getEquipmentCode, query.getEquipmentCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesEquipmentFault::getFaultNo, keyword).or()
                        .like(MesEquipmentFault::getEquipmentCode, keyword).or()
                        .like(MesEquipmentFault::getEquipmentName, keyword).or()
                        .like(MesEquipmentFault::getFaultType, keyword))
                .orderByDesc(MesEquipmentFault::getId));
        return PageResult.of(page);
    }

    public MesEquipmentFault detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesEquipmentFaultSaveRequest request) {
        MesEquipmentFault entity;
        if (id == null) {
            entity = new MesEquipmentFault();
            entity.setFaultNo(StringUtils.hasText(request.getFaultNo())
                    ? request.getFaultNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setFaultLevel(StringUtils.hasText(request.getFaultLevel())
                    ? request.getFaultLevel() : DEFAULT_FAULT_LEVEL);
            entity.setFaultStatus(StringUtils.hasText(request.getFaultStatus())
                    ? request.getFaultStatus() : DEFAULT_FAULT_STATUS);
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

    private MesEquipmentFault require(Long id) {
        MesEquipmentFault entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "设备故障记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesEquipmentFault entity, MesEquipmentFaultSaveRequest request) {
        if (StringUtils.hasText(request.getFaultNo())) {
            entity.setFaultNo(request.getFaultNo());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getEquipmentName())) {
            entity.setEquipmentName(request.getEquipmentName());
        }
        if (StringUtils.hasText(request.getFaultType())) {
            entity.setFaultType(request.getFaultType());
        }
        if (StringUtils.hasText(request.getFaultLevel())) {
            entity.setFaultLevel(request.getFaultLevel());
        }
        if (StringUtils.hasText(request.getFaultDesc())) {
            entity.setFaultDesc(request.getFaultDesc());
        }
        if (request.getOccurTime() != null) {
            entity.setOccurTime(request.getOccurTime());
        }
        if (StringUtils.hasText(request.getReporter())) {
            entity.setReporter(request.getReporter());
        }
        if (StringUtils.hasText(request.getRepairer())) {
            entity.setRepairer(request.getRepairer());
        }
        if (request.getRepairTime() != null) {
            entity.setRepairTime(request.getRepairTime());
        }
        if (request.getDowntimeMinutes() != null) {
            entity.setDowntimeMinutes(request.getDowntimeMinutes());
        }
        if (StringUtils.hasText(request.getFaultStatus())) {
            entity.setFaultStatus(request.getFaultStatus());
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
