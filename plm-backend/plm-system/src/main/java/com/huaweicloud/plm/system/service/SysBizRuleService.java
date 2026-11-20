package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizRuleQuery;
import com.huaweicloud.plm.system.dto.RuleEvaluateRequest;
import com.huaweicloud.plm.system.dto.RuleEvaluateResult;
import com.huaweicloud.plm.system.dto.SysBizRuleSaveRequest;
import com.huaweicloud.plm.system.entity.SysBizRule;
import com.huaweicloud.plm.system.entity.SysBizRuleLog;
import com.huaweicloud.plm.system.entity.SysBizRuleParam;
import com.huaweicloud.plm.system.mapper.SysBizRuleLogMapper;
import com.huaweicloud.plm.system.mapper.SysBizRuleMapper;
import com.huaweicloud.plm.system.mapper.SysBizRuleParamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 业务规则定义（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 业务规则登记、启停状态流转与统计，并提供按「规则类型 + 业务模块」匹配生效规则、
 * 组装规则参数并记录执行日志的规则求值能力。
 * 规则编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysBizRuleService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private static final String DEFAULT_RULE_TYPE = "LEAD_TIME";
    private static final int DEFAULT_PRIORITY = 100;

    private static final String MATCH = "MATCH";
    private static final String NOT_MATCH = "NOT_MATCH";

    private final SysBizRuleMapper mapper;
    private final SysBizRuleParamMapper paramMapper;
    private final SysBizRuleLogMapper logMapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    /** 分页查询业务规则：规则编码/类型/业务模块/状态精确，规则名称模糊，时间区间作用于创建时间。 */
    public PageResult<SysBizRule> pageRules(BizRuleQuery query) {
        Page<SysBizRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysBizRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getRuleCode()),
                        SysBizRule::getRuleCode, query.getRuleCode())
                .like(StringUtils.hasText(query.getRuleName()),
                        SysBizRule::getRuleName, query.getRuleName())
                .eq(StringUtils.hasText(query.getRuleType()),
                        SysBizRule::getRuleType, query.getRuleType())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysBizRule::getBizModule, query.getBizModule())
                .eq(StringUtils.hasText(query.getRuleStatus()),
                        SysBizRule::getRuleStatus, query.getRuleStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysBizRule::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysBizRule::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysBizRule::getRuleNo, query.getKeyword()).or()
                        .like(SysBizRule::getRuleCode, query.getKeyword()).or()
                        .like(SysBizRule::getRuleName, query.getKeyword()))
                .orderByDesc(SysBizRule::getId));
        return PageResult.of(page);
    }

    public SysBizRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新业务规则：新增时回填默认优先级/规则状态与组织，规则编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysBizRuleSaveRequest request) {
        SysBizRule entity;
        if (id == null) {
            entity = new SysBizRule();
            entity.setRuleNo(StringUtils.hasText(request.getRuleNo())
                    ? request.getRuleNo() : flowSupport.nextBizNo("BR"));
            entity.setPriority(request.getPriority() == null ? DEFAULT_PRIORITY : request.getPriority());
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

    /** 启用：规则状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysBizRule enable(Long id) {
        return changeRuleStatus(id, STATUS_ACTIVE);
    }

    /** 停用：规则状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysBizRule disable(Long id) {
        return changeRuleStatus(id, STATUS_DISABLED);
    }

    /** 删除业务规则：物理删除以释放规则编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 业务规则统计：按规则状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysBizRule::getRuleStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysBizRule::getRuleStatus, STATUS_DISABLED));
        return result;
    }

    /**
     * 规则求值：
     * 1) 取规则类型匹配且状态为 ACTIVE 的规则（业务模块非空时同时按业务模块过滤），
     *    按 priority 升序（数值越小越优先）取第一条作为命中规则；
     * 2) 组装该规则编码下 ACTIVE 的参数（paramKey→paramValue，按 valueType 转换）；
     * 3) 记录一条执行日志（MATCH/NOT_MATCH、耗时、执行时间）；
     * 4) 返回求值结果，无匹配规则时 matched=false、matchResult=NOT_MATCH、params 为空。
     */
    @Transactional(rollbackFor = Exception.class)
    public RuleEvaluateResult evaluate(RuleEvaluateRequest request) {
        long start = System.currentTimeMillis();
        SysBizRule rule = mapper.selectOne(Wrappers.<SysBizRule>lambdaQuery()
                .eq(SysBizRule::getRuleType, request.getRuleType())
                .eq(SysBizRule::getRuleStatus, STATUS_ACTIVE)
                .eq(StringUtils.hasText(request.getBizModule()),
                        SysBizRule::getBizModule, request.getBizModule())
                .orderByAsc(SysBizRule::getPriority)
                .last("limit 1"));

        RuleEvaluateResult result = new RuleEvaluateResult();
        Map<String, Object> params = new LinkedHashMap<>();
        if (rule != null) {
            List<SysBizRuleParam> paramList = paramMapper.selectList(Wrappers.<SysBizRuleParam>lambdaQuery()
                    .eq(SysBizRuleParam::getRuleCode, rule.getRuleCode())
                    .eq(SysBizRuleParam::getParamStatus, STATUS_ACTIVE)
                    .orderByAsc(SysBizRuleParam::getSeqNo));
            for (SysBizRuleParam param : paramList) {
                params.put(param.getParamKey(), convertValue(param.getValueType(), param.getParamValue()));
            }
            result.setRuleCode(rule.getRuleCode());
            result.setRuleName(rule.getRuleName());
            result.setRuleType(rule.getRuleType());
            result.setMatched(true);
            result.setParams(params);
            result.setMatchResult(MATCH);
        } else {
            result.setMatched(false);
            result.setParams(params);
            result.setMatchResult(NOT_MATCH);
        }

        long costMs = System.currentTimeMillis() - start;
        writeLog(rule == null ? null : rule.getRuleCode(), request, params, costMs, result.getMatchResult());
        return result;
    }

    public SysBizRule require(Long id) {
        SysBizRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "业务规则不存在: " + id);
        }
        return entity;
    }

    /** 按值类型将字符串参数值转换为目标类型：NUMBER→BigDecimal，BOOLEAN→Boolean，LIST→逗号拆分，其余原样。 */
    private Object convertValue(String valueType, String value) {
        if (value == null) {
            return null;
        }
        if (!StringUtils.hasText(valueType)) {
            return value;
        }
        switch (valueType.trim().toUpperCase()) {
            case "NUMBER":
                try {
                    return new BigDecimal(value.trim());
                } catch (NumberFormatException e) {
                    return value;
                }
            case "BOOLEAN":
                return Boolean.parseBoolean(value.trim());
            case "LIST":
                return List.of(value.split(",", -1));
            default:
                return value;
        }
    }

    /** 写入规则执行日志：日志编号自动生成，输入/输出序列化为 JSON，异常时置 null。 */
    private void writeLog(String ruleCode, RuleEvaluateRequest request, Map<String, Object> output,
                          long costMs, String matchResult) {
        SysBizRuleLog log = new SysBizRuleLog();
        log.setLogNo(flowSupport.nextBizNo("BRL"));
        log.setRuleCode(ruleCode);
        log.setBizModule(request.getBizModule());
        log.setBizKey(request.getBizKey());
        log.setInputData(toJson(request.getInputData()));
        log.setOutputData(toJson(output));
        log.setMatchResult(matchResult);
        log.setCostMs((int) costMs);
        log.setExecTime(LocalDateTime.now());
        log.setOrgId(currentOrgId());
        logMapper.insert(log);
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("无法序列化业务规则执行日志", e);
        }
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysBizRule entity, SysBizRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleNo())) {
            entity.setRuleNo(request.getRuleNo());
        }
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getRuleType())) {
            entity.setRuleType(request.getRuleType());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getRuleExpr())) {
            entity.setRuleExpr(request.getRuleExpr());
        }
        if (request.getPriority() != null) {
            entity.setPriority(request.getPriority());
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

    private SysBizRule changeRuleStatus(Long id, String ruleStatus) {
        SysBizRule entity = require(id);
        entity.setRuleStatus(ruleStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysBizRule, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysBizRule>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
