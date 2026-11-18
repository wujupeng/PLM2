package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.BomValidationResult;
import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomIssue;
import com.huaweicloud.plm.system.entity.BomLine;
import com.huaweicloud.plm.system.mapper.BomHeaderMapper;
import com.huaweicloud.plm.system.mapper.BomIssueMapper;
import com.huaweicloud.plm.system.mapper.BomLineMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * BOM 异常校验服务（DEV-029：重复、孤儿、循环、缺量、异常日期）。
 */
@Service
@RequiredArgsConstructor
public class BomValidationService {

    private static final String STATUS_OPEN = "open";
    private static final String SEVERITY_ERROR = "error";
    private static final String SEVERITY_WARNING = "warning";
    private static final String TYPE_DUPLICATE = "duplicate";
    private static final String TYPE_ORPHAN = "orphan";
    private static final String TYPE_CYCLE = "cycle";
    private static final String TYPE_MISSING_QTY = "missingQty";
    private static final String TYPE_INVALID_DATE = "invalidDate";

    private static final String CONFIG_DUPLICATE_POLICY = "bom.duplicate_relation.policy";
    private static final String CONFIG_INVALID_DATE_POLICY = "bom.invalid_date.policy";
    private static final String CONFIG_CYCLE_ENABLED = "bom.cycle.check.enabled";

    private final BomIssueMapper bomIssueMapper;
    private final BomHeaderMapper bomHeaderMapper;
    private final BomLineMapper bomLineMapper;
    private final ConfigService configService;

    /**
     * 校验指定 BOM 并刷新其异常清单：先清理旧的待处理结果，再写入本次校验结果。
     */
    @Transactional
    public BomValidationResult validate(Long headerId) {
        BomHeader header = requireHeader(headerId);
        bomIssueMapper.delete(Wrappers.<BomIssue>lambdaQuery()
                .eq(BomIssue::getHeaderId, headerId)
                .eq(BomIssue::getStatus, STATUS_OPEN));

        List<BomLine> lines = listLines(headerId);
        List<BomIssue> issues = new ArrayList<>();
        issues.addAll(checkDuplicate(headerId, lines));
        issues.addAll(checkOrphan(header, lines));
        issues.addAll(checkMissingQty(headerId, lines));
        issues.addAll(checkInvalidDate(headerId, lines));
        if (isCycleCheckEnabled()) {
            issues.addAll(checkCycle(header));
        }
        issues.forEach(bomIssueMapper::insert);

        BomValidationResult result = new BomValidationResult();
        result.setHeaderId(headerId);
        result.setIssueCount(issues.size());
        result.setIssues(issues);
        return result;
    }

    public List<BomIssue> listIssues(Long headerId) {
        requireHeader(headerId);
        return bomIssueMapper.selectList(Wrappers.<BomIssue>lambdaQuery()
                .eq(BomIssue::getHeaderId, headerId)
                .orderByAsc(BomIssue::getLineNo)
                .orderByAsc(BomIssue::getId));
    }

    /** 规则 1：同一 BOM 内 父件+子件+位号 重复。 */
    private List<BomIssue> checkDuplicate(Long headerId, List<BomLine> lines) {
        String policy = resolveConfig(CONFIG_DUPLICATE_POLICY, "mark_only");
        Map<String, List<BomLine>> grouped = new LinkedHashMap<>();
        for (BomLine line : lines) {
            grouped.computeIfAbsent(lineKey(line), k -> new ArrayList<>()).add(line);
        }
        List<BomIssue> issues = new ArrayList<>();
        for (Map.Entry<String, List<BomLine>> entry : grouped.entrySet()) {
            if (entry.getValue().size() > 1) {
                for (BomLine line : entry.getValue()) {
                    issues.add(build(headerId, TYPE_DUPLICATE, SEVERITY_ERROR, line.getLineNo(),
                            line.getChildMaterialCode(),
                            "存在重复的父件+子件+位号组合（处理原则：" + policy + "）：" + entry.getKey()));
                }
            }
        }
        return issues;
    }

    /** 规则 2：子件编码为空，或父件不属于该 BOM 的 productCode 链路。 */
    private List<BomIssue> checkOrphan(BomHeader header, List<BomLine> lines) {
        Set<String> allowedParents = new HashSet<>();
        allowedParents.add(header.getProductCode());
        for (BomLine line : lines) {
            if (StringUtils.hasText(line.getChildMaterialCode())) {
                allowedParents.add(line.getChildMaterialCode());
            }
        }
        List<BomIssue> issues = new ArrayList<>();
        for (BomLine line : lines) {
            if (!StringUtils.hasText(line.getChildMaterialCode())) {
                issues.add(build(header.getId(), TYPE_ORPHAN, SEVERITY_ERROR, line.getLineNo(),
                        null, "子件编码为空"));
                continue;
            }
            String parent = line.getParentMaterialCode();
            if (!StringUtils.hasText(parent) || !allowedParents.contains(parent)) {
                issues.add(build(header.getId(), TYPE_ORPHAN, SEVERITY_ERROR, line.getLineNo(),
                        line.getChildMaterialCode(), "父件编码不在该 BOM 的 productCode 链路中: " + parent));
            }
        }
        return issues;
    }

    /** 规则 3：缺少用量。 */
    private List<BomIssue> checkMissingQty(Long headerId, List<BomLine> lines) {
        List<BomIssue> issues = new ArrayList<>();
        for (BomLine line : lines) {
            if (line.getQty() == null || line.getQty().compareTo(BigDecimal.ZERO) <= 0) {
                issues.add(build(headerId, TYPE_MISSING_QTY, SEVERITY_ERROR, line.getLineNo(),
                        line.getChildMaterialCode(), "缺少有效用量（用量必须大于 0）"));
            }
        }
        return issues;
    }

    /** 规则 4：日期异常（生效日期晚于失效日期），仅报告不阻断。 */
    private List<BomIssue> checkInvalidDate(Long headerId, List<BomLine> lines) {
        String policy = resolveConfig(CONFIG_INVALID_DATE_POLICY, "report_only");
        List<BomIssue> issues = new ArrayList<>();
        for (BomLine line : lines) {
            if (line.getValidFrom() != null && line.getValidTo() != null
                    && line.getValidFrom().isAfter(line.getValidTo())) {
                issues.add(build(headerId, TYPE_INVALID_DATE, SEVERITY_WARNING, line.getLineNo(),
                        line.getChildMaterialCode(),
                        "生效日期晚于失效日期（处理原则：" + policy + "）"));
            }
        }
        return issues;
    }

    /** 规则 5：跨 BOM 的循环引用。 */
    private List<BomIssue> checkCycle(BomHeader header) {
        Map<String, List<String>> graph = new HashMap<>();
        collectEdges(header, graph, new HashSet<>());
        List<String> stack = new ArrayList<>();
        List<String> cycleCodes = new ArrayList<>();
        dfsCycle(header.getProductCode(), graph, stack, new HashSet<>(), cycleCodes);
        List<BomIssue> issues = new ArrayList<>();
        Set<String> distinct = new LinkedHashSet<>(cycleCodes);
        for (String code : distinct) {
            issues.add(build(header.getId(), TYPE_CYCLE, SEVERITY_ERROR, null, code,
                    "存在循环引用，环上编码：" + String.join(" -> ", cycleCodes)));
        }
        return issues;
    }

    private void collectEdges(BomHeader header, Map<String, List<String>> graph, Set<Long> loaded) {
        if (!loaded.add(header.getId())) {
            return;
        }
        for (BomLine line : listLines(header.getId())) {
            if (!StringUtils.hasText(line.getChildMaterialCode())) {
                continue;
            }
            graph.computeIfAbsent(line.getParentMaterialCode(), k -> new ArrayList<>())
                    .add(line.getChildMaterialCode());
            for (BomHeader childHeader : findHeaders(line.getChildMaterialCode(), header.getBomType())) {
                collectEdges(childHeader, graph, loaded);
            }
        }
    }

    private boolean dfsCycle(String node, Map<String, List<String>> graph, List<String> stack,
                             Set<String> done, List<String> cycleCodes) {
        if (done.contains(node)) {
            return false;
        }
        int index = stack.indexOf(node);
        if (index >= 0) {
            cycleCodes.addAll(stack.subList(index, stack.size()));
            return true;
        }
        stack.add(node);
        for (String next : graph.getOrDefault(node, List.of())) {
            if (dfsCycle(next, graph, stack, done, cycleCodes)) {
                return true;
            }
        }
        stack.remove(stack.size() - 1);
        done.add(node);
        return false;
    }

    private List<BomHeader> findHeaders(String productCode, String bomType) {
        return bomHeaderMapper.selectList(Wrappers.<BomHeader>lambdaQuery()
                .eq(BomHeader::getProductCode, productCode)
                .eq(BomHeader::getBomType, bomType)
                .in(BomHeader::getStatus, List.of("released", "draft")));
    }

    private boolean isCycleCheckEnabled() {
        String value = configService.getValue(CONFIG_CYCLE_ENABLED);
        return value == null || Boolean.parseBoolean(value);
    }

    private List<BomLine> listLines(Long headerId) {
        return bomLineMapper.selectList(Wrappers.<BomLine>lambdaQuery()
                .eq(BomLine::getHeaderId, headerId)
                .orderByAsc(BomLine::getLineNo));
    }

    private String lineKey(BomLine line) {
        return Objects.toString(line.getParentMaterialCode(), "") + "|"
                + Objects.toString(line.getChildMaterialCode(), "") + "|"
                + Objects.toString(line.getItemSeq(), "");
    }

    private String resolveConfig(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    private BomIssue build(Long headerId, String issueType, String severity, Integer lineNo,
                           String materialCode, String message) {
        BomIssue issue = new BomIssue();
        issue.setHeaderId(headerId);
        issue.setIssueType(issueType);
        issue.setSeverity(severity);
        issue.setLineNo(lineNo);
        issue.setMaterialCode(materialCode);
        issue.setMessage(truncate(message));
        issue.setStatus(STATUS_OPEN);
        return issue;
    }

    private String truncate(String value) {
        if (value == null || value.length() <= 500) {
            return value;
        }
        return value.substring(0, 500);
    }

    private BomHeader requireHeader(Long headerId) {
        BomHeader header = bomHeaderMapper.selectById(headerId);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "BOM 不存在: " + headerId);
        }
        return header;
    }
}
