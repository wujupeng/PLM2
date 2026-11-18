package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesEquipmentStatusQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentStatusSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentStatus;
import com.huaweicloud.plm.system.mapper.MesEquipmentStatusMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * MES 设备状态记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesEquipmentStatusService {

    private static final String DEFAULT_NO_PREFIX = "MEQST";
    private static final String DEFAULT_STATUS_TYPE = "RUNNING";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesEquipmentStatusMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesEquipmentStatus> page(MesEquipmentStatusQuery query) {
        String keyword = query.getKeyword();
        Page<MesEquipmentStatus> page = mapper.selectPage(query.toPage(), Wrappers.<MesEquipmentStatus>lambdaQuery()
                .eq(StringUtils.hasText(query.getStatusType()), MesEquipmentStatus::getStatusType, query.getStatusType())
                .eq(StringUtils.hasText(query.getRecordStatus()), MesEquipmentStatus::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesEquipmentStatus::getEquipmentCode, query.getEquipmentCode())
                .eq(StringUtils.hasText(query.getOperator()), MesEquipmentStatus::getOperator, query.getOperator())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesEquipmentStatus::getStatusNo, keyword).or()
                        .like(MesEquipmentStatus::getEquipmentCode, keyword).or()
                        .like(MesEquipmentStatus::getEquipmentName, keyword).or()
                        .like(MesEquipmentStatus::getOperator, keyword))
                .orderByDesc(MesEquipmentStatus::getId));
        return PageResult.of(page);
    }

    public MesEquipmentStatus detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesEquipmentStatusSaveRequest request) {
        MesEquipmentStatus entity;
        if (id == null) {
            entity = new MesEquipmentStatus();
            entity.setStatusNo(StringUtils.hasText(request.getStatusNo())
                    ? request.getStatusNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setStatusType(StringUtils.hasText(request.getStatusType())
                    ? request.getStatusType() : DEFAULT_STATUS_TYPE);
            entity.setRecordStatus(StringUtils.hasText(request.getRecordStatus())
                    ? request.getRecordStatus() : DEFAULT_RECORD_STATUS);
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

    private MesEquipmentStatus require(Long id) {
        MesEquipmentStatus entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "设备状态记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesEquipmentStatus entity, MesEquipmentStatusSaveRequest request) {
        if (StringUtils.hasText(request.getStatusNo())) {
            entity.setStatusNo(request.getStatusNo());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getEquipmentName())) {
            entity.setEquipmentName(request.getEquipmentName());
        }
        if (StringUtils.hasText(request.getStatusType())) {
            entity.setStatusType(request.getStatusType());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (request.getDurationMinutes() != null) {
            entity.setDurationMinutes(request.getDurationMinutes());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
        }
        if (StringUtils.hasText(request.getRecordStatus())) {
            entity.setRecordStatus(request.getRecordStatus());
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
