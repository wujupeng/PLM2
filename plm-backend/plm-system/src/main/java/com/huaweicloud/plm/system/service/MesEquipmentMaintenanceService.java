package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesEquipmentMaintenanceQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentMaintenanceSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentMaintenance;
import com.huaweicloud.plm.system.mapper.MesEquipmentMaintenanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 设备保养记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesEquipmentMaintenanceService {

    private static final String DEFAULT_NO_PREFIX = "MEM";
    private static final String DEFAULT_MAINTENANCE_TYPE = "DAILY";
    private static final String DEFAULT_MAINTENANCE_STATUS = "DRAFT";

    private final MesEquipmentMaintenanceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesEquipmentMaintenance> page(MesEquipmentMaintenanceQuery query) {
        String keyword = query.getKeyword();
        Page<MesEquipmentMaintenance> page = mapper.selectPage(query.toPage(), Wrappers.<MesEquipmentMaintenance>lambdaQuery()
                .eq(StringUtils.hasText(query.getMaintenanceType()), MesEquipmentMaintenance::getMaintenanceType, query.getMaintenanceType())
                .eq(StringUtils.hasText(query.getMaintenanceStatus()), MesEquipmentMaintenance::getMaintenanceStatus, query.getMaintenanceStatus())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesEquipmentMaintenance::getEquipmentCode, query.getEquipmentCode())
                .eq(StringUtils.hasText(query.getMaintainer()), MesEquipmentMaintenance::getMaintainer, query.getMaintainer())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesEquipmentMaintenance::getMaintenanceNo, keyword).or()
                        .like(MesEquipmentMaintenance::getEquipmentCode, keyword).or()
                        .like(MesEquipmentMaintenance::getEquipmentName, keyword).or()
                        .like(MesEquipmentMaintenance::getMaintainer, keyword))
                .orderByDesc(MesEquipmentMaintenance::getId));
        return PageResult.of(page);
    }

    public MesEquipmentMaintenance detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesEquipmentMaintenanceSaveRequest request) {
        MesEquipmentMaintenance entity;
        if (id == null) {
            entity = new MesEquipmentMaintenance();
            entity.setMaintenanceNo(StringUtils.hasText(request.getMaintenanceNo())
                    ? request.getMaintenanceNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setMaintenanceType(StringUtils.hasText(request.getMaintenanceType())
                    ? request.getMaintenanceType() : DEFAULT_MAINTENANCE_TYPE);
            entity.setMaintenanceStatus(StringUtils.hasText(request.getMaintenanceStatus())
                    ? request.getMaintenanceStatus() : DEFAULT_MAINTENANCE_STATUS);
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

    private MesEquipmentMaintenance require(Long id) {
        MesEquipmentMaintenance entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "设备保养记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesEquipmentMaintenance entity, MesEquipmentMaintenanceSaveRequest request) {
        if (StringUtils.hasText(request.getMaintenanceNo())) {
            entity.setMaintenanceNo(request.getMaintenanceNo());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getEquipmentName())) {
            entity.setEquipmentName(request.getEquipmentName());
        }
        if (StringUtils.hasText(request.getMaintenanceType())) {
            entity.setMaintenanceType(request.getMaintenanceType());
        }
        if (request.getPlanTime() != null) {
            entity.setPlanTime(request.getPlanTime());
        }
        if (request.getActualTime() != null) {
            entity.setActualTime(request.getActualTime());
        }
        if (StringUtils.hasText(request.getMaintainer())) {
            entity.setMaintainer(request.getMaintainer());
        }
        if (request.getCost() != null) {
            entity.setCost(request.getCost());
        }
        if (StringUtils.hasText(request.getMaintenanceStatus())) {
            entity.setMaintenanceStatus(request.getMaintenanceStatus());
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
