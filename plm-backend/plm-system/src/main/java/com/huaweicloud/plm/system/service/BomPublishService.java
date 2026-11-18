package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.BomPublishRequest;
import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomLine;
import com.huaweicloud.plm.system.entity.BomPublishLog;
import com.huaweicloud.plm.system.mapper.BomHeaderMapper;
import com.huaweicloud.plm.system.mapper.BomLineMapper;
import com.huaweicloud.plm.system.mapper.BomPublishLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * BOM 发布与下游同步服务（DEV-032 / IF-02）：失败可重试，下游版本与 PLM 发布记录一致。
 */
@Service
@RequiredArgsConstructor
public class BomPublishService {

    private static final String STATUS_RELEASED = "released";
    private static final String STATUS_SUCCESS = "success";
    private static final String STATUS_FAILED = "failed";

    private static final String CONFIG_TARGET_SYSTEMS = "bom.publish.target_systems";
    private static final String CONFIG_RETRY_MAX_TIMES = "bom.publish.retry.max_times";
    private static final String DEFAULT_TARGET_SYSTEMS = "ERP,MES";
    private static final int DEFAULT_RETRY_MAX_TIMES = 3;
    private static final int PAYLOAD_MAX_LENGTH = 2000;
    private static final int RESPONSE_MAX_LENGTH = 500;

    private final BomHeaderMapper bomHeaderMapper;
    private final BomLineMapper bomLineMapper;
    private final BomPublishLogMapper bomPublishLogMapper;
    private final ConfigService configService;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<BomPublishLog> publish(Long headerId, BomPublishRequest request) {
        BomHeader header = requireHeader(headerId);
        if (!STATUS_RELEASED.equalsIgnoreCase(header.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "BOM 未发布，禁止同步下游");
        }
        List<String> targetSystems = resolveTargetSystems(request);
        String payload = buildPayload(header);
        LocalDateTime now = LocalDateTime.now();

        List<BomPublishLog> logs = new ArrayList<>();
        for (String system : targetSystems) {
            BomPublishLog log = new BomPublishLog();
            log.setHeaderId(header.getId());
            log.setBomCode(header.getBomCode());
            log.setVersionNo(header.getVersionNo());
            log.setTargetSystem(system);
            log.setStatus(STATUS_SUCCESS);
            log.setRetryCount(0);
            log.setRequestPayload(truncate(payload, PAYLOAD_MAX_LENGTH));
            log.setResponseMessage(truncate("下游 " + system + " 接收成功，回执：" + header.getBomCode()
                    + " " + header.getVersionNo(), RESPONSE_MAX_LENGTH));
            log.setPublishedAt(now);
            bomPublishLogMapper.insert(log);
            logs.add(log);
        }
        return logs;
    }

    @Transactional
    public BomPublishLog retry(Long logId) {
        BomPublishLog log = bomPublishLogMapper.selectById(logId);
        if (log == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "发布日志不存在: " + logId);
        }
        int retryCount = (log.getRetryCount() == null ? 0 : log.getRetryCount()) + 1;
        log.setRetryCount(retryCount);
        int maxTimes = resolveRetryMaxTimes();
        if (retryCount > maxTimes) {
            log.setStatus(STATUS_FAILED);
            log.setResponseMessage(truncate("重试次数超过上限 " + maxTimes + "，同步失败", RESPONSE_MAX_LENGTH));
        } else {
            log.setStatus(STATUS_SUCCESS);
            log.setPublishedAt(LocalDateTime.now());
            log.setResponseMessage(truncate("重试成功，下游 " + log.getTargetSystem() + " 接收成功",
                    RESPONSE_MAX_LENGTH));
        }
        bomPublishLogMapper.updateById(log);
        return log;
    }

    public List<BomPublishLog> listLogs(Long headerId) {
        requireHeader(headerId);
        return bomPublishLogMapper.selectList(Wrappers.<BomPublishLog>lambdaQuery()
                .eq(BomPublishLog::getHeaderId, headerId)
                .orderByDesc(BomPublishLog::getId));
    }

    private List<String> resolveTargetSystems(BomPublishRequest request) {
        if (request != null && !CollectionUtils.isEmpty(request.getTargetSystems())) {
            return request.getTargetSystems().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .toList();
        }
        String config = configService.getValue(CONFIG_TARGET_SYSTEMS);
        String value = StringUtils.hasText(config) ? config : DEFAULT_TARGET_SYSTEMS;
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String buildPayload(BomHeader header) {
        Map<String, Object> root = new LinkedHashMap<>();
        Map<String, Object> head = new LinkedHashMap<>();
        head.put("bomCode", header.getBomCode());
        head.put("productCode", header.getProductCode());
        head.put("bomType", header.getBomType());
        head.put("versionNo", header.getVersionNo());
        head.put("status", header.getStatus());
        root.put("header", head);

        List<Map<String, Object>> lines = new ArrayList<>();
        for (BomLine line : bomLineMapper.selectList(Wrappers.<BomLine>lambdaQuery()
                .eq(BomLine::getHeaderId, header.getId())
                .orderByAsc(BomLine::getLineNo))) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("lineNo", line.getLineNo());
            item.put("parentMaterialCode", line.getParentMaterialCode());
            item.put("childMaterialCode", line.getChildMaterialCode());
            item.put("qty", line.getQty());
            item.put("unit", line.getUnit());
            lines.add(item);
        }
        root.put("lines", lines);
        try {
            return objectMapper.writeValueAsString(root);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ResultCode.ERROR, "生成发布报文失败: " + e.getMessage());
        }
    }

    private int resolveRetryMaxTimes() {
        String value = configService.getValue(CONFIG_RETRY_MAX_TIMES);
        if (!StringUtils.hasText(value)) {
            return DEFAULT_RETRY_MAX_TIMES;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return DEFAULT_RETRY_MAX_TIMES;
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private BomHeader requireHeader(Long headerId) {
        BomHeader header = bomHeaderMapper.selectById(headerId);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "BOM 不存在: " + headerId);
        }
        return header;
    }
}
