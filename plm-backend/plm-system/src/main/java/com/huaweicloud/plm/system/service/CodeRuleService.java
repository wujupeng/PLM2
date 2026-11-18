package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CodeRuleDetailResponse;
import com.huaweicloud.plm.system.dto.CodeRulePreviewRequest;
import com.huaweicloud.plm.system.dto.CodeRulePreviewResponse;
import com.huaweicloud.plm.system.dto.CodeRuleQuery;
import com.huaweicloud.plm.system.dto.CodeRuleSaveRequest;
import com.huaweicloud.plm.system.dto.CodeRuleSegmentResponse;
import com.huaweicloud.plm.system.dto.CodeRuleSegmentSaveRequest;
import com.huaweicloud.plm.system.entity.CodeRule;
import com.huaweicloud.plm.system.entity.CodeRuleSegment;
import com.huaweicloud.plm.system.mapper.CodeRuleMapper;
import com.huaweicloud.plm.system.mapper.CodeRuleSegmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 编码规则与分段服务（DEV-051 / DEV-052 / DEV-062）。
 */
@Service
@RequiredArgsConstructor
public class CodeRuleService {

    private static final String DEFAULT_RULE_VERSION = "V1";
    private static final String DEFAULT_SEQ_DIMENSION = "DAY";
    private static final String DEFAULT_STATUS = "draft";
    private static final String STATUS_ENABLED = "enabled";
    private static final String STATUS_DISABLED = "disabled";
    private static final String CODE_TYPE_14 = "CODE14";
    private static final String CODE_TYPE_28 = "CODE28";
    private static final String DEFAULT_VALUE_TYPE = "FIXED";
    private static final String DEFAULT_FILL_CHAR = "0";
    private static final String DEFAULT_FILL_MODE = "LEFT";
    private static final String SEGMENT_CONTINUITY_MESSAGE = "分段定义必须从第 1 位开始连续覆盖到第 N 位且不能重叠";

    private final CodeRuleMapper codeRuleMapper;
    private final CodeRuleSegmentMapper codeRuleSegmentMapper;

    public PageResult<CodeRule> page(CodeRuleQuery query) {
        Page<CodeRule> page = query.toPage();
        codeRuleMapper.selectPage(page, Wrappers.<CodeRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getCodeType()), CodeRule::getCodeType, query.getCodeType())
                .eq(StringUtils.hasText(query.getStatus()), CodeRule::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getCustomerCode()), CodeRule::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getPlantCode()), CodeRule::getPlantCode, query.getPlantCode())
                .eq(query.getIsDefault() != null, CodeRule::getIsDefault, query.getIsDefault())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(CodeRule::getRuleCode, query.getKeyword()).or()
                        .like(CodeRule::getRuleName, query.getKeyword()))
                .orderByAsc(CodeRule::getCodeType)
                .orderByAsc(CodeRule::getRuleCode));
        return PageResult.of(page);
    }

    public List<CodeRule> listOptions(String codeType) {
        return codeRuleMapper.selectList(Wrappers.<CodeRule>lambdaQuery()
                .eq(StringUtils.hasText(codeType), CodeRule::getCodeType, codeType)
                .eq(CodeRule::getStatus, STATUS_ENABLED)
                .orderByAsc(CodeRule::getCodeType)
                .orderByAsc(CodeRule::getRuleCode));
    }

    public CodeRuleDetailResponse detail(Long ruleId) {
        CodeRule rule = requireRule(ruleId);
        CodeRuleDetailResponse response = new CodeRuleDetailResponse();
        response.setRule(rule);
        response.setSegments(listSegments(ruleId).stream()
                .map(CodeRuleSegmentResponse::from)
                .collect(Collectors.toList()));
        return response;
    }

    @Transactional
    public Long create(CodeRuleSaveRequest request) {
        if (!StringUtils.hasText(request.getCodeType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "编码类型不能为空");
        }
        String ruleVersion = resolveRuleVersion(request.getRuleVersion());
        ensureUniqueCode(request.getRuleCode(), ruleVersion, -1L);
        int totalLength = resolveTotalLength(request.getCodeType(), request.getTotalLength());
        CodeRule rule = new CodeRule();
        applyRequest(rule, request, ruleVersion, totalLength);
        codeRuleMapper.insert(rule);
        return rule.getId();
    }

    @Transactional
    public void update(Long ruleId, CodeRuleSaveRequest request) {
        CodeRule rule = requireRule(ruleId);
        if (!StringUtils.hasText(request.getCodeType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "编码类型不能为空");
        }
        String ruleVersion = resolveRuleVersion(request.getRuleVersion());
        ensureUniqueCode(request.getRuleCode(), ruleVersion, ruleId);
        int totalLength = resolveTotalLength(request.getCodeType(), request.getTotalLength());
        applyRequest(rule, request, ruleVersion, totalLength);
        codeRuleMapper.updateById(rule);
    }

    @Transactional
    public void delete(Long ruleId) {
        CodeRule rule = requireRule(ruleId);
        if (STATUS_ENABLED.equals(rule.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "规则已启用，需先停用后再删除");
        }
        codeRuleSegmentMapper.deleteByRuleId(ruleId);
        codeRuleMapper.deleteById(ruleId);
    }

    @Transactional
    public void saveSegments(Long ruleId, List<CodeRuleSegmentSaveRequest> segments) {
        CodeRule rule = requireRule(ruleId);
        if (CollectionUtils.isEmpty(segments)) {
            codeRuleSegmentMapper.deleteByRuleId(ruleId);
            return;
        }
        // 连续性校验必须在插入之前完成，避免不合法数据落库
        validateSegments(segments, rule.getTotalLength());
        codeRuleSegmentMapper.deleteByRuleId(ruleId);
        int seq = 1;
        for (CodeRuleSegmentSaveRequest request : segments) {
            CodeRuleSegment segment = new CodeRuleSegment();
            segment.setRuleId(ruleId);
            segment.setSegNo(request.getSegNo() == null ? seq : request.getSegNo());
            applySegment(segment, request);
            codeRuleSegmentMapper.insert(segment);
            seq++;
        }
    }

    @Transactional
    public void enable(Long ruleId) {
        CodeRule rule = requireRule(ruleId);
        rule.setStatus(STATUS_ENABLED);
        codeRuleMapper.updateById(rule);
        if (rule.getIsDefault() != null && rule.getIsDefault() == 1) {
            codeRuleMapper.update(null, Wrappers.<CodeRule>lambdaUpdate()
                    .set(CodeRule::getIsDefault, 0)
                    .eq(CodeRule::getCodeType, rule.getCodeType())
                    .eq(CodeRule::getIsDefault, 1)
                    .ne(CodeRule::getId, ruleId));
        }
    }

    @Transactional
    public void disable(Long ruleId) {
        CodeRule rule = requireRule(ruleId);
        rule.setStatus(STATUS_DISABLED);
        codeRuleMapper.updateById(rule);
    }

    public CodeRulePreviewResponse preview(CodeRulePreviewRequest request) {
        List<CodeRuleSegmentSaveRequest> segments = request.getSegments();
        if (CollectionUtils.isEmpty(segments)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "分段定义为空");
        }
        int totalLength = resolveTotalLength(request.getCodeType(), request.getTotalLength());
        CodeRulePreviewResponse response = new CodeRulePreviewResponse();
        response.setTotalLength(totalLength);
        try {
            validateSegments(segments, totalLength);
            response.setValid(true);
        } catch (BusinessException ex) {
            response.setValid(false);
            response.setMessage(ex.getMessage());
        }
        response.setSegmentDescriptions(buildDescriptions(segments));
        return response;
    }

    public CodeRule requireRule(Long ruleId) {
        CodeRule rule = codeRuleMapper.selectById(ruleId);
        if (rule == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "编码规则不存在: " + ruleId);
        }
        return rule;
    }

    public CodeRule matchRule(String codeType, String customerCode, String projectCode, String plantCode) {
        List<CodeRule> candidates = codeRuleMapper.selectList(Wrappers.<CodeRule>lambdaQuery()
                .eq(CodeRule::getCodeType, codeType)
                .eq(CodeRule::getStatus, STATUS_ENABLED));
        if (CollectionUtils.isEmpty(candidates)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "未找到可用的编码规则: " + codeType);
        }
        boolean hasInputDimension = StringUtils.hasText(customerCode)
                || StringUtils.hasText(projectCode)
                || StringUtils.hasText(plantCode);
        if (hasInputDimension) {
            CodeRule best = null;
            int bestSpecificity = -1;
            for (CodeRule candidate : candidates) {
                if (!dimensionMatched(candidate, customerCode, projectCode, plantCode)) {
                    continue;
                }
                int specificity = dimensionSpecificity(candidate);
                if (specificity > bestSpecificity) {
                    bestSpecificity = specificity;
                    best = candidate;
                }
            }
            if (best != null) {
                return best;
            }
        }
        for (CodeRule candidate : candidates) {
            if (candidate.getIsDefault() != null && candidate.getIsDefault() == 1) {
                return candidate;
            }
        }
        return candidates.stream()
                .max(Comparator.comparing(CodeRule::getRuleVersion,
                        Comparator.nullsFirst(Comparator.naturalOrder())))
                .orElseThrow(() -> new BusinessException(ResultCode.NOT_FOUND, "未找到可用的编码规则: " + codeType));
    }

    public List<CodeRuleSegment> listSegments(Long ruleId) {
        return codeRuleSegmentMapper.selectList(Wrappers.<CodeRuleSegment>lambdaQuery()
                .eq(CodeRuleSegment::getRuleId, ruleId)
                .orderByAsc(CodeRuleSegment::getStartPos));
    }

    private void applyRequest(CodeRule rule, CodeRuleSaveRequest request, String ruleVersion, int totalLength) {
        rule.setRuleCode(request.getRuleCode());
        rule.setRuleName(request.getRuleName());
        rule.setCodeType(request.getCodeType());
        rule.setRuleVersion(ruleVersion);
        rule.setCustomerCode(request.getCustomerCode());
        rule.setProjectCode(request.getProjectCode());
        rule.setPlantCode(request.getPlantCode());
        rule.setTotalLength(totalLength);
        rule.setSeqDimension(StringUtils.hasText(request.getSeqDimension())
                ? request.getSeqDimension() : DEFAULT_SEQ_DIMENSION);
        rule.setSeqStart(request.getSeqStart());
        rule.setSeqEnd(request.getSeqEnd());
        rule.setSeqLength(request.getSeqLength());
        rule.setIsDefault(request.getIsDefault() == null ? 0 : request.getIsDefault());
        rule.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : DEFAULT_STATUS);
        rule.setEffectiveDate(request.getEffectiveDate());
        rule.setExpireDate(request.getExpireDate());
        rule.setDescription(request.getDescription());
        rule.setRemark(request.getRemark());
    }

    private void applySegment(CodeRuleSegment segment, CodeRuleSegmentSaveRequest request) {
        segment.setSegName(request.getSegName());
        segment.setSegKey(request.getSegKey());
        segment.setStartPos(request.getStartPos());
        segment.setEndPos(request.getEndPos());
        segment.setSegLength(request.getSegLength() != null
                ? request.getSegLength()
                : request.getEndPos() - request.getStartPos() + 1);
        segment.setValueType(StringUtils.hasText(request.getValueType())
                ? request.getValueType() : DEFAULT_VALUE_TYPE);
        segment.setFixedValue(request.getFixedValue());
        segment.setFieldKey(request.getFieldKey());
        segment.setDictType(request.getDictType());
        segment.setDatePattern(request.getDatePattern());
        segment.setDayOffset(request.getDayOffset() == null ? 0 : request.getDayOffset());
        segment.setFillChar(StringUtils.hasText(request.getFillChar())
                ? request.getFillChar() : DEFAULT_FILL_CHAR);
        segment.setFillMode(StringUtils.hasText(request.getFillMode())
                ? request.getFillMode() : DEFAULT_FILL_MODE);
        segment.setSourceRef(request.getSourceRef());
        segment.setSortNo(request.getSortNo() == null ? segment.getSegNo() : request.getSortNo());
        segment.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        segment.setRemark(request.getRemark());
    }

    private void validateSegments(List<CodeRuleSegmentSaveRequest> segments, int totalLength) {
        List<CodeRuleSegmentSaveRequest> sorted = sortedByStartPos(segments);
        int expectedStart = 1;
        for (CodeRuleSegmentSaveRequest segment : sorted) {
            Integer start = segment.getStartPos();
            Integer end = segment.getEndPos();
            if (start == null || end == null || start != expectedStart || end < start) {
                throw new BusinessException(ResultCode.BAD_REQUEST, SEGMENT_CONTINUITY_MESSAGE);
            }
            expectedStart = end + 1;
        }
        if (expectedStart - 1 != totalLength) {
            throw new BusinessException(ResultCode.BAD_REQUEST, SEGMENT_CONTINUITY_MESSAGE);
        }
    }

    private List<String> buildDescriptions(List<CodeRuleSegmentSaveRequest> segments) {
        return sortedByStartPos(segments).stream()
                .map(this::describeSegment)
                .collect(Collectors.toList());
    }

    private String describeSegment(CodeRuleSegmentSaveRequest segment) {
        int segLength = segment.getSegLength() != null
                ? segment.getSegLength()
                : (segment.getStartPos() != null && segment.getEndPos() != null
                        ? segment.getEndPos() - segment.getStartPos() + 1 : 0);
        String valueType = segment.getValueType() == null ? "" : segment.getValueType();
        String detail = switch (valueType) {
            case "FIXED" -> "固定值 " + nullToEmpty(segment.getFixedValue());
            case "FIELD" -> "字段(" + nullToEmpty(segment.getFieldKey()) + ")";
            case "DATE" -> "日期(" + nullToEmpty(segment.getDatePattern()) + ")";
            case "DICT" -> "码表(" + nullToEmpty(segment.getDictType()) + ")";
            case "SEQ" -> "流水号(" + segLength + " 位)";
            default -> valueType;
        };
        return segment.getStartPos() + "-" + segment.getEndPos() + " "
                + nullToEmpty(segment.getSegName()) + " " + detail;
    }

    private List<CodeRuleSegmentSaveRequest> sortedByStartPos(List<CodeRuleSegmentSaveRequest> segments) {
        List<CodeRuleSegmentSaveRequest> sorted = new ArrayList<>(segments);
        sorted.sort(Comparator.comparingInt(segment -> segment.getStartPos() == null ? 0 : segment.getStartPos()));
        return sorted;
    }

    private boolean dimensionMatched(CodeRule rule, String customerCode, String projectCode, String plantCode) {
        return matchesDimension(rule.getCustomerCode(), customerCode)
                && matchesDimension(rule.getProjectCode(), projectCode)
                && matchesDimension(rule.getPlantCode(), plantCode);
    }

    private boolean matchesDimension(String candidateValue, String inputValue) {
        if (!StringUtils.hasText(inputValue)) {
            return true;
        }
        return inputValue.equals(candidateValue);
    }

    private int dimensionSpecificity(CodeRule rule) {
        int count = 0;
        if (StringUtils.hasText(rule.getCustomerCode())) {
            count++;
        }
        if (StringUtils.hasText(rule.getProjectCode())) {
            count++;
        }
        if (StringUtils.hasText(rule.getPlantCode())) {
            count++;
        }
        return count;
    }

    private String resolveRuleVersion(String ruleVersion) {
        return StringUtils.hasText(ruleVersion) ? ruleVersion : DEFAULT_RULE_VERSION;
    }

    private int resolveTotalLength(String codeType, Integer totalLength) {
        int length = totalLength != null ? totalLength : inferTotalLength(codeType);
        if (length != 14 && length != 24 && length != 28) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "仅支持 14/24/28 位编码长度");
        }
        return length;
    }

    private int inferTotalLength(String codeType) {
        if (CODE_TYPE_14.equals(codeType)) {
            return 14;
        }
        if (CODE_TYPE_28.equals(codeType)) {
            return 28;
        }
        return 24;
    }

    private void ensureUniqueCode(String ruleCode, String ruleVersion, Long excludeId) {
        if (codeRuleMapper.countByCode(ruleCode, ruleVersion, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "编码规则已存在: " + ruleCode + "/" + ruleVersion);
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
