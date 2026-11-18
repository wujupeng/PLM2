package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.WmsFifoRuleQuery;
import com.huaweicloud.plm.system.dto.WmsFifoRuleSaveRequest;
import com.huaweicloud.plm.system.entity.WmsFifoRule;
import com.huaweicloud.plm.system.mapper.WmsFifoRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * FIFO 规则服务（N7，DEV-079）。
 */
@Service
@RequiredArgsConstructor
public class WmsFifoRuleService {

    private static final String SCOPE_GLOBAL = "GLOBAL";
    private static final String SCOPE_MATERIAL = "MATERIAL";
    private static final String SCOPE_CUSTOMER = "CUSTOMER";
    private static final String DEFAULT_FIFO_BASIS = "INBOUND_DATE";
    private static final int STATUS_ACTIVE = 1;
    private static final int DEFAULT_EXPIRY_CHECK = 1;
    private static final int DEFAULT_ALLOW_EXCEPTION = 0;
    private static final int DEFAULT_PRIORITY = 10;

    private final WmsFifoRuleMapper wmsFifoRuleMapper;
    private final WmsSupportService wmsSupportService;

    public PageResult<WmsFifoRule> page(WmsFifoRuleQuery query) {
        Page<WmsFifoRule> page = query.toPage();
        wmsFifoRuleMapper.selectPage(page, Wrappers.<WmsFifoRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getScope()), WmsFifoRule::getScope, query.getScope())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsFifoRule::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), WmsFifoRule::getCustomerCode, query.getCustomerCode())
                .eq(query.getStatus() != null, WmsFifoRule::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsFifoRule::getRuleCode, query.getKeyword()).or()
                        .like(WmsFifoRule::getRuleName, query.getKeyword()))
                .orderByAsc(WmsFifoRule::getPriority));
        return PageResult.of(page);
    }

    public List<WmsFifoRule> listActive() {
        return wmsFifoRuleMapper.selectList(Wrappers.<WmsFifoRule>lambdaQuery()
                .eq(WmsFifoRule::getStatus, STATUS_ACTIVE)
                .orderByAsc(WmsFifoRule::getPriority));
    }

    public WmsFifoRule requireRule(Long id) {
        WmsFifoRule rule = wmsFifoRuleMapper.selectById(id);
        if (rule == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "FIFO 规则不存在: " + id);
        }
        return rule;
    }

    public Long create(WmsFifoRuleSaveRequest request) {
        ensureUnique(request.getRuleCode(), -1L);
        WmsFifoRule rule = new WmsFifoRule();
        applyRequest(rule, request);
        wmsFifoRuleMapper.insert(rule);
        return rule.getId();
    }

    public void update(Long id, WmsFifoRuleSaveRequest request) {
        WmsFifoRule rule = requireRule(id);
        ensureUnique(request.getRuleCode(), id);
        applyRequest(rule, request);
        wmsFifoRuleMapper.updateById(rule);
    }

    public void delete(Long id) {
        requireRule(id);
        wmsFifoRuleMapper.deleteById(id);
    }

    /**
     * 在启用规则中按优先级选出最匹配的一条：客户策略 → 物料策略 → 全局策略。
     */
    public WmsFifoRule resolveRule(String materialCode, String customerCode) {
        List<WmsFifoRule> rules = wmsFifoRuleMapper.selectList(Wrappers.<WmsFifoRule>lambdaQuery()
                .eq(WmsFifoRule::getStatus, STATUS_ACTIVE)
                .orderByAsc(WmsFifoRule::getPriority));
        for (WmsFifoRule rule : rules) {
            if (SCOPE_CUSTOMER.equals(rule.getScope())
                    && StringUtils.hasText(customerCode)
                    && customerCode.equals(rule.getCustomerCode())) {
                return rule;
            }
        }
        for (WmsFifoRule rule : rules) {
            if (SCOPE_MATERIAL.equals(rule.getScope())
                    && StringUtils.hasText(materialCode)
                    && materialCode.equals(rule.getMaterialCode())) {
                return rule;
            }
        }
        for (WmsFifoRule rule : rules) {
            if (SCOPE_GLOBAL.equals(rule.getScope())) {
                return rule;
            }
        }
        return null;
    }

    private void applyRequest(WmsFifoRule rule, WmsFifoRuleSaveRequest request) {
        rule.setRuleCode(request.getRuleCode());
        rule.setRuleName(request.getRuleName());
        rule.setScope(StringUtils.hasText(request.getScope()) ? request.getScope() : SCOPE_GLOBAL);
        rule.setCustomerCode(request.getCustomerCode());
        rule.setMaterialCode(request.getMaterialCode());
        rule.setFifoBasis(StringUtils.hasText(request.getFifoBasis())
                ? request.getFifoBasis() : DEFAULT_FIFO_BASIS);
        rule.setExpiryCheck(request.getExpiryCheck() != null
                ? request.getExpiryCheck() : DEFAULT_EXPIRY_CHECK);
        rule.setExpiryWarnDays(request.getExpiryWarnDays());
        rule.setAllowException(request.getAllowException() != null
                ? request.getAllowException() : DEFAULT_ALLOW_EXCEPTION);
        rule.setExceptionRole(request.getExceptionRole());
        rule.setPriority(request.getPriority() != null ? request.getPriority() : DEFAULT_PRIORITY);
        rule.setStatus(request.getStatus() != null ? request.getStatus() : STATUS_ACTIVE);
        rule.setRemark(request.getRemark());
    }

    private void ensureUnique(String ruleCode, Long excludeId) {
        long count = wmsFifoRuleMapper.selectCount(Wrappers.<WmsFifoRule>lambdaQuery()
                .eq(WmsFifoRule::getRuleCode, ruleCode)
                .ne(excludeId != null && excludeId > 0, WmsFifoRule::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "FIFO 规则编码已存在: " + ruleCode);
        }
    }
}
