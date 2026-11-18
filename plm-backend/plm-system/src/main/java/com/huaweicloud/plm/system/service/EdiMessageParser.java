package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.system.entity.EdiMessageMap;
import com.huaweicloud.plm.system.entity.EdiTransactionSet;
import com.huaweicloud.plm.system.entity.SysDictionary;
import com.huaweicloud.plm.system.mapper.SysDictionaryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * EDI 报文解析与映射引擎（N6，DEV-065/067）：按交易集与报文映射把原始报文转为标准客户需求字段。
 *
 * <p>报文按段/元素/子元素分隔符切分；映射的源路径形如 {@code BEG03}（段标签 + 元素序号，可带 {@code -N} 子元素），
 * 作用域为 HEADER 时取首个匹配段，作用域为 LINE 时按行段逐行取值。</p>
 *
 * <p>分隔符与标准版本均来自后台配置（例如 X12 的 {@code ~}、{@code *}、{@code :}），未明确的编码与规则不写死在代码中。</p>
 */
@Service
@RequiredArgsConstructor
public class EdiMessageParser {

    /** 源路径：段标签 + 元素序号 + 可选子元素序号。 */
    private static final Pattern PATH_PATTERN = Pattern.compile("^(.*?)(\\d+)(?:-(\\d+))?$");

    /** 需求单号中的流水号占位，例如 {4 位流水号}。 */
    private static final Pattern SEQ_PATTERN = Pattern.compile("\\{(\\d+)\\s*位流水号\\}");

    private final SysDictionaryMapper sysDictionaryMapper;

    /**
     * 解析结果：单头字段与明细行字段（每行包含合并后的目标字段值）。
     */
    public record ParseResult(Map<String, String> header, List<Map<String, String>> lines) {

        public boolean hasContent() {
            return !header.isEmpty() || !lines.isEmpty();
        }
    }

    /**
     * 按映射解析报文。
     *
     * @param transSet          交易集配置（可为空，为空时按映射自身解析）
     * @param maps              报文映射（同伙伴、同交易集、同方向）
     * @param rawContent        原始报文
     * @param segmentDelimiter  段分隔符
     * @param elementDelimiter  元素分隔符
     * @param subElementDelimiter 子元素分隔符
     */
    public ParseResult parse(EdiTransactionSet transSet, List<EdiMessageMap> maps, String rawContent,
                             String segmentDelimiter, String elementDelimiter, String subElementDelimiter) {
        List<String[]> segments = splitSegments(rawContent, segmentDelimiter, elementDelimiter);
        Map<String, List<String[]>> byTag = groupByTag(segments);
        String headerTag = firstText(transSet == null ? null : transSet.getHeaderSegTag(), "BEG");

        Map<String, String> header = new LinkedHashMap<>();
        List<Map<String, String>> lines = new ArrayList<>();
        String lineTag = null;

        for (EdiMessageMap map : sorted(maps)) {
            if (!StringUtils.hasText(map.getSourcePath())) {
                continue;
            }
            if (isLineScope(map)) {
                String tag = resolveTag(map.getSourcePath(), byTag.keySet(), headerTag);
                lineTag = tag == null ? lineTag : tag;
            }
        }

        // 单头映射
        for (EdiMessageMap map : sorted(maps)) {
            if (isLineScope(map) || !StringUtils.hasText(map.getSourcePath())) {
                continue;
            }
            String tag = resolveTag(map.getSourcePath(), byTag.keySet(), headerTag);
            String raw = tag == null ? null
                    : element(firstSegment(byTag.get(tag)), resolvePath(map.getSourcePath(), tag), subElementDelimiter);
            putMapped(header, map, raw);
        }

        // 明细行映射
        List<EdiMessageMap> lineMaps = new ArrayList<>();
        for (EdiMessageMap map : sorted(maps)) {
            if (isLineScope(map) && StringUtils.hasText(map.getSourcePath())) {
                lineMaps.add(map);
            }
        }
        if (!lineMaps.isEmpty() && lineTag != null) {
            List<String[]> lineSegments = byTag.getOrDefault(lineTag, List.of());
            for (String[] segment : lineSegments) {
                Map<String, String> line = new LinkedHashMap<>();
                for (EdiMessageMap map : lineMaps) {
                    String tag = resolveTag(map.getSourcePath(), byTag.keySet(), lineTag);
                    String raw = tag == null ? null
                            : element(segment, resolvePath(map.getSourcePath(), tag), subElementDelimiter);
                    putMapped(line, map, raw);
                }
                lines.add(line);
            }
        }

        return new ParseResult(header, lines);
    }

    /**
     * 按配置的模式生成业务单号中的流水号部分，例如 {@code CD-202611-0001}。
     */
    public String formatSequenceNo(String pattern, String defaultPattern, String timestamp, long sequence) {
        String effective = StringUtils.hasText(pattern) ? pattern : defaultPattern;
        String result = effective
                .replace("{yyyyMMdd}", timestamp)
                .replace("{yyyyMM}", timestamp.length() >= 6 ? timestamp.substring(0, 6) : timestamp)
                .replace("{yyyy}", timestamp.length() >= 4 ? timestamp.substring(0, 4) : timestamp);
        Matcher matcher = SEQ_PATTERN.matcher(result);
        StringBuffer buffer = new StringBuffer();
        while (matcher.find()) {
            int width = Integer.parseInt(matcher.group(1));
            matcher.appendReplacement(buffer, Matcher.quoteReplacement(String.format("%0" + width + "d", sequence)));
        }
        matcher.appendTail(buffer);
        return buffer.toString();
    }

    private String firstText(String value, String defaultValue) {
        return StringUtils.hasText(value) ? value.trim() : defaultValue;
    }

    private List<EdiMessageMap> sorted(List<EdiMessageMap> maps) {
        List<EdiMessageMap> copy = new ArrayList<>(maps);
        copy.sort(Comparator.comparing(m -> m.getSortNo() == null ? Integer.MAX_VALUE : m.getSortNo()));
        return copy;
    }

    private boolean isLineScope(EdiMessageMap map) {
        return "LINE".equalsIgnoreCase(map.getScope());
    }

    private String[] firstSegment(List<String[]> segments) {
        return segments == null || segments.isEmpty() ? null : segments.get(0);
    }

    private Map<String, List<String[]>> groupByTag(List<String[]> segments) {
        Map<String, List<String[]>> byTag = new LinkedHashMap<>();
        for (String[] segment : segments) {
            if (segment.length == 0 || !StringUtils.hasText(segment[0])) {
                continue;
            }
            byTag.computeIfAbsent(segment[0], k -> new ArrayList<>()).add(segment);
        }
        return byTag;
    }

    /**
     * 按段/元素分隔符切分报文，剔除空段。数组首位为段标签。
     */
    private List<String[]> splitSegments(String rawContent, String segmentDelimiter, String elementDelimiter) {
        List<String[]> segments = new ArrayList<>();
        if (!StringUtils.hasText(rawContent)) {
            return segments;
        }
        String segDelim = StringUtils.hasText(segmentDelimiter) ? segmentDelimiter : "~";
        String elemDelim = StringUtils.hasText(elementDelimiter) ? elementDelimiter : "*";
        String content = rawContent.replace("\r", "").replace("\n", "");
        for (String part : content.split(Pattern.quote(segDelim), -1)) {
            String trimmed = part.trim();
            if (!StringUtils.hasText(trimmed)) {
                continue;
            }
            segments.add(trimmed.split(Pattern.quote(elemDelim), -1));
        }
        return segments;
    }

    /**
     * 从源路径中解析出段标签：优先匹配报文中实际出现的段标签（长标签优先），避免标签含数字时的歧义。
     */
    private String resolveTag(String sourcePath, Iterable<String> knownTags, String fallbackTag) {
        List<String> candidates = new ArrayList<>();
        for (String tag : knownTags) {
            if (StringUtils.hasText(tag) && sourcePath.startsWith(tag) && sourcePath.length() > tag.length()) {
                candidates.add(tag);
            }
        }
        if (!candidates.isEmpty()) {
            candidates.sort(Comparator.comparingInt(String::length).reversed());
            return candidates.get(0);
        }
        Matcher matcher = PATH_PATTERN.matcher(sourcePath);
        if (matcher.matches() && StringUtils.hasText(matcher.group(1))) {
            return matcher.group(1);
        }
        return StringUtils.hasText(fallbackTag) ? fallbackTag : null;
    }

    /**
     * 解析源路径中段标签之后的元素序号与可选子元素序号，返回 {@code [elementIndex, subIndex]}（序号从 1 开始）。
     */
    private int[] resolvePath(String sourcePath, String tag) {
        String remainder = sourcePath.substring(tag.length());
        Matcher matcher = PATH_PATTERN.matcher(remainder);
        if (!matcher.matches()) {
            return new int[]{-1, -1};
        }
        try {
            int element = Integer.parseInt(matcher.group(2));
            int sub = matcher.group(3) == null ? -1 : Integer.parseInt(matcher.group(3));
            return new int[]{element, sub};
        } catch (NumberFormatException e) {
            return new int[]{-1, -1};
        }
    }

    private String element(String[] segment, int[] path, String subElementDelimiter) {
        if (segment == null || path[0] < 0 || path[0] >= segment.length) {
            return null;
        }
        String value = segment[path[0]];
        if (path[1] > 0 && StringUtils.hasText(value)) {
            String subDelim = StringUtils.hasText(subElementDelimiter) ? subElementDelimiter : ":";
            String[] parts = value.split(Pattern.quote(subDelim), -1);
            value = path[1] - 1 < parts.length ? parts[path[1] - 1] : null;
        }
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private void putMapped(Map<String, String> target, EdiMessageMap map, String raw) {
        if (!StringUtils.hasText(map.getTargetField())) {
            return;
        }
        target.put(map.getTargetField(), transform(map, raw));
    }

    /**
     * 按转换类型处理取值：DIRECT 直取、DICT 码表转换、DATE 日期格式化、CONST 固定常量。
     */
    private String transform(EdiMessageMap map, String raw) {
        String type = StringUtils.hasText(map.getTransformType()) ? map.getTransformType() : "DIRECT";
        if ("CONST".equalsIgnoreCase(type)) {
            return map.getDefaultValue();
        }
        if (!StringUtils.hasText(raw)) {
            return map.getDefaultValue();
        }
        return switch (type.toUpperCase()) {
            case "DICT" -> dictionaryValue(map.getDictType(), raw);
            case "DATE" -> formatDate(raw, map.getDatePattern());
            default -> raw;
        };
    }

    /**
     * 码表转换：按码值或标签匹配字典项，统一返回码值；未命中时返回原值。
     */
    private String dictionaryValue(String dictType, String raw) {
        if (!StringUtils.hasText(dictType)) {
            return raw;
        }
        List<SysDictionary> dictionaries = sysDictionaryMapper.selectList(Wrappers.<SysDictionary>lambdaQuery()
                .eq(SysDictionary::getDictType, dictType));
        for (SysDictionary dictionary : dictionaries) {
            if (raw.equalsIgnoreCase(dictionary.getDictValue())) {
                return dictionary.getDictValue();
            }
        }
        for (SysDictionary dictionary : dictionaries) {
            if (StringUtils.hasText(dictionary.getDictLabel()) && raw.equalsIgnoreCase(dictionary.getDictLabel())) {
                return dictionary.getDictValue();
            }
        }
        return raw;
    }

    /**
     * 日期转换：按配置格式解析并统一返回 ISO 日期（yyyy-MM-dd）；解析失败时返回原值，交由后续校验处理。
     */
    private String formatDate(String raw, String datePattern) {
        String pattern = StringUtils.hasText(datePattern) ? datePattern : "yyyyMMdd";
        try {
            return LocalDate.parse(raw, DateTimeFormatter.ofPattern(pattern)).toString();
        } catch (DateTimeParseException e) {
            return raw;
        }
    }
}
