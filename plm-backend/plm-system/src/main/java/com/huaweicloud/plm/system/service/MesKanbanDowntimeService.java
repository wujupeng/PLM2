package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesKanbanDowntimeQuery;
import com.huaweicloud.plm.system.dto.MesKanbanDowntimeSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanDowntime;
import com.huaweicloud.plm.system.mapper.MesKanbanDowntimeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 停机看板记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesKanbanDowntimeService {

    private static final String DEFAULT_NO_PREFIX = "MKD";
    private static final String DEFAULT_DOWNTIME_TYPE = "EQUIPMENT";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesKanbanDowntimeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesKanbanDowntime> page(MesKanbanDowntimeQuery query) {
        String keyword = query.getKeyword();
        Page<MesKanbanDowntime> page = mapper.selectPage(query.toPage(), Wrappers.<MesKanbanDowntime>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordStatus()), MesKanbanDowntime::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getDowntimeType()), MesKanbanDowntime::getDowntimeType, query.getDowntimeType())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesKanbanDowntime::getEquipmentCode, query.getEquipmentCode())
                .eq(StringUtils.hasText(query.getLineCode()), MesKanbanDowntime::getLineCode, query.getLineCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesKanbanDowntime::getDowntimeNo, keyword).or()
                        .like(MesKanbanDowntime::getEquipmentCode, keyword).or()
                        .like(MesKanbanDowntime::getEquipmentName, keyword).or()
                        .like(MesKanbanDowntime::getLineCode, keyword))
                .orderByDesc(MesKanbanDowntime::getId));
        return PageResult.of(page);
    }

    public MesKanbanDowntime detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesKanbanDowntimeSaveRequest request) {
        MesKanbanDowntime entity;
        if (id == null) {
            entity = new MesKanbanDowntime();
            entity.setDowntimeNo(StringUtils.hasText(request.getDowntimeNo())
                    ? request.getDowntimeNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDowntimeType(StringUtils.hasText(request.getDowntimeType())
                    ? request.getDowntimeType() : DEFAULT_DOWNTIME_TYPE);
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

    private MesKanbanDowntime require(Long id) {
        MesKanbanDowntime entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "停机看板记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesKanbanDowntime entity, MesKanbanDowntimeSaveRequest request) {
        if (StringUtils.hasText(request.getDowntimeNo())) {
            entity.setDowntimeNo(request.getDowntimeNo());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getEquipmentName())) {
            entity.setEquipmentName(request.getEquipmentName());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getDowntimeType())) {
            entity.setDowntimeType(request.getDowntimeType());
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
        if (StringUtils.hasText(request.getReason())) {
            entity.setReason(request.getReason());
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
