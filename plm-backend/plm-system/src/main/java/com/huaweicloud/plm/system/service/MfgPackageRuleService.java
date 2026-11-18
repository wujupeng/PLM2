package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgPackageRuleQuery;
import com.huaweicloud.plm.system.dto.MfgPackageRuleSaveRequest;
import com.huaweicloud.plm.system.entity.MfgPackageRule;
import com.huaweicloud.plm.system.mapper.MfgPackageRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * 包装规则服务（N8，DEV-089）：维护包装数量、内外箱关系、箱码/托盘码与标签规则。
 */
@Service
@RequiredArgsConstructor
public class MfgPackageRuleService {

    private static final String STATUS_ENABLED = "enabled";
    private static final String DEFAULT_LEVEL = "INNER";

    private final MfgPackageRuleMapper mfgPackageRuleMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgPackageRule> page(MfgPackageRuleQuery query) {
        Page<MfgPackageRule> page = query.toPage();
        mfgPackageRuleMapper.selectPage(page, Wrappers.<MfgPackageRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleNo()), MfgPackageRule::getRuleNo, query.getRuleNo())
                .eq(StringUtils.hasText(query.getProductCode()), MfgPackageRule::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getPackageLevel()), MfgPackageRule::getPackageLevel, query.getPackageLevel())
                .eq(StringUtils.hasText(query.getCustomerCode()), MfgPackageRule::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getStatus()), MfgPackageRule::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgPackageRule::getRuleNo, query.getKeyword()).or()
                        .like(MfgPackageRule::getProductCode, query.getKeyword()))
                .orderByDesc(MfgPackageRule::getId));
        return PageResult.of(page);
    }

    public List<MfgPackageRule> listActive(String productCode, String packageLevel) {
        return mfgPackageRuleMapper.selectList(Wrappers.<MfgPackageRule>lambdaQuery()
                .eq(MfgPackageRule::getStatus, STATUS_ENABLED)
                .eq(StringUtils.hasText(productCode), MfgPackageRule::getProductCode, productCode)
                .eq(StringUtils.hasText(packageLevel), MfgPackageRule::getPackageLevel, packageLevel)
                .orderByAsc(MfgPackageRule::getPackageLevel));
    }

    public MfgPackageRule require(String ruleNo) {
        MfgPackageRule rule = mfgPackageRuleMapper.selectOne(Wrappers.<MfgPackageRule>lambdaQuery()
                .eq(MfgPackageRule::getRuleNo, ruleNo));
        if (rule == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "包装规则不存在: " + ruleNo);
        }
        return rule;
    }

    public Long create(MfgPackageRuleSaveRequest request) {
        String ruleNo = StringUtils.hasText(request.getRuleNo())
                ? request.getRuleNo() : mfgSupport.nextNo("PKR");
        MfgPackageRule rule = new MfgPackageRule();
        rule.setRuleNo(ruleNo);
        applyFields(rule, request);
        mfgPackageRuleMapper.insert(rule);
        return rule.getId();
    }

    public void update(String ruleNo, MfgPackageRuleSaveRequest request) {
        MfgPackageRule rule = require(ruleNo);
        applyFields(rule, request);
        mfgPackageRuleMapper.updateById(rule);
    }

    public void delete(String ruleNo) {
        MfgPackageRule rule = require(ruleNo);
        mfgPackageRuleMapper.deleteById(rule.getId());
    }

    private void applyFields(MfgPackageRule rule, MfgPackageRuleSaveRequest request) {
        rule.setProductCode(request.getProductCode());
        rule.setPackageLevel(StringUtils.hasText(request.getPackageLevel())
                ? request.getPackageLevel() : DEFAULT_LEVEL);
        rule.setPackageQty(request.getPackageQty() != null ? request.getPackageQty() : BigDecimal.ONE);
        rule.setInnerQtyPerBox(request.getInnerQtyPerBox());
        rule.setBoxPerPallet(request.getBoxPerPallet());
        rule.setLabelTemplateCode(request.getLabelTemplateCode());
        rule.setCustomerCode(request.getCustomerCode());
        rule.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_ENABLED);
        rule.setRemark(request.getRemark());
    }
}
