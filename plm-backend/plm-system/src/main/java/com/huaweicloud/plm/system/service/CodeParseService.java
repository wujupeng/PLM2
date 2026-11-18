package com.huaweicloud.plm.system.service;

import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CodeParseResponse;
import com.huaweicloud.plm.system.dto.CodeSegmentValueResponse;
import com.huaweicloud.plm.system.entity.CodeRule;
import com.huaweicloud.plm.system.entity.CodeRuleSegment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * N5 编码解析：按编码规则分段切分编码并校验码表、反推日期。
 */
@Service
@RequiredArgsConstructor
public class CodeParseService {

    private static final String CODE_TYPE_14 = "CODE14";
    private static final String CODE_TYPE_24 = "CODE24";
    private static final String CODE_TYPE_28 = "CODE28";
    private static final String TYPE_DICT = "DICT";
    private static final String TYPE_DATE = "DATE";
    private static final String TYPE_SEQ = "SEQ";
    private static final String LENGTH_MISMATCH = "编码长度与规则定义不一致";

    private final CodeRuleService codeRuleService;
    private final CodeDictionaryService codeDictionaryService;

    /**
     * 按长度自动识别类型后解析（14/24/28）。
     */
    public CodeParseResponse parse(String code) {
        return parse(code, null);
    }

    /**
     * 指定类型解析（类型为空时按长度自动识别）。
     */
    public CodeParseResponse parse(String code, String codeType) {
        if (!StringUtils.hasText(code)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "编码不能为空");
        }
        String value = code.trim();
        String type = codeType;
        if (!StringUtils.hasText(type)) {
            type = detectType(value);
        }

        CodeRule rule = codeRuleService.matchRule(type, null, null, null);
        List<CodeRuleSegment> segs = codeRuleService.listSegments(rule.getId());

        CodeParseResponse response = new CodeParseResponse();
        response.setCode(value);
        response.setCodeType(type);
        response.setCodeLength(value.length());
        response.setRuleId(rule.getId());
        response.setRuleCode(rule.getRuleCode());
        response.setValidFlag(Boolean.TRUE);
        response.setSegments(new ArrayList<>());
        response.setFieldValues(new LinkedHashMap<>());
        response.setWarnings(new ArrayList<>());

        if (CollectionUtils.isEmpty(segs)) {
            response.setValidFlag(Boolean.FALSE);
            response.setFailReason("编码规则未配置分段定义: " + rule.getRuleCode());
            return response;
        }

        Integer yearValue = null;
        Integer dayOfYear = null;
        Integer monthValue = null;
        Integer dayOfMonth = null;

        for (CodeRuleSegment seg : segs) {
            Integer start = seg.getStartPos();
            Integer end = seg.getEndPos();
            CodeSegmentValueResponse segmentResponse = new CodeSegmentValueResponse();
            segmentResponse.setSegNo(seg.getSegNo());
            segmentResponse.setSegName(seg.getSegName());
            segmentResponse.setSegKey(seg.getSegKey());
            segmentResponse.setStartPos(start);
            segmentResponse.setEndPos(end);
            segmentResponse.setSegLength(seg.getSegLength());
            segmentResponse.setValueType(seg.getValueType());
            segmentResponse.setDatePattern(seg.getDatePattern());
            segmentResponse.setDictType(seg.getDictType());

            if (start == null || end == null || start < 1 || end > value.length() || end < start) {
                response.setValidFlag(Boolean.FALSE);
                appendFailReason(response, LENGTH_MISMATCH);
                response.getSegments().add(segmentResponse);
                continue;
            }
            String segmentValue = value.substring(start - 1, end);
            segmentResponse.setValue(segmentValue);
            response.getFieldValues().put(valueKey(seg), segmentValue);

            if (TYPE_DICT.equals(seg.getValueType())) {
                checkDict(seg, segmentValue, segmentResponse, response);
            } else if (TYPE_SEQ.equals(seg.getValueType())) {
                response.setSequenceValue(parseIntOrNull(segmentValue));
            } else if (TYPE_DATE.equals(seg.getValueType())) {
                // 日期反推：按 date_pattern 记录中间值，循环结束后统一推算 parsedDate
                String pattern = seg.getDatePattern() == null ? "" : seg.getDatePattern().trim().toUpperCase();
                switch (pattern) {
                    case "YEAR_LAST1" -> yearValue = reverseYearLast1(segmentValue);
                    case "YEAR2" -> yearValue = reverseYear2(segmentValue);
                    case "DAY_OF_YEAR" -> dayOfYear = parseIntOrNull(segmentValue);
                    case "MONTH_CODE" -> {
                        monthValue = reverseMonthCode(segmentValue);
                        if (monthValue != null) {
                            segmentResponse.setValueName(monthValue + " 月");
                        }
                    }
                    case "DAY_CODE" -> {
                        dayOfMonth = reverseDayCode(segmentValue);
                        if (dayOfMonth != null) {
                            segmentResponse.setValueName(dayOfMonth + " 日");
                        }
                    }
                    default -> {
                    }
                }
            }

            response.getSegments().add(segmentResponse);
        }

        resolveParsedDate(response, yearValue, dayOfYear, monthValue, dayOfMonth);
        return response;
    }

    private String detectType(String value) {
        return switch (value.length()) {
            case 14 -> CODE_TYPE_14;
            case 24 -> CODE_TYPE_24;
            case 28 -> CODE_TYPE_28;
            default -> throw new BusinessException(ResultCode.BAD_REQUEST,
                    "无法识别的编码长度 " + value.length() + "，仅支持 14/24/28 位");
        };
    }

    private void checkDict(CodeRuleSegment seg, String segmentValue, CodeSegmentValueResponse segmentResponse,
                           CodeParseResponse response) {
        String dictType = seg.getDictType();
        if (!StringUtils.hasText(dictType)) {
            return;
        }
        if (codeDictionaryService.exists(dictType, segmentValue)) {
            segmentResponse.setValueName(codeDictionaryService.resolveName(dictType, segmentValue));
            return;
        }
        if (codeDictionaryService.listByType(dictType).isEmpty()) {
            response.getWarnings().add("码表 " + dictType + " 尚未配置数据，取值 " + segmentValue + " 未做校验");
            return;
        }
        response.setValidFlag(Boolean.FALSE);
        appendFailReason(response, "码表 " + dictType + " 中不存在取值 " + segmentValue);
    }

    private Integer reverseYearLast1(String segmentValue) {
        Integer digit = parseIntOrNull(segmentValue);
        if (digit == null) {
            return null;
        }
        int currentYear = LocalDate.now().getYear();
        return currentYear - (currentYear % 10) + digit;
    }

    private Integer reverseYear2(String segmentValue) {
        Integer yy = parseIntOrNull(segmentValue);
        if (yy == null) {
            return null;
        }
        int currentYear = LocalDate.now().getYear();
        return (currentYear / 100) * 100 + yy;
    }

    private Integer reverseMonthCode(String segmentValue) {
        if (!StringUtils.hasText(segmentValue)) {
            return null;
        }
        char c = segmentValue.charAt(0);
        if (c >= '1' && c <= '9') {
            return c - '0';
        }
        return switch (c) {
            case 'X' -> 10;
            case 'Y' -> 11;
            case 'Z' -> 12;
            default -> null;
        };
    }

    private Integer reverseDayCode(String segmentValue) {
        if (!StringUtils.hasText(segmentValue)) {
            return null;
        }
        char c = segmentValue.charAt(0);
        if (c >= '1' && c <= '9') {
            return c - '0';
        }
        if (c >= 'A' && c <= 'J') {
            return 10 + (c - 'A');
        }
        if (c >= 'K' && c <= 'T') {
            return 20 + (c - 'K');
        }
        if (c == 'U') {
            return 30;
        }
        if (c == 'V') {
            return 31;
        }
        return null;
    }

    private void resolveParsedDate(CodeParseResponse response, Integer yearValue, Integer dayOfYear,
                                   Integer monthValue, Integer dayOfMonth) {
        if (yearValue == null) {
            return;
        }
        if (dayOfYear != null) {
            try {
                response.setParsedDate(LocalDate.ofYearDay(yearValue, dayOfYear));
            } catch (DateTimeException e) {
                response.setValidFlag(Boolean.FALSE);
                appendFailReason(response, "自然日 366 仅闰年有效");
            }
            return;
        }
        if (monthValue != null && dayOfMonth != null) {
            try {
                response.setParsedDate(LocalDate.of(yearValue, monthValue, dayOfMonth));
            } catch (DateTimeException e) {
                response.setValidFlag(Boolean.FALSE);
                appendFailReason(response, "月份与日期组合无效");
            }
        }
    }

    private void appendFailReason(CodeParseResponse response, String reason) {
        if (!StringUtils.hasText(response.getFailReason())) {
            response.setFailReason(reason);
            return;
        }
        if (!response.getFailReason().contains(reason)) {
            response.setFailReason(response.getFailReason() + "；" + reason);
        }
    }

    private Integer parseIntOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String valueKey(CodeRuleSegment seg) {
        return StringUtils.hasText(seg.getFieldKey()) ? seg.getFieldKey() : seg.getSegKey();
    }
}
