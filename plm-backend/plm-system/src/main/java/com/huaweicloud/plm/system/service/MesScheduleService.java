package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesScheduleQuery;
import com.huaweicloud.plm.system.dto.MesScheduleSaveRequest;
import com.huaweicloud.plm.system.entity.MesSchedule;
import com.huaweicloud.plm.system.mapper.MesScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 排产计划服务。
 */
@Service
@RequiredArgsConstructor
public class MesScheduleService {

    private static final String DEFAULT_NO_PREFIX = "MSC";
    private static final String DEFAULT_SCHEDULE_STATUS = "DRAFT";

    private final MesScheduleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesSchedule> page(MesScheduleQuery query) {
        String keyword = query.getKeyword();
        Page<MesSchedule> page = mapper.selectPage(query.toPage(), Wrappers.<MesSchedule>lambdaQuery()
                .eq(StringUtils.hasText(query.getScheduleStatus()), MesSchedule::getScheduleStatus, query.getScheduleStatus())
                .eq(StringUtils.hasText(query.getLineCode()), MesSchedule::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesSchedule::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesSchedule::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesSchedule::getScheduleNo, keyword).or()
                        .like(MesSchedule::getWorkOrderNo, keyword).or()
                        .like(MesSchedule::getMaterialCode, keyword).or()
                        .like(MesSchedule::getMaterialName, keyword))
                .orderByDesc(MesSchedule::getId));
        return PageResult.of(page);
    }

    public MesSchedule detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesScheduleSaveRequest request) {
        MesSchedule entity;
        if (id == null) {
            entity = new MesSchedule();
            entity.setScheduleNo(StringUtils.hasText(request.getScheduleNo())
                    ? request.getScheduleNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setScheduleStatus(StringUtils.hasText(request.getScheduleStatus())
                    ? request.getScheduleStatus() : DEFAULT_SCHEDULE_STATUS);
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

    private MesSchedule require(Long id) {
        MesSchedule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "排产计划不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesSchedule entity, MesScheduleSaveRequest request) {
        if (StringUtils.hasText(request.getScheduleNo())) {
            entity.setScheduleNo(request.getScheduleNo());
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
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getScheduledQty() != null) {
            entity.setScheduledQty(request.getScheduledQty());
        }
        if (request.getScheduleStartTime() != null) {
            entity.setScheduleStartTime(request.getScheduleStartTime());
        }
        if (request.getScheduleEndTime() != null) {
            entity.setScheduleEndTime(request.getScheduleEndTime());
        }
        if (StringUtils.hasText(request.getScheduleStatus())) {
            entity.setScheduleStatus(request.getScheduleStatus());
        }
        if (StringUtils.hasText(request.getScheduler())) {
            entity.setScheduler(request.getScheduler());
        }
        if (request.getScheduleTime() != null) {
            entity.setScheduleTime(request.getScheduleTime());
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
