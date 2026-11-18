package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DocTransitionQuery;
import com.huaweicloud.plm.system.dto.SysDocTransitionSaveRequest;
import com.huaweicloud.plm.system.entity.SysDocTransition;
import com.huaweicloud.plm.system.mapper.SysDocTransitionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 单据状态流转规则（G1-N6 公共平台底座—通用能力 WBS T102 单据状态机）：
 * 流转规则登记、启停状态流转、按「单据类型 + 起始状态 + 动作」校验唯一流转规则与统计。
 * 「单据类型 + 起始状态 + 动作」存在硬唯一索引，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysDocTransitionService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String TRANSITION_TYPE_FORWARD = "FORWARD";

    private final SysDocTransitionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询流转规则：单据类型/起始状态/目标状态/动作/流转类型/流转状态精确，时间区间作用于创建时间。 */
    public PageResult<SysDocTransition> pageTransitions(DocTransitionQuery query) {
        Page<SysDocTransition> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysDocTransition>lambdaQuery()
                .eq(StringUtils.hasText(query.getDocType()),
                        SysDocTransition::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getFromState()),
                        SysDocTransition::getFromState, query.getFromState())
                .eq(StringUtils.hasText(query.getToState()),
                        SysDocTransition::getToState, query.getToState())
                .eq(StringUtils.hasText(query.getActionCode()),
                        SysDocTransition::getActionCode, query.getActionCode())
                .eq(StringUtils.hasText(query.getTransitionType()),
                        SysDocTransition::getTransitionType, query.getTransitionType())
                .eq(StringUtils.hasText(query.getTransitionStatus()),
                        SysDocTransition::getTransitionStatus, query.getTransitionStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysDocTransition::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysDocTransition::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDocTransition::getDocType, query.getKeyword()).or()
                        .like(SysDocTransition::getActionCode, query.getKeyword()).or()
                        .like(SysDocTransition::getActionName, query.getKeyword()))
                .orderByDesc(SysDocTransition::getId));
        return PageResult.of(page);
    }

    public SysDocTransition detail(Long id) {
        return require(id);
    }

    /** 新增或更新流转规则：新增时回填默认流转类型/流转状态/数值默认值与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysDocTransitionSaveRequest request) {
        SysDocTransition entity;
        if (id == null) {
            entity = new SysDocTransition();
            entity.setTransitionType(StringUtils.hasText(request.getTransitionType())
                    ? request.getTransitionType() : TRANSITION_TYPE_FORWARD);
            entity.setTransitionStatus(StringUtils.hasText(request.getTransitionStatus())
                    ? request.getTransitionStatus() : STATUS_ACTIVE);
            entity.setRequireApproval(defaultInt(request.getRequireApproval()));
            entity.setRequireReason(defaultInt(request.getRequireReason()));
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

    /** 启用：流转状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDocTransition enable(Long id) {
        return changeTransitionStatus(id, STATUS_ACTIVE);
    }

    /** 停用：流转状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysDocTransition disable(Long id) {
        return changeTransitionStatus(id, STATUS_DISABLED);
    }

    /** 删除流转规则：物理删除以释放「单据类型 + 起始状态 + 动作」唯一键。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /**
     * 校验转运动作：按「单据类型 + 起始状态 + 动作」查生效（ACTIVE）的唯一流转规则，
     * 命中则返回该规则，未命中抛出业务异常。
     */
    public SysDocTransition validate(String docType, String fromState, String actionCode) {
        SysDocTransition transition = mapper.selectOne(Wrappers.<SysDocTransition>lambdaQuery()
                .eq(SysDocTransition::getDocType, docType)
                .eq(SysDocTransition::getFromState, fromState)
                .eq(SysDocTransition::getActionCode, actionCode)
                .eq(SysDocTransition::getTransitionStatus, STATUS_ACTIVE));
        if (transition == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "未配置生效的状态流转规则: " + docType + "/" + fromState + "/" + actionCode);
        }
        return transition;
    }

    /** 流转规则统计：按流转状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysDocTransition::getTransitionStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysDocTransition::getTransitionStatus, STATUS_DISABLED));
        return result;
    }

    public SysDocTransition require(Long id) {
        SysDocTransition entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "单据状态流转规则不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值时覆盖实体对应字段（字符串非空、数值非 null）。 */
    private void applyRequest(SysDocTransition entity, SysDocTransitionSaveRequest request) {
        if (StringUtils.hasText(request.getDocType())) {
            entity.setDocType(request.getDocType());
        }
        if (StringUtils.hasText(request.getFromState())) {
            entity.setFromState(request.getFromState());
        }
        if (StringUtils.hasText(request.getToState())) {
            entity.setToState(request.getToState());
        }
        if (StringUtils.hasText(request.getActionCode())) {
            entity.setActionCode(request.getActionCode());
        }
        if (StringUtils.hasText(request.getActionName())) {
            entity.setActionName(request.getActionName());
        }
        if (StringUtils.hasText(request.getTransitionType())) {
            entity.setTransitionType(request.getTransitionType());
        }
        if (request.getRequireApproval() != null) {
            entity.setRequireApproval(request.getRequireApproval());
        }
        if (request.getRequireReason() != null) {
            entity.setRequireReason(request.getRequireReason());
        }
        if (StringUtils.hasText(request.getPermissionCode())) {
            entity.setPermissionCode(request.getPermissionCode());
        }
        if (StringUtils.hasText(request.getTransitionStatus())) {
            entity.setTransitionStatus(request.getTransitionStatus());
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

    private SysDocTransition changeTransitionStatus(Long id, String transitionStatus) {
        SysDocTransition entity = require(id);
        entity.setTransitionStatus(transitionStatus);
        mapper.updateById(entity);
        return entity;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Long countBy(SFunction<SysDocTransition, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysDocTransition>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
