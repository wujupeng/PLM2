package com.huaweicloud.plm.system.service;

import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CodeGenerateRequest;
import com.huaweicloud.plm.system.dto.CodeGenerateResponse;
import com.huaweicloud.plm.system.dto.CodeSegmentValueResponse;
import com.huaweicloud.plm.system.entity.CodeRule;
import com.huaweicloud.plm.system.entity.CodeRuleSegment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * N5 编码生成引擎：按编码规则分段取值为原码生成新追溯码。
 */
@Service
@RequiredArgsConstructor
public class CodeGenerationService {

    private static final String CODE_TYPE_14 = "CODE14";
    private static final String CODE_TYPE_24 = "CODE24";
    private static final String CODE_TYPE_28 = "CODE28";
    private static final String TYPE_FIXED = "FIXED";
    private static final String TYPE_FIELD = "FIELD";
    private static final String TYPE_DICT = "DICT";
    private static final String TYPE_DATE = "DATE";
    private static final String TYPE_SEQ = "SEQ";
    private static final String DEFAULT_PLANT = "XA";
    private static final String DEFAULT_FILL_CHAR = "0";
    private static final String DEFAULT_SEQ_SCOPE = "plant+partNo8";
    private static final int DEFAULT_MAX_SEQ = 9999;
    private static final int DEFAULT_WARN_THRESHOLD = 9000;
    private static final int MAX_QTY = 500;

    private final CodeRuleService codeRuleService;
    private final CodeDictionaryService codeDictionaryService;
    private final CodeSequenceService codeSequenceService;
    private final ConfigService configService;

    /**
     * 生成编码，支持一次生成多个。
     */
    @Transactional(rollbackFor = Exception.class)
    public CodeGenerateResponse generate(CodeGenerateRequest request) {
        CodeRule rule = resolveRule(request);
        String codeType = rule.getCodeType();
        List<CodeRuleSegment> segs = codeRuleService.listSegments(rule.getId());
        if (CollectionUtils.isEmpty(segs)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "编码规则未配置分段定义: " + rule.getRuleCode());
        }
        List<CodeRuleSegment> ordered = orderSegments(segs);
        LocalDate generateDate = request.getGenerateDate() == null ? LocalDate.now() : request.getGenerateDate();

        int qty = request.getQty() == null ? 1 : request.getQty();
        if (qty < 1) {
            qty = 1;
        }
        if (qty > MAX_QTY) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "单次生成数量不能超过 500");
        }

        List<String> codes = new ArrayList<>();
        Set<String> warnings = new LinkedHashSet<>();
        GeneratedOnce first = null;
        GeneratedOnce last = null;
        for (int i = 0; i < qty; i++) {
            GeneratedOnce once = generateOnce(rule, ordered, generateDate, request.getFieldValues(), codeType);
            if (first == null) {
                first = once;
            }
            last = once;
            codes.add(once.code());
            warnings.addAll(once.warnings());
        }

        CodeGenerateResponse response = new CodeGenerateResponse();
        response.setCode(first.code());
        response.setCodeType(codeType);
        response.setRuleId(rule.getId());
        response.setRuleCode(rule.getRuleCode());
        response.setGenerateDate(generateDate);
        response.setSequenceValue(last.sequenceValue());
        response.setSequenceCode(last.sequenceCode());
        response.setSequenceWarn(last.sequenceWarn());
        response.setSequenceMessage(last.sequenceMessage());
        response.setSegments(first.segments());
        response.setCodes(codes);
        response.setWarnings(new ArrayList<>(warnings));
        return response;
    }

    /**
     * 便捷方法：按 codeType 生成一个编码，fieldValues 作为分段取值。
     */
    public String generateCode(String codeType, Map<String, String> fieldValues) {
        CodeGenerateRequest request = new CodeGenerateRequest();
        request.setCodeType(codeType);
        request.setFieldValues(fieldValues);
        return generate(request).getCode();
    }

    /**
     * 解析编码规则：ruleCode 优先，其次按 codeType + 维度匹配。
     */
    private CodeRule resolveRule(CodeGenerateRequest request) {
        if (StringUtils.hasText(request.getRuleCode())) {
            String ruleCode = request.getRuleCode();
            if (StringUtils.hasText(request.getCodeType())) {
                for (CodeRule rule : codeRuleService.listOptions(request.getCodeType())) {
                    if (ruleCode.equals(rule.getRuleCode())) {
                        return rule;
                    }
                }
            }
            for (CodeRule rule : codeRuleService.listOptions(null)) {
                if (ruleCode.equals(rule.getRuleCode())) {
                    return rule;
                }
            }
            throw new BusinessException(ResultCode.NOT_FOUND, "编码规则不存在: " + ruleCode);
        }
        if (!StringUtils.hasText(request.getCodeType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "编码类型不能为空");
        }
        if (!isSupportedCodeType(request.getCodeType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "仅支持 CODE14/CODE24/CODE28");
        }
        return codeRuleService.matchRule(request.getCodeType(), request.getCustomerCode(),
                request.getProjectCode(), request.getPlantCode());
    }

    private boolean isSupportedCodeType(String codeType) {
        return CODE_TYPE_14.equals(codeType) || CODE_TYPE_24.equals(codeType) || CODE_TYPE_28.equals(codeType);
    }

    /**
     * 单次生成：先解析字段/码表取值，再逐段计算并按段拼装编码。
     */
    private GeneratedOnce generateOnce(CodeRule rule, List<CodeRuleSegment> segs, LocalDate generateDate,
                                       Map<String, String> fieldValues, String codeType) {
        List<String> warnings = new ArrayList<>();
        Map<String, String> resolved = new LinkedHashMap<>();
        if (fieldValues != null) {
            resolved.putAll(fieldValues);
        }
        resolveFieldAndDict(segs, fieldValues, resolved, warnings, codeType);

        StringBuilder builder = new StringBuilder();
        List<CodeSegmentValueResponse> segmentResponses = new ArrayList<>();
        Integer sequenceValue = null;
        String sequenceCode = null;
        boolean sequenceWarn = false;
        String sequenceMessage = null;

        for (CodeRuleSegment seg : segs) {
            String raw;
            if (TYPE_SEQ.equals(seg.getValueType())) {
                CodeSequenceService.SequenceNext next = nextSequence(rule, codeType, generateDate, resolved);
                raw = next.code();
                sequenceValue = next.value();
                sequenceCode = next.code();
                sequenceWarn = next.warn();
                sequenceMessage = next.message();
            } else {
                raw = computeSegmentValue(seg, generateDate, resolved);
            }
            String padded = padValue(seg, raw);
            builder.append(padded);

            CodeSegmentValueResponse segmentResponse = new CodeSegmentValueResponse();
            segmentResponse.setSegNo(seg.getSegNo());
            segmentResponse.setSegName(seg.getSegName());
            segmentResponse.setSegKey(seg.getSegKey());
            segmentResponse.setStartPos(seg.getStartPos());
            segmentResponse.setEndPos(seg.getEndPos());
            segmentResponse.setSegLength(seg.getSegLength() == null
                    ? seg.getEndPos() - seg.getStartPos() + 1 : seg.getSegLength());
            segmentResponse.setValueType(seg.getValueType());
            segmentResponse.setValue(padded);
            segmentResponse.setDatePattern(seg.getDatePattern());
            segmentResponse.setDictType(seg.getDictType());
            segmentResponse.setValueName(StringUtils.hasText(seg.getDictType())
                    ? codeDictionaryService.resolveName(seg.getDictType(), padded) : null);
            segmentResponses.add(segmentResponse);
        }

        String code = builder.toString();
        int totalLength = rule.getTotalLength() == null ? 0 : rule.getTotalLength();
        if (code.length() != totalLength) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "生成编码长度 " + code.length() + " 与规则定义 " + totalLength + " 不一致");
        }
        return new GeneratedOnce(code, segmentResponses, sequenceValue, sequenceCode, sequenceWarn, sequenceMessage,
                warnings);
    }

    /**
     * 预解析 FIELD 与 DICT 分段取值，供后续 SEQ 维度拼装使用。
     */
    private void resolveFieldAndDict(List<CodeRuleSegment> segs, Map<String, String> fieldValues,
                                     Map<String, String> resolved, List<String> warnings, String codeType) {
        Map<String, String> source = fieldValues == null ? Collections.emptyMap() : fieldValues;
        for (CodeRuleSegment seg : segs) {
            if (!TYPE_FIELD.equals(seg.getValueType())) {
                continue;
            }
            String key = valueKey(seg);
            String value = source.get(key);
            if (!StringUtils.hasText(value) && CODE_TYPE_24.equals(codeType) && "partNo8".equals(key)) {
                String customerPartNo = source.get("customerPartNo");
                if (StringUtils.hasText(customerPartNo) && customerPartNo.length() >= 8) {
                    value = customerPartNo.substring(customerPartNo.length() - 8);
                    warnings.add("八位零件号取自客户零件号后 8 位，八位零件号映射关系待业务方确认（配置项 code.partNo8.mapping）");
                }
            }
            if (!StringUtils.hasText(value)) {
                throw new BusinessException(ResultCode.BAD_REQUEST,
                        "缺少编码分段取值: " + seg.getSegName() + "（" + seg.getSegKey() + "）");
            }
            resolved.put(key, value);
            if (StringUtils.hasText(seg.getSegKey())) {
                resolved.putIfAbsent(seg.getSegKey(), value);
            }
        }
        for (CodeRuleSegment seg : segs) {
            if (!TYPE_DICT.equals(seg.getValueType())) {
                continue;
            }
            String key = valueKey(seg);
            String value = source.get(key);
            if (!StringUtils.hasText(value) && isPlantKey(seg)) {
                value = configService.getValue("code.24.default.plant");
                if (!StringUtils.hasText(value)) {
                    value = DEFAULT_PLANT;
                }
            }
            if (!StringUtils.hasText(value)) {
                throw new BusinessException(ResultCode.BAD_REQUEST,
                        "缺少编码分段取值: " + seg.getSegName() + "（" + seg.getSegKey() + "）");
            }
            validateDict(seg, value, warnings);
            resolved.put(key, value);
            if (StringUtils.hasText(seg.getSegKey())) {
                resolved.putIfAbsent(seg.getSegKey(), value);
            }
        }
    }

    private boolean isPlantKey(CodeRuleSegment seg) {
        return "plantCode".equals(seg.getFieldKey()) || "plantCode".equals(seg.getSegKey());
    }

    private void validateDict(CodeRuleSegment seg, String value, List<String> warnings) {
        String dictType = seg.getDictType();
        if (!StringUtils.hasText(dictType)) {
            return;
        }
        if (codeDictionaryService.exists(dictType, value)) {
            return;
        }
        if (codeDictionaryService.listByType(dictType).isEmpty()) {
            warnings.add("码表 " + dictType + " 尚未配置数据，取值 " + value + " 未做校验");
            return;
        }
        throw new BusinessException(ResultCode.BAD_REQUEST, "码表 " + dictType + " 中不存在取值: " + value);
    }

    private String computeSegmentValue(CodeRuleSegment seg, LocalDate generateDate, Map<String, String> resolved) {
        String type = seg.getValueType() == null ? TYPE_FIXED : seg.getValueType();
        switch (type) {
            case TYPE_FIELD:
            case TYPE_DICT:
                return resolved.get(valueKey(seg));
            case TYPE_DATE:
                return dateValue(seg, generateDate);
            case TYPE_FIXED:
            default:
                return seg.getFixedValue() == null ? "" : seg.getFixedValue();
        }
    }

    private String dateValue(CodeRuleSegment seg, LocalDate generateDate) {
        String pattern = seg.getDatePattern();
        if (!StringUtils.hasText(pattern)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "日期分段缺少 date_pattern 配置");
        }
        LocalDate date = generateDate;
        int offset = seg.getDayOffset() == null ? 0 : seg.getDayOffset();
        if (offset != 0) {
            date = generateDate.plusDays(offset);
        }
        return switch (pattern.trim().toUpperCase()) {
            case "YEAR_LAST1" -> String.valueOf(date.getYear() % 10);
            case "YEAR2" -> String.format("%02d", date.getYear() % 100);
            case "DAY_OF_YEAR" -> String.format("%03d", date.getDayOfYear());
            case "MONTH2" -> String.format("%02d", date.getMonthValue());
            case "DAY2" -> String.format("%02d", date.getDayOfMonth());
            case "MONTH_CODE" -> monthCode(date.getMonthValue());
            case "DAY_CODE" -> dayCode(date.getDayOfMonth());
            default -> throw new BusinessException(ResultCode.BAD_REQUEST, "不支持的日期取值方式: " + pattern);
        };
    }

    private String monthCode(int month) {
        return switch (month) {
            case 10 -> "X";
            case 11 -> "Y";
            case 12 -> "Z";
            default -> String.valueOf(month);
        };
    }

    private String dayCode(int day) {
        if (day <= 9) {
            return String.valueOf(day);
        }
        if (day <= 19) {
            return String.valueOf((char) ('A' + (day - 10)));
        }
        if (day <= 29) {
            return String.valueOf((char) ('K' + (day - 20)));
        }
        if (day == 30) {
            return "U";
        }
        return "V";
    }

    private CodeSequenceService.SequenceNext nextSequence(CodeRule rule, String codeType, LocalDate generateDate,
                                                          Map<String, String> resolved) {
        String scopeKey = buildScopeKey(configService.getValue("code.seq.scope"), resolved);
        int maxValue = parseInt(configService.getValue("code.seq.max"), -1);
        if (maxValue <= 0) {
            maxValue = rule.getSeqEnd() == null ? DEFAULT_MAX_SEQ : rule.getSeqEnd();
        }
        if (maxValue <= 0) {
            maxValue = DEFAULT_MAX_SEQ;
        }
        int warnThreshold = parseInt(configService.getValue("code.seq.warn.threshold"), DEFAULT_WARN_THRESHOLD);
        if (warnThreshold <= 0) {
            warnThreshold = DEFAULT_WARN_THRESHOLD;
        }
        int seqLength = rule.getSeqLength() == null ? 0 : rule.getSeqLength();
        String seqKey = codeSequenceService.buildSeqKey(codeType, scopeKey, rule.getSeqDimension(), generateDate);
        return codeSequenceService.next(seqKey, rule.getSeqDimension(), generateDate, seqLength, maxValue, warnThreshold);
    }

    /**
     * 按 code.seq.scope 计算流水号 scopeKey，配置值为 "字段1+字段2" 形式，缺值以 "-" 占位。
     */
    private String buildScopeKey(String scopeConfig, Map<String, String> resolved) {
        String config = StringUtils.hasText(scopeConfig) ? scopeConfig : DEFAULT_SEQ_SCOPE;
        List<String> parts = new ArrayList<>();
        for (String rawKey : config.split("\\+")) {
            String key = rawKey.trim();
            if (key.isEmpty()) {
                continue;
            }
            String value = resolved.get(key);
            parts.add(StringUtils.hasText(value) ? value : "-");
        }
        if (parts.isEmpty()) {
            parts.add("-");
        }
        return String.join("|", parts);
    }

    private String padValue(CodeRuleSegment seg, String raw) {
        String value = raw == null ? "" : raw;
        int segLength = seg.getSegLength() == null
                ? seg.getEndPos() - seg.getStartPos() + 1 : seg.getSegLength();
        if (value.length() > segLength) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "分段 " + seg.getSegName() + " 取值长度超出定义: " + value);
        }
        if (value.length() >= segLength) {
            return value;
        }
        String fillMode = StringUtils.hasText(seg.getFillMode()) ? seg.getFillMode() : "LEFT";
        if ("NONE".equalsIgnoreCase(fillMode)) {
            return value;
        }
        String fillChar = StringUtils.hasText(seg.getFillChar()) ? seg.getFillChar() : DEFAULT_FILL_CHAR;
        int need = segLength - value.length();
        StringBuilder filler = new StringBuilder();
        while (filler.length() < need) {
            filler.append(fillChar);
        }
        String pad = filler.substring(0, need);
        return "RIGHT".equalsIgnoreCase(fillMode) ? value + pad : pad + value;
    }

    private List<CodeRuleSegment> orderSegments(List<CodeRuleSegment> segs) {
        List<CodeRuleSegment> ordered = new ArrayList<>(segs);
        ordered.sort((a, b) -> Integer.compare(position(a), position(b)));
        return ordered;
    }

    private int position(CodeRuleSegment seg) {
        if (seg.getSegNo() != null) {
            return seg.getSegNo();
        }
        return seg.getStartPos() == null ? 0 : seg.getStartPos();
    }

    private String valueKey(CodeRuleSegment seg) {
        return StringUtils.hasText(seg.getFieldKey()) ? seg.getFieldKey() : seg.getSegKey();
    }

    private int parseInt(String value, int defaultValue) {
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /** 单次生成结果。 */
    private record GeneratedOnce(String code, List<CodeSegmentValueResponse> segments, Integer sequenceValue,
                                 String sequenceCode, boolean sequenceWarn, String sequenceMessage,
                                 List<String> warnings) {
    }
}
