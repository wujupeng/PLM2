package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesEquipmentQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipment;
import com.huaweicloud.plm.system.mapper.MesEquipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 设备台账服务。
 */
@Service
@RequiredArgsConstructor
public class MesEquipmentService {

    private static final String DEFAULT_NO_PREFIX = "MEQ";
    private static final String DEFAULT_EQUIPMENT_STATUS = "IDLE";

    private final MesEquipmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesEquipment> page(MesEquipmentQuery query) {
        String keyword = query.getKeyword();
        Page<MesEquipment> page = mapper.selectPage(query.toPage(), Wrappers.<MesEquipment>lambdaQuery()
                .eq(StringUtils.hasText(query.getEquipmentStatus()), MesEquipment::getEquipmentStatus, query.getEquipmentStatus())
                .eq(StringUtils.hasText(query.getEquipmentType()), MesEquipment::getEquipmentType, query.getEquipmentType())
                .eq(StringUtils.hasText(query.getWorkshopCode()), MesEquipment::getWorkshopCode, query.getWorkshopCode())
                .eq(StringUtils.hasText(query.getLineCode()), MesEquipment::getLineCode, query.getLineCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesEquipment::getEquipmentNo, keyword).or()
                        .like(MesEquipment::getEquipmentName, keyword).or()
                        .like(MesEquipment::getEquipmentType, keyword).or()
                        .like(MesEquipment::getModel, keyword).or()
                        .like(MesEquipment::getWorkshopCode, keyword))
                .orderByDesc(MesEquipment::getId));
        return PageResult.of(page);
    }

    public MesEquipment detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesEquipmentSaveRequest request) {
        MesEquipment entity;
        if (id == null) {
            entity = new MesEquipment();
            entity.setEquipmentNo(StringUtils.hasText(request.getEquipmentNo())
                    ? request.getEquipmentNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setEquipmentStatus(StringUtils.hasText(request.getEquipmentStatus())
                    ? request.getEquipmentStatus() : DEFAULT_EQUIPMENT_STATUS);
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

    private MesEquipment require(Long id) {
        MesEquipment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "设备台账不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesEquipment entity, MesEquipmentSaveRequest request) {
        if (StringUtils.hasText(request.getEquipmentNo())) {
            entity.setEquipmentNo(request.getEquipmentNo());
        }
        if (StringUtils.hasText(request.getEquipmentName())) {
            entity.setEquipmentName(request.getEquipmentName());
        }
        if (StringUtils.hasText(request.getEquipmentType())) {
            entity.setEquipmentType(request.getEquipmentType());
        }
        if (StringUtils.hasText(request.getModel())) {
            entity.setModel(request.getModel());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getManufacturer())) {
            entity.setManufacturer(request.getManufacturer());
        }
        if (StringUtils.hasText(request.getWorkshopCode())) {
            entity.setWorkshopCode(request.getWorkshopCode());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getLocation())) {
            entity.setLocation(request.getLocation());
        }
        if (request.getPurchaseDate() != null) {
            entity.setPurchaseDate(request.getPurchaseDate());
        }
        if (request.getInstallDate() != null) {
            entity.setInstallDate(request.getInstallDate());
        }
        if (request.getWarrantyEndDate() != null) {
            entity.setWarrantyEndDate(request.getWarrantyEndDate());
        }
        if (StringUtils.hasText(request.getEquipmentStatus())) {
            entity.setEquipmentStatus(request.getEquipmentStatus());
        }
        if (StringUtils.hasText(request.getManager())) {
            entity.setManager(request.getManager());
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
