package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiMessageReceiveRequest;
import com.huaweicloud.plm.system.dto.EdiRawMessageQuery;
import com.huaweicloud.plm.system.entity.EdiCustomerDemand;
import com.huaweicloud.plm.system.entity.EdiMessageMap;
import com.huaweicloud.plm.system.entity.EdiRawMessage;
import com.huaweicloud.plm.system.entity.EdiTransactionSet;
import com.huaweicloud.plm.system.mapper.EdiMessageMapMapper;
import com.huaweicloud.plm.system.mapper.EdiRawMessageMapper;
import com.huaweicloud.plm.system.mapper.EdiTransactionSetMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.CRC32;

/**
 * EDI 报文接收与解析服务（N6，DEV-064/065/066/067/068）：接收、防重、解析映射、失败重试与重放。
 *
 * <p>解析失败按配置 {@code edi.dead_letter.enabled} 决定是否进入死信待人工处理；
 * 防重口径、分隔符、标准版本等未明确规则均来自后台配置项，不写死在代码中。</p>
 */
@Service
@RequiredArgsConstructor
public class EdiMessageService {

    private static final String DIRECTION_INBOUND = "INBOUND";
    private static final String STATUS_RECEIVED = "RECEIVED";
    private static final String STATUS_PARSED = "PARSED";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_DUPLICATE = "DUPLICATE";
    private static final String STATUS_DEAD_LETTER = "DEAD_LETTER";
    private static final String DEFAULT_DEDUP_POLICY = "partner_code+trans_code+control_no";
    private static final String WILDCARD_PARTNER = "*";
    private static final int MESSAGE_LENGTH_LIMIT = 900;

    private final EdiRawMessageMapper ediRawMessageMapper;
    private final EdiTransactionSetMapper ediTransactionSetMapper;
    private final EdiMessageMapMapper ediMessageMapMapper;
    private final EdiMessageParser ediMessageParser;
    private final EdiCustomerDemandService ediCustomerDemandService;
    private final EdiSupportService ediSupport;
    private final ObjectMapper objectMapper;

    /**
     * 接收原始报文：写入报文台账、按策略防重，并按配置决定是否立即解析。
     */
    public EdiRawMessage receive(EdiMessageReceiveRequest request) {
        EdiTransactionSet transSet = findTransSet(request.getPartnerCode(), request.getTransCode());

        EdiRawMessage message = new EdiRawMessage();
        message.setMessageNo(ediSupport.nextNo("MSG"));
        message.setControlNo(request.getControlNo());
        message.setPartnerCode(request.getPartnerCode());
        message.setTransCode(request.getTransCode());
        message.setDirection(DIRECTION_INBOUND);
        message.setStandard(StringUtils.hasText(request.getStandard()) ? request.getStandard()
                : transSet == null ? null : transSet.getStandard());
        message.setProtocol(request.getProtocol());
        message.setFileName(request.getFileName());
        message.setRawContent(request.getRawContent());
        message.setRawSize(request.getRawContent().getBytes(StandardCharsets.UTF_8).length);
        message.setChecksum(checksum(request.getRawContent()));
        message.setReceivedAt(request.getReceivedAt() == null ? LocalDateTime.now() : request.getReceivedAt());
        message.setRetryCount(0);
        message.setDuplicateFlag(0);
        message.setParseStatus(STATUS_RECEIVED);
        message.setRemark(request.getRemark());

        String dedupPolicy = ediSupport.config("edi.dedup.policy", DEFAULT_DEDUP_POLICY);
        if (isDuplicate(dedupPolicy, message)) {
            message.setDuplicateFlag(1);
            message.setParseStatus(STATUS_DUPLICATE);
            message.setParseMessage("按防重策略 " + dedupPolicy + " 判定为重复报文，已跳过解析");
        }
        ediRawMessageMapper.insert(message);
        ediSupport.writeLog(message.getMessageNo(), message.getPartnerCode(), message.getTransCode(), DIRECTION_INBOUND,
                "RECEIVE", message.getDuplicateFlag() == 1 ? "DUPLICATE" : "SUCCESS",
                message.getParseMessage() == null ? "报文已接收" : message.getParseMessage(), message.getControlNo());

        boolean autoParse = request.getAutoParse() != null
                ? request.getAutoParse() : ediSupport.configBool("edi.auto_parse", true);
        if (message.getDuplicateFlag() == 1 || !autoParse) {
            return message;
        }
        return parse(message.getMessageNo());
    }

    /**
     * 解析已接收报文。
     */
    public EdiRawMessage parse(String messageNo) {
        return doParse(requireMessage(messageNo));
    }

    /**
     * 解析失败重试。
     */
    public EdiRawMessage retry(String messageNo) {
        EdiRawMessage message = requireMessage(messageNo);
        increaseRetry(message);
        return doParse(message);
    }

    /**
     * 报文重放：忽略重复标记后重新解析，用于补偿与联调验证。
     */
    public EdiRawMessage replay(String messageNo) {
        EdiRawMessage message = requireMessage(messageNo);
        message.setDuplicateFlag(0);
        increaseRetry(message);
        return doParse(message);
    }

    public PageResult<EdiRawMessage> page(EdiRawMessageQuery query) {
        Page<EdiRawMessage> page = query.toPage();
        ediRawMessageMapper.selectPage(page, Wrappers.<EdiRawMessage>lambdaQuery()
                .eq(StringUtils.hasText(query.getPartnerCode()), EdiRawMessage::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getTransCode()), EdiRawMessage::getTransCode, query.getTransCode())
                .eq(StringUtils.hasText(query.getDirection()), EdiRawMessage::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getParseStatus()), EdiRawMessage::getParseStatus, query.getParseStatus())
                .eq(query.getDuplicateFlag() != null, EdiRawMessage::getDuplicateFlag, query.getDuplicateFlag())
                .ge(query.getDateFrom() != null, EdiRawMessage::getReceivedAt,
                        query.getDateFrom() == null ? null : query.getDateFrom().atStartOfDay())
                .lt(query.getDateTo() != null, EdiRawMessage::getReceivedAt,
                        query.getDateTo() == null ? null : query.getDateTo().plusDays(1).atStartOfDay())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiRawMessage::getMessageNo, query.getKeyword()).or()
                        .like(EdiRawMessage::getControlNo, query.getKeyword()).or()
                        .like(EdiRawMessage::getFileName, query.getKeyword()))
                .orderByDesc(EdiRawMessage::getId));
        return PageResult.of(page);
    }

    public EdiRawMessage requireMessage(String messageNo) {
        EdiRawMessage message = ediRawMessageMapper.selectOne(Wrappers.<EdiRawMessage>lambdaQuery()
                .eq(EdiRawMessage::getMessageNo, messageNo));
        if (message == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "报文不存在: " + messageNo);
        }
        return message;
    }

    public EdiRawMessage detail(String messageNo) {
        return requireMessage(messageNo);
    }

    /**
     * 解析主流程：先按映射解析为标准字段，再落库客户需求；失败时记录失败原因并按配置进入死信。
     */
    private EdiRawMessage doParse(EdiRawMessage message) {
        try {
            EdiTransactionSet transSet = findTransSet(message.getPartnerCode(), message.getTransCode());
            List<EdiMessageMap> maps = findMaps(message.getPartnerCode(), message.getTransCode());
            if (transSet == null && maps.isEmpty()) {
                throw new BusinessException(ResultCode.BAD_REQUEST,
                        "未配置交易集与报文映射，无法解析: " + message.getPartnerCode() + "/" + message.getTransCode());
            }
            EdiMessageParser.ParseResult parsed = ediMessageParser.parse(transSet, maps, message.getRawContent(),
                    ediSupport.config("edi.file.delimiter.segment", "~"),
                    ediSupport.config("edi.file.delimiter.element", "*"),
                    ediSupport.config("edi.file.delimiter.sub_element", ":"));
            if (!parsed.hasContent()) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "报文未匹配到任何映射字段，请检查报文映射配置");
            }

            List<EdiCustomerDemand> demands = ediCustomerDemandService.ingest(message, parsed);
            message.setParsedJson(objectMapper.writeValueAsString(demands));
            message.setParseStatus(STATUS_PARSED);
            message.setParseMessage("解析成功，生成 " + demands.size() + " 条客户需求");
            message.setRelatedDocNo(demands.stream()
                    .map(EdiCustomerDemand::getDemandNo)
                    .distinct()
                    .collect(Collectors.joining(",")));
            ediRawMessageMapper.updateById(message);
            ediSupport.writeLog(message.getMessageNo(), message.getPartnerCode(), message.getTransCode(),
                    DIRECTION_INBOUND, "PARSE", "SUCCESS", message.getParseMessage(), message.getRelatedDocNo());
        } catch (Exception e) {
            boolean deadLetter = ediSupport.configBool("edi.dead_letter.enabled", true);
            message.setParseStatus(deadLetter ? STATUS_DEAD_LETTER : STATUS_FAILED);
            message.setParseMessage(truncate(e.getMessage()));
            message.setParsedJson(null);
            ediRawMessageMapper.updateById(message);
            ediSupport.writeLog(message.getMessageNo(), message.getPartnerCode(), message.getTransCode(),
                    DIRECTION_INBOUND, "PARSE", "FAILED", message.getParseMessage(), null);
        }
        return message;
    }

    private void increaseRetry(EdiRawMessage message) {
        message.setRetryCount(message.getRetryCount() == null ? 1 : message.getRetryCount() + 1);
        message.setLastRetryAt(LocalDateTime.now());
    }

    /**
     * 查交易集：优先伙伴专属配置，其次使用通配伙伴（*）的通用配置。
     */
    private EdiTransactionSet findTransSet(String partnerCode, String transCode) {
        EdiTransactionSet specific = firstOf(ediTransactionSetMapper.selectList(Wrappers.<EdiTransactionSet>lambdaQuery()
                .eq(EdiTransactionSet::getPartnerCode, partnerCode)
                .eq(StringUtils.hasText(transCode), EdiTransactionSet::getTransCode, transCode)
                .eq(EdiTransactionSet::getDirection, DIRECTION_INBOUND)
                .eq(EdiTransactionSet::getStatus, "enabled")
                .orderByDesc(EdiTransactionSet::getId)));
        if (specific != null) {
            return specific;
        }
        return firstOf(ediTransactionSetMapper.selectList(Wrappers.<EdiTransactionSet>lambdaQuery()
                .eq(EdiTransactionSet::getPartnerCode, WILDCARD_PARTNER)
                .eq(StringUtils.hasText(transCode), EdiTransactionSet::getTransCode, transCode)
                .eq(EdiTransactionSet::getDirection, DIRECTION_INBOUND)
                .eq(EdiTransactionSet::getStatus, "enabled")
                .orderByDesc(EdiTransactionSet::getId)));
    }

    /**
     * 查报文映射：优先伙伴专属映射；伙伴未配置时使用通配伙伴（*）的通用映射。
     */
    private List<EdiMessageMap> findMaps(String partnerCode, String transCode) {
        List<EdiMessageMap> specific = ediMessageMapMapper.selectList(Wrappers.<EdiMessageMap>lambdaQuery()
                .eq(EdiMessageMap::getPartnerCode, partnerCode)
                .eq(StringUtils.hasText(transCode), EdiMessageMap::getTransCode, transCode)
                .eq(EdiMessageMap::getDirection, DIRECTION_INBOUND)
                .eq(EdiMessageMap::getStatus, 1)
                .orderByAsc(EdiMessageMap::getSortNo));
        if (!specific.isEmpty()) {
            return specific;
        }
        return ediMessageMapMapper.selectList(Wrappers.<EdiMessageMap>lambdaQuery()
                .eq(EdiMessageMap::getPartnerCode, WILDCARD_PARTNER)
                .eq(StringUtils.hasText(transCode), EdiMessageMap::getTransCode, transCode)
                .eq(EdiMessageMap::getDirection, DIRECTION_INBOUND)
                .eq(EdiMessageMap::getStatus, 1)
                .orderByAsc(EdiMessageMap::getSortNo));
    }

    /**
     * 按配置的防重口径判定是否重复；口径为空或关键字段缺失时不启用防重。
     */
    private boolean isDuplicate(String policy, EdiRawMessage message) {
        if (!StringUtils.hasText(policy)) {
            return false;
        }
        List<String> tokens = Arrays.stream(policy.split("\\+"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
        if (tokens.isEmpty()) {
            return false;
        }
        var wrapper = Wrappers.<EdiRawMessage>lambdaQuery().eq(EdiRawMessage::getDuplicateFlag, 0);
        for (String token : tokens) {
            switch (token.toLowerCase()) {
                case "partner_code" -> {
                    if (!StringUtils.hasText(message.getPartnerCode())) {
                        return false;
                    }
                    wrapper.eq(EdiRawMessage::getPartnerCode, message.getPartnerCode());
                }
                case "trans_code" -> {
                    if (!StringUtils.hasText(message.getTransCode())) {
                        return false;
                    }
                    wrapper.eq(EdiRawMessage::getTransCode, message.getTransCode());
                }
                case "control_no" -> {
                    if (!StringUtils.hasText(message.getControlNo())) {
                        return false;
                    }
                    wrapper.eq(EdiRawMessage::getControlNo, message.getControlNo());
                }
                case "checksum" -> {
                    if (!StringUtils.hasText(message.getChecksum())) {
                        return false;
                    }
                    wrapper.eq(EdiRawMessage::getChecksum, message.getChecksum());
                }
                default -> {
                    // 未识别的防重字段忽略，可通过配置项扩展
                }
            }
        }
        return ediRawMessageMapper.selectCount(wrapper) > 0;
    }

    private EdiTransactionSet firstOf(List<EdiTransactionSet> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    private String checksum(String content) {
        CRC32 crc32 = new CRC32();
        crc32.update(content.getBytes(StandardCharsets.UTF_8));
        return Long.toHexString(crc32.getValue()).toUpperCase();
    }

    private String truncate(String message) {
        if (message == null) {
            return "解析失败";
        }
        return message.length() > MESSAGE_LENGTH_LIMIT ? message.substring(0, MESSAGE_LENGTH_LIMIT) : message;
    }
}
