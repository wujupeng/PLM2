package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpDocTrackEventQuery;
import com.huaweicloud.plm.system.dto.ErpDocTrackEventSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDocTrackEvent;
import com.huaweicloud.plm.system.mapper.ErpDocTrackEventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 业务单据追踪—业务事件（对应 WBS G3-N7a ERP 业务单据追踪）：
 * 事件登记、分页查询与删除。
 * 追溯号由用户填写，无需自动编号；表上无唯一业务编码索引，删除走逻辑删除。
 */
@Service
@RequiredArgsConstructor
public class ErpDocTrackEventService {

    private static final String DEFAULT_EVENT_TYPE = "STATUS_CHANGE";
    private static final String DEFAULT_EVENT_STATUS = "DONE";

    private final ErpDocTrackEventMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询业务事件：追溯号/事件类型/事件状态精确，追溯号/事件名称/操作人名称模糊，按主键倒序。 */
    public PageResult<ErpDocTrackEvent> page(ErpDocTrackEventQuery query) {
        Page<ErpDocTrackEvent> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpDocTrackEvent>lambdaQuery()
                .eq(StringUtils.hasText(query.getTraceNo()),
                        ErpDocTrackEvent::getTraceNo, query.getTraceNo())
                .eq(StringUtils.hasText(query.getEventType()),
                        ErpDocTrackEvent::getEventType, query.getEventType())
                .eq(StringUtils.hasText(query.getEventStatus()),
                        ErpDocTrackEvent::getEventStatus, query.getEventStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpDocTrackEvent::getTraceNo, query.getKeyword()).or()
                        .like(ErpDocTrackEvent::getEventName, query.getKeyword()).or()
                        .like(ErpDocTrackEvent::getOperatorName, query.getKeyword()))
                .orderByDesc(ErpDocTrackEvent::getId));
        return PageResult.of(page);
    }

    public ErpDocTrackEvent detail(Long id) {
        return require(id);
    }

    /** 新增或更新业务事件：新增时回填默认事件类型/事件状态与组织，追溯号由用户填写。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpDocTrackEventSaveRequest request) {
        ErpDocTrackEvent entity;
        if (id == null) {
            entity = new ErpDocTrackEvent();
            entity.setEventType(StringUtils.hasText(request.getEventType())
                    ? request.getEventType() : DEFAULT_EVENT_TYPE);
            entity.setEventStatus(StringUtils.hasText(request.getEventStatus())
                    ? request.getEventStatus() : DEFAULT_EVENT_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除业务事件：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.deleteById(id);
    }

    public ErpDocTrackEvent require(Long id) {
        ErpDocTrackEvent entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "业务事件不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpDocTrackEvent entity, ErpDocTrackEventSaveRequest request) {
        if (StringUtils.hasText(request.getTraceNo())) {
            entity.setTraceNo(request.getTraceNo());
        }
        if (request.getLineNo() != null) {
            entity.setLineNo(request.getLineNo());
        }
        if (StringUtils.hasText(request.getEventType())) {
            entity.setEventType(request.getEventType());
        }
        if (StringUtils.hasText(request.getEventName())) {
            entity.setEventName(request.getEventName());
        }
        if (request.getEventTime() != null) {
            entity.setEventTime(request.getEventTime());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (StringUtils.hasText(request.getEventStatus())) {
            entity.setEventStatus(request.getEventStatus());
        }
        if (StringUtils.hasText(request.getEventDetail())) {
            entity.setEventDetail(request.getEventDetail());
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
