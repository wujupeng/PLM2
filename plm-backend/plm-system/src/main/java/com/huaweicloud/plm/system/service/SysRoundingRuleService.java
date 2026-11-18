package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysRoundingRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysRoundingRule;
import com.huaweicloud.plm.system.mapper.SysRoundingRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 舍入规则（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 舍入规则登记、启停状态流转与统计。
 * 规则编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysRoundingRuleService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String DEFAULT_ROUNDING_TARGET = "AMOUNT";
    private static final String DEFAULT_ROUNDING_MODE = "HALF_UP";
    private static final BigDecimal DEFAULT_ROUNDING_UNIT = new BigDecimal("0.01");
    private static final int DEFAULT_PRECISION = 2;

    private final SysRoundingRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询舍入规则：舍入对象、舍入方式、规则状态精确，关键字匹配编号/编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysRoundingRule> pageRoundingRules(FinanceQuery query) {
        Page<SysRoundingRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysRoundingRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRoundingTarget()),
                        SysRoundingRule::getRoundingTarget, query.getRoundingTarget())
                .eq(StringUtils.hasText(query.getRoundingMode()),
                        SysRoundingRule::getRoundingMode, query.getRoundingMode())
                .eq(StringUtils.hasText(query.getRuleStatus()),
                        SysRoundingRule::getRuleStatus, query.getRuleStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysRoundingRule::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysRoundingRule::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysRoundingRule::getRuleNo, query.getKeyword()).or()
                        .like(SysRoundingRule::getRuleCode, query.getKeyword()).or()
                        .like(SysRoundingRule::getRuleName, query.getKeyword()))
                .orderByDesc(SysRoundingRule::getId));
        return PageResult.of(page);
    }

    public SysRoundingRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新舍入规则：新增时回填默认规则状态、舍入对象、舍入方式、舍入单位、精度与组织，规则编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysRoundingRuleSaveRequest request) {
        SysRoundingRule entity;
        if (id == null) {
            entity = new SysRoundingRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo() : flowSupport.nextBizNo("RR"));
            entity.setRuleStatus(STATUS_ACTIVE);
            entity.setRoundingTarget(StringUtils.hasText(request.getRoundingTarget())
                    ? request.getRoundingTarget() : DEFAULT_ROUNDING_TARGET);
            entity.setRoundingMode(StringUtils.hasText(request.getRoundingMode())
                    ? request.getRoundingMode() : DEFAULT_ROUNDING_MODE);
            entity.setRoundingUnit(request.getRoundingUnit() == null
                    ? DEFAULT_ROUNDING_UNIT : request.getRoundingUnit());
            entity.setPrecisionDigits(request.getPrecisionDigits() == null
                    ? DEFAULT_PRECISION : request.getPrecisionDigits());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getRuleNo())) {
                entity.setRuleNo(request.getRuleNo());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 启用：规则状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysRoundingRule enable(Long id) {
        return changeRuleStatus(id, STATUS_ACTIVE);
    }

    /** 停用：规则状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysRoundingRule disable(Long id) {
        return changeRuleStatus(id, STATUS_DISABLED);
    }

    /** 删除舍入规则：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 舍入规则统计：按规则状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysRoundingRule::getRuleStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysRoundingRule::getRuleStatus, STATUS_DISABLED));
        return result;
    }

    public SysRoundingRule require(Long id) {
        SysRoundingRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "舍入规则不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysRoundingRule entity, SysRoundingRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getRoundingTarget())) {
            entity.setRoundingTarget(request.getRoundingTarget());
        }
        if (StringUtils.hasText(request.getRoundingMode())) {
            entity.setRoundingMode(request.getRoundingMode());
        }
        if (request.getRoundingUnit() != null) {
            entity.setRoundingUnit(request.getRoundingUnit());
        }
        if (request.getPrecisionDigits() != null) {
            entity.setPrecisionDigits(request.getPrecisionDigits());
        }
        if (StringUtils.hasText(request.getRuleStatus())) {
            entity.setRuleStatus(request.getRuleStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysRoundingRule changeRuleStatus(Long id, String ruleStatus) {
        SysRoundingRule entity = require(id);
        entity.setRuleStatus(ruleStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysRoundingRule, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysRoundingRule>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
