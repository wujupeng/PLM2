package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.LabelRuleQuery;
import com.huaweicloud.plm.system.dto.LabelRuleSaveRequest;
import com.huaweicloud.plm.system.dto.LabelValidateResult;
import com.huaweicloud.plm.system.entity.SysLabelRule;
import com.huaweicloud.plm.system.mapper.SysLabelRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 标签校验规则（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 规则登记、分页查询、条码统一校验与删除。
 * 规则编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysLabelRuleService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_LABEL_TYPE = "MATERIAL";
    private static final String DEFAULT_CHECK_TYPE = "FORMAT";
    private static final String DEFAULT_ERROR_LEVEL = "ERROR";

    private static final String CHECK_TYPE_LENGTH = "LENGTH";
    private static final String CHECK_TYPE_PREFIX = "PREFIX";
    private static final String CHECK_TYPE_FORMAT = "FORMAT";
    private static final String CHECK_TYPE_CHECKSUM = "CHECKSUM";

    private final SysLabelRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询标签规则：标签类型/校验类型/状态精确，编号/编码/名称模糊，按编号倒序。 */
    public PageResult<SysLabelRule> pageRules(LabelRuleQuery query) {
        Page<SysLabelRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysLabelRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getLabelType()),
                        SysLabelRule::getLabelType, query.getLabelType())
                .eq(StringUtils.hasText(query.getCheckType()),
                        SysLabelRule::getCheckType, query.getCheckType())
                .eq(StringUtils.hasText(query.getRuleStatus()),
                        SysLabelRule::getRuleStatus, query.getRuleStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysLabelRule::getRuleNo, query.getKeyword()).or()
                        .like(SysLabelRule::getRuleCode, query.getKeyword()).or()
                        .like(SysLabelRule::getRuleName, query.getKeyword()))
                .orderByDesc(SysLabelRule::getId));
        return PageResult.of(page);
    }

    public SysLabelRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新标签规则：新增时回填默认标签类型/校验类型/异常级别/状态与组织，规则编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, LabelRuleSaveRequest request) {
        SysLabelRule entity;
        if (id == null) {
            entity = new SysLabelRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo() : flowSupport.nextBizNo("LBL"));
            entity.setLabelType(StringUtils.hasText(request.getLabelType())
                    ? request.getLabelType() : DEFAULT_LABEL_TYPE);
            entity.setCheckType(StringUtils.hasText(request.getCheckType())
                    ? request.getCheckType() : DEFAULT_CHECK_TYPE);
            entity.setErrorLevel(StringUtils.hasText(request.getErrorLevel())
                    ? request.getErrorLevel() : DEFAULT_ERROR_LEVEL);
            entity.setRuleStatus(StringUtils.hasText(request.getRuleStatus())
                    ? request.getRuleStatus() : STATUS_ACTIVE);
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

    /** 删除标签规则：物理删除以释放规则编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /**
     * 校验条码：取指定标签类型（为空时不限类型）且状态为 ACTIVE 的规则逐条校验，
     * 命中任一不通过即返回 valid=false 及命中的规则编码；无生效规则时视为通过。
     * 校验类型：LENGTH 校验长度、PREFIX 校验前缀、FORMAT 按正则校验、CHECKSUM 按 GS1 模 10 校验位校验。
     */
    public LabelValidateResult validate(String barcode, String labelType) {
        LabelValidateResult result = new LabelValidateResult();
        result.setLabelType(labelType);
        List<SysLabelRule> rules = mapper.selectList(Wrappers.<SysLabelRule>lambdaQuery()
                .eq(StringUtils.hasText(labelType), SysLabelRule::getLabelType, labelType)
                .eq(SysLabelRule::getRuleStatus, STATUS_ACTIVE)
                .orderByAsc(SysLabelRule::getId));
        if (rules.isEmpty()) {
            result.setValid(true);
            return result;
        }
        for (SysLabelRule rule : rules) {
            String message = check(rule, barcode);
            if (message != null) {
                result.setValid(false);
                result.setRuleCode(rule.getRuleCode());
                result.setMessage(message);
                return result;
            }
        }
        result.setValid(true);
        return result;
    }

    public SysLabelRule require(Long id) {
        SysLabelRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "标签校验规则不存在: " + id);
        }
        return entity;
    }

    /** 按校验类型校验单条规则，通过返回 null，不通过返回错误信息。 */
    private String check(SysLabelRule rule, String barcode) {
        String checkType = rule.getCheckType() == null ? "" : rule.getCheckType().trim().toUpperCase();
        switch (checkType) {
            case CHECK_TYPE_LENGTH:
                if (rule.getExpectedLength() != null && barcode.length() != rule.getExpectedLength()) {
                    return "条码长度应为 " + rule.getExpectedLength() + " 位，实际 " + barcode.length() + " 位";
                }
                return null;
            case CHECK_TYPE_PREFIX:
                if (StringUtils.hasText(rule.getBarcodePattern())
                        && !barcode.startsWith(rule.getBarcodePattern())) {
                    return "条码前缀应为「" + rule.getBarcodePattern() + "」";
                }
                return null;
            case CHECK_TYPE_CHECKSUM:
                return checksumValid(barcode) ? null : "条码校验位不合法";
            case CHECK_TYPE_FORMAT:
            default:
                if (StringUtils.hasText(rule.getBarcodePattern())
                        && !barcode.matches(rule.getBarcodePattern())) {
                    return "条码格式不匹配模式「" + rule.getBarcodePattern() + "」";
                }
                return null;
        }
    }

    /**
     * GS1 风格模 10 校验位校验：非纯数字视为不通过；
     * 自校验位左侧起向左依次按 3、1、3、1…加权求和，
     * 校验位应为使总和为 10 倍数的最小非负补数，与末位数字一致即通过。
     */
    private boolean checksumValid(String barcode) {
        if (barcode == null || barcode.length() < 2) {
            return false;
        }
        for (int i = 0; i < barcode.length(); i++) {
            if (!Character.isDigit(barcode.charAt(i))) {
                return false;
            }
        }
        int sum = 0;
        int weight = 3;
        for (int i = barcode.length() - 2; i >= 0; i--) {
            sum += (barcode.charAt(i) - '0') * weight;
            weight = weight == 3 ? 1 : 3;
        }
        int expected = (10 - (sum % 10)) % 10;
        return expected == (barcode.charAt(barcode.length() - 1) - '0');
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysLabelRule entity, LabelRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleNo())) {
            entity.setRuleNo(request.getRuleNo());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getLabelType())) {
            entity.setLabelType(request.getLabelType());
        }
        if (StringUtils.hasText(request.getCheckType())) {
            entity.setCheckType(request.getCheckType());
        }
        if (StringUtils.hasText(request.getBarcodePattern())) {
            entity.setBarcodePattern(request.getBarcodePattern());
        }
        if (request.getExpectedLength() != null) {
            entity.setExpectedLength(request.getExpectedLength());
        }
        if (StringUtils.hasText(request.getErrorLevel())) {
            entity.setErrorLevel(request.getErrorLevel());
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
