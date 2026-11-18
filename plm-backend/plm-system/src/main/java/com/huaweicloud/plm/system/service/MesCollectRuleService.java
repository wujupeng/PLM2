package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesCollectRuleQuery;
import com.huaweicloud.plm.system.dto.MesCollectRuleSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectRule;
import com.huaweicloud.plm.system.mapper.MesCollectRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 数据校验规则记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesCollectRuleService {

    private static final String DEFAULT_NO_PREFIX = "MCR";
    private static final String DEFAULT_RULE_TYPE = "RANGE";
    private static final String DEFAULT_RULE_ACTION = "WARN";
    private static final String DEFAULT_RULE_STATUS = "DRAFT";

    private final MesCollectRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesCollectRule> page(MesCollectRuleQuery query) {
        String keyword = query.getKeyword();
        Page<MesCollectRule> page = mapper.selectPage(query.toPage(), Wrappers.<MesCollectRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleType()), MesCollectRule::getRuleType, query.getRuleType())
                .eq(StringUtils.hasText(query.getRuleAction()), MesCollectRule::getRuleAction, query.getRuleAction())
                .eq(StringUtils.hasText(query.getRuleStatus()), MesCollectRule::getRuleStatus, query.getRuleStatus())
                .eq(StringUtils.hasText(query.getPointCode()), MesCollectRule::getPointCode, query.getPointCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesCollectRule::getRuleNo, keyword).or()
                        .like(MesCollectRule::getRuleName, keyword).or()
                        .like(MesCollectRule::getPointCode, keyword).or()
                        .like(MesCollectRule::getExpression, keyword))
                .orderByDesc(MesCollectRule::getId));
        return PageResult.of(page);
    }

    public MesCollectRule detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesCollectRuleSaveRequest request) {
        MesCollectRule entity;
        if (id == null) {
            entity = new MesCollectRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setRuleType(StringUtils.hasText(request.getRuleType())
                    ? request.getRuleType() : DEFAULT_RULE_TYPE);
            entity.setRuleAction(StringUtils.hasText(request.getRuleAction())
                    ? request.getRuleAction() : DEFAULT_RULE_ACTION);
            entity.setRuleStatus(StringUtils.hasText(request.getRuleStatus())
                    ? request.getRuleStatus() : DEFAULT_RULE_STATUS);
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

    private MesCollectRule require(Long id) {
        MesCollectRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "校验规则不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesCollectRule entity, MesCollectRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleNo())) {
            entity.setRuleNo(request.getRuleNo());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getPointCode())) {
            entity.setPointCode(request.getPointCode());
        }
        if (StringUtils.hasText(request.getRuleType())) {
            entity.setRuleType(request.getRuleType());
        }
        if (request.getMinValue() != null) {
            entity.setMinValue(request.getMinValue());
        }
        if (request.getMaxValue() != null) {
            entity.setMaxValue(request.getMaxValue());
        }
        if (StringUtils.hasText(request.getExpression())) {
            entity.setExpression(request.getExpression());
        }
        if (request.getTimestampTolerance() != null) {
            entity.setTimestampTolerance(request.getTimestampTolerance());
        }
        if (StringUtils.hasText(request.getRuleAction())) {
            entity.setRuleAction(request.getRuleAction());
        }
        if (StringUtils.hasText(request.getRuleStatus())) {
            entity.setRuleStatus(request.getRuleStatus());
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
