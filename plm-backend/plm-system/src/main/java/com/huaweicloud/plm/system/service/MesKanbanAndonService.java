package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesKanbanAndonQuery;
import com.huaweicloud.plm.system.dto.MesKanbanAndonSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanAndon;
import com.huaweicloud.plm.system.mapper.MesKanbanAndonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 异常安灯记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesKanbanAndonService {

    private static final String DEFAULT_NO_PREFIX = "MKA";
    private static final String DEFAULT_ANDON_TYPE = "EQUIPMENT";
    private static final String DEFAULT_ANDON_LEVEL = "MEDIUM";
    private static final String DEFAULT_ANDON_STATUS = "TRIGGERED";

    private final MesKanbanAndonMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesKanbanAndon> page(MesKanbanAndonQuery query) {
        String keyword = query.getKeyword();
        Page<MesKanbanAndon> page = mapper.selectPage(query.toPage(), Wrappers.<MesKanbanAndon>lambdaQuery()
                .eq(StringUtils.hasText(query.getAndonType()), MesKanbanAndon::getAndonType, query.getAndonType())
                .eq(StringUtils.hasText(query.getAndonLevel()), MesKanbanAndon::getAndonLevel, query.getAndonLevel())
                .eq(StringUtils.hasText(query.getAndonStatus()), MesKanbanAndon::getAndonStatus, query.getAndonStatus())
                .eq(StringUtils.hasText(query.getLineCode()), MesKanbanAndon::getLineCode, query.getLineCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesKanbanAndon::getAndonNo, keyword).or()
                        .like(MesKanbanAndon::getLineCode, keyword).or()
                        .like(MesKanbanAndon::getStationCode, keyword).or()
                        .like(MesKanbanAndon::getTriggerBy, keyword))
                .orderByDesc(MesKanbanAndon::getId));
        return PageResult.of(page);
    }

    public MesKanbanAndon detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesKanbanAndonSaveRequest request) {
        MesKanbanAndon entity;
        if (id == null) {
            entity = new MesKanbanAndon();
            entity.setAndonNo(StringUtils.hasText(request.getAndonNo())
                    ? request.getAndonNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setAndonType(StringUtils.hasText(request.getAndonType())
                    ? request.getAndonType() : DEFAULT_ANDON_TYPE);
            entity.setAndonLevel(StringUtils.hasText(request.getAndonLevel())
                    ? request.getAndonLevel() : DEFAULT_ANDON_LEVEL);
            entity.setAndonStatus(StringUtils.hasText(request.getAndonStatus())
                    ? request.getAndonStatus() : DEFAULT_ANDON_STATUS);
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

    private MesKanbanAndon require(Long id) {
        MesKanbanAndon entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "异常安灯记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesKanbanAndon entity, MesKanbanAndonSaveRequest request) {
        if (StringUtils.hasText(request.getAndonNo())) {
            entity.setAndonNo(request.getAndonNo());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getStationCode())) {
            entity.setStationCode(request.getStationCode());
        }
        if (StringUtils.hasText(request.getAndonType())) {
            entity.setAndonType(request.getAndonType());
        }
        if (StringUtils.hasText(request.getAndonLevel())) {
            entity.setAndonLevel(request.getAndonLevel());
        }
        if (StringUtils.hasText(request.getAndonStatus())) {
            entity.setAndonStatus(request.getAndonStatus());
        }
        if (request.getTriggerTime() != null) {
            entity.setTriggerTime(request.getTriggerTime());
        }
        if (request.getResponseTime() != null) {
            entity.setResponseTime(request.getResponseTime());
        }
        if (request.getCloseTime() != null) {
            entity.setCloseTime(request.getCloseTime());
        }
        if (StringUtils.hasText(request.getTriggerBy())) {
            entity.setTriggerBy(request.getTriggerBy());
        }
        if (StringUtils.hasText(request.getHandler())) {
            entity.setHandler(request.getHandler());
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
