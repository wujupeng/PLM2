package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ApprovalFlowQuery;
import com.huaweicloud.plm.system.dto.ApprovalMatchRequest;
import com.huaweicloud.plm.system.dto.SysApprovalFlowSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalCondition;
import com.huaweicloud.plm.system.entity.SysApprovalFlow;
import com.huaweicloud.plm.system.mapper.SysApprovalConditionMapper;
import com.huaweicloud.plm.system.mapper.SysApprovalFlowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 审批流定义（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 审批流登记、启停状态流转与统计，并提供按「单据类型 + 业务字段取值」匹配生效审批流的条件引擎。
 * 流程编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysApprovalFlowService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private static final String LOGIC_OR = "OR";
    private static final String OPERATOR_EQ = "EQ";
    private static final String OPERATOR_NE = "NE";

    private final SysApprovalFlowMapper mapper;
    private final SysApprovalConditionMapper conditionMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询审批流：流程编码/单据类型/业务模块/流程状态精确，流程名称模糊，时间区间作用于创建时间。 */
    public PageResult<SysApprovalFlow> pageFlows(ApprovalFlowQuery query) {
        Page<SysApprovalFlow> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApprovalFlow>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowCode()),
                        SysApprovalFlow::getFlowCode, query.getFlowCode())
                .like(StringUtils.hasText(query.getFlowName()),
                        SysApprovalFlow::getFlowName, query.getFlowName())
                .eq(StringUtils.hasText(query.getDocType()),
                        SysApprovalFlow::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysApprovalFlow::getBizModule, query.getBizModule())
                .eq(StringUtils.hasText(query.getFlowStatus()),
                        SysApprovalFlow::getFlowStatus, query.getFlowStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysApprovalFlow::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysApprovalFlow::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApprovalFlow::getFlowNo, query.getKeyword()).or()
                        .like(SysApprovalFlow::getFlowCode, query.getKeyword()).or()
                        .like(SysApprovalFlow::getFlowName, query.getKeyword()))
                .orderByDesc(SysApprovalFlow::getId));
        return PageResult.of(page);
    }

    public SysApprovalFlow detail(Long id) {
        return require(id);
    }

    /** 新增或更新审批流：新增时回填默认优先级/流程状态与组织，审批流编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApprovalFlowSaveRequest request) {
        SysApprovalFlow entity;
        if (id == null) {
            entity = new SysApprovalFlow();
            entity.setFlowNo(StringUtils.hasText(request.getFlowNo())
                    ? request.getFlowNo() : flowSupport.nextBizNo("APV"));
            entity.setPriority(defaultInt(request.getPriority()));
            entity.setFlowStatus(StringUtils.hasText(request.getFlowStatus())
                    ? request.getFlowStatus() : STATUS_ACTIVE);
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

    /** 启用：流程状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalFlow enable(Long id) {
        return changeFlowStatus(id, STATUS_ACTIVE);
    }

    /** 停用：流程状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalFlow disable(Long id) {
        return changeFlowStatus(id, STATUS_DISABLED);
    }

    /** 删除审批流：物理删除以释放流程编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 审批流统计：按流程状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysApprovalFlow::getFlowStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysApprovalFlow::getFlowStatus, STATUS_DISABLED));
        return result;
    }

    /**
     * 匹配生效审批流：取该单据类型且状态为 ACTIVE 的流程，按 priority 倒序；
     * 对每个流程取其流程编码对应的 ACTIVE 审批条件（按 seqNo 升序）逐条评估，
     * 按每条条件的 logicType（AND/OR）累积结果，无条件的流程视为命中。
     */
    public List<SysApprovalFlow> match(ApprovalMatchRequest request) {
        List<SysApprovalFlow> flows = mapper.selectList(Wrappers.<SysApprovalFlow>lambdaQuery()
                .eq(SysApprovalFlow::getDocType, request.getDocType())
                .eq(SysApprovalFlow::getFlowStatus, STATUS_ACTIVE)
                .orderByDesc(SysApprovalFlow::getPriority));
        List<SysApprovalFlow> matched = new ArrayList<>();
        for (SysApprovalFlow flow : flows) {
            if (matchesFlow(flow, request.getValues())) {
                matched.add(flow);
            }
        }
        return matched;
    }

    public SysApprovalFlow require(Long id) {
        SysApprovalFlow entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "审批流定义不存在: " + id);
        }
        return entity;
    }

    /** 判定单个流程是否命中：无条件视为命中，否则按 seqNo 顺序累加条件结果。 */
    private boolean matchesFlow(SysApprovalFlow flow, Map<String, Object> values) {
        if (!StringUtils.hasText(flow.getFlowCode())) {
            return true;
        }
        List<SysApprovalCondition> conditions = conditionMapper.selectList(
                Wrappers.<SysApprovalCondition>lambdaQuery()
                        .eq(SysApprovalCondition::getFlowCode, flow.getFlowCode())
                        .eq(SysApprovalCondition::getConditionStatus, STATUS_ACTIVE)
                        .orderByAsc(SysApprovalCondition::getSeqNo));
        if (conditions.isEmpty()) {
            return true;
        }
        boolean matched = false;
        boolean first = true;
        for (SysApprovalCondition condition : conditions) {
            Object value = values == null ? null : values.get(condition.getFieldKey());
            boolean hit = evaluate(condition.getCompareOperator(), condition.getCompareValue(), value);
            if (first) {
                matched = hit;
                first = false;
            } else if (LOGIC_OR.equalsIgnoreCase(condition.getLogicType())) {
                matched = matched || hit;
            } else {
                matched = matched && hit;
            }
        }
        return matched;
    }

    /** 单条条件评估：EQ/NE 字符串比较，GT/GE/LT/LE 数值比较，IN 集合包含，BETWEEN 区间。 */
    private boolean evaluate(String operator, String compareValue, Object value) {
        String op = StringUtils.hasText(operator) ? operator.trim().toUpperCase() : OPERATOR_EQ;
        if (value == null) {
            return OPERATOR_NE.equals(op);
        }
        String actual = String.valueOf(value);
        switch (op) {
            case OPERATOR_EQ:
                return actual.equals(compareValue);
            case OPERATOR_NE:
                return !actual.equals(compareValue);
            case "GT":
            case "GE":
            case "LT":
            case "LE":
                return compareNumeric(actual, compareValue, op);
            case "IN":
                return containsValue(actual, compareValue);
            case "BETWEEN":
                return betweenValue(actual, compareValue);
            default:
                return false;
        }
    }

    /** 数值比较：无法解析为数值时视为不命中。 */
    private boolean compareNumeric(String actual, String expected, String op) {
        BigDecimal left = parseDecimal(actual);
        BigDecimal right = parseDecimal(expected);
        if (left == null || right == null) {
            return false;
        }
        int cmp = left.compareTo(right);
        switch (op) {
            case "GT":
                return cmp > 0;
            case "GE":
                return cmp >= 0;
            case "LT":
                return cmp < 0;
            case "LE":
                return cmp <= 0;
            default:
                return false;
        }
    }

    /** IN 比较：compareValue 以逗号分隔，实际值在其中则命中。 */
    private boolean containsValue(String actual, String expected) {
        if (!StringUtils.hasText(expected)) {
            return false;
        }
        for (String part : expected.split(",", -1)) {
            if (part.trim().equals(actual)) {
                return true;
            }
        }
        return false;
    }

    /** BETWEEN 比较：compareValue 形如 "a,b"，a <= 实际值 <= b 则命中。 */
    private boolean betweenValue(String actual, String expected) {
        if (!StringUtils.hasText(expected)) {
            return false;
        }
        String[] parts = expected.split(",", -1);
        if (parts.length < 2) {
            return false;
        }
        BigDecimal value = parseDecimal(actual);
        BigDecimal low = parseDecimal(parts[0].trim());
        BigDecimal high = parseDecimal(parts[1].trim());
        if (value == null || low == null || high == null) {
            return false;
        }
        return value.compareTo(low) >= 0 && value.compareTo(high) <= 0;
    }

    private BigDecimal parseDecimal(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        try {
            return new BigDecimal(text.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysApprovalFlow entity, SysApprovalFlowSaveRequest request) {
        if (StringUtils.hasText(request.getFlowNo())) {
            entity.setFlowNo(request.getFlowNo());
        }
        if (StringUtils.hasText(request.getFlowCode())) {
            entity.setFlowCode(request.getFlowCode());
        }
        if (StringUtils.hasText(request.getFlowName())) {
            entity.setFlowName(request.getFlowName());
        }
        if (StringUtils.hasText(request.getDocType())) {
            entity.setDocType(request.getDocType());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getConditionExpr())) {
            entity.setConditionExpr(request.getConditionExpr());
        }
        if (request.getPriority() != null) {
            entity.setPriority(request.getPriority());
        }
        if (StringUtils.hasText(request.getFlowStatus())) {
            entity.setFlowStatus(request.getFlowStatus());
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

    private SysApprovalFlow changeFlowStatus(Long id, String flowStatus) {
        SysApprovalFlow entity = require(id);
        entity.setFlowStatus(flowStatus);
        mapper.updateById(entity);
        return entity;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Long countBy(SFunction<SysApprovalFlow, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysApprovalFlow>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
