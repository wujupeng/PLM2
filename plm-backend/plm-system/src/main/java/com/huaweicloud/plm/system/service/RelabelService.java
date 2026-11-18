package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.CodeGenerateRequest;
import com.huaweicloud.plm.system.dto.CodeGenerateResponse;
import com.huaweicloud.plm.system.dto.CodeMappingSaveRequest;
import com.huaweicloud.plm.system.dto.CodeParseRequest;
import com.huaweicloud.plm.system.dto.CodeParseResponse;
import com.huaweicloud.plm.system.dto.LabelPrintRequest;
import com.huaweicloud.plm.system.dto.RelabelBatchRequest;
import com.huaweicloud.plm.system.dto.RelabelScanRequest;
import com.huaweicloud.plm.system.dto.RelabelScanResponse;
import com.huaweicloud.plm.system.dto.ScanLogQuery;
import com.huaweicloud.plm.system.entity.CodeMapping;
import com.huaweicloud.plm.system.entity.LabelPrintTask;
import com.huaweicloud.plm.system.entity.ScanLog;
import com.huaweicloud.plm.system.mapper.CodeMappingMapper;
import com.huaweicloud.plm.system.mapper.ScanLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 扫描换标工作台服务（N5，DEV-056/057/061）。
 * <p>
 * 说明：本类为流程编排方法，内部刻意捕获异常以保证每次扫描都留痕，且并发重复扫描依赖唯一索引兜底
 * 后转为防重语义，因此 scan/scanBatch 不整体包事务，写操作的事务由 CodeGenerationService/CodeMappingService/
 * LabelPrintService 各自的 @Transactional 保证。
 */
@Service
@RequiredArgsConstructor
public class RelabelService {

    private static final String ACTION_NEW = "NEW";
    private static final String ACTION_REUSE = "REUSE";
    private static final String ACTION_FAIL = "FAIL";
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_VOID = "void";
    private static final String CODE_TYPE_24 = "CODE24";
    private static final String DEFAULT_PLANT = "XA";
    private static final String TARGET_SAFE_SEPARATOR = "#VOID#";
    private static final DateTimeFormatter SCAN_NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final CodeParseService codeParseService;
    private final CodeGenerationService codeGenerationService;
    private final CodeMappingService codeMappingService;
    private final CodeMappingMapper codeMappingMapper;
    private final ScanLogMapper scanLogMapper;
    private final ConfigService configService;
    private final LabelPrintService labelPrintService;
    private final ObjectMapper objectMapper;

    /**
     * 单条扫描换标。
     */
    public RelabelScanResponse scan(RelabelScanRequest request) {
        String sourceCode = request.getSourceCode() == null ? null : request.getSourceCode().trim();
        if (!StringUtils.hasText(sourceCode)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "原标签编码不能为空");
        }
        String scanNo = generateScanNo();
        ScanLog log = insertInitialLog(scanNo, request, sourceCode);

        CodeMapping existing = codeMappingService.findBySource(sourceCode);
        if (existing != null && STATUS_ACTIVE.equals(existing.getStatus())) {
            return handleActiveExisting(log, sourceCode, existing);
        }
        if (existing != null && STATUS_VOID.equals(existing.getStatus())) {
            RelabelScanResponse response = handleVoidExisting(log, sourceCode, existing);
            if (response != null) {
                return response;
            }
        }

        CodeParseResponse parsed;
        try {
            parsed = codeParseService.parse(sourceCode, request.getCodeType());
        } catch (BusinessException e) {
            return failResponse(log, sourceCode, null, e.getMessage(), false, null);
        }
        if (parsed.getValidFlag() == null || !parsed.getValidFlag()) {
            return failResponse(log, sourceCode, parsed.getCodeType(), parsed.getFailReason(), false, parsed.getWarnings());
        }

        String plantCode = StringUtils.hasText(request.getPlantCode())
                ? request.getPlantCode() : configValue("code.24.default.plant", DEFAULT_PLANT);
        Map<String, String> fieldValues = new HashMap<>();
        if (parsed.getFieldValues() != null) {
            fieldValues.putAll(parsed.getFieldValues());
        }
        if (request.getFieldValues() != null) {
            fieldValues.putAll(request.getFieldValues());
        }
        fieldValues.put("plantCode", plantCode);

        CodeGenerateResponse generated;
        try {
            CodeGenerateRequest generateRequest = new CodeGenerateRequest();
            generateRequest.setCodeType(CODE_TYPE_24);
            generateRequest.setPlantCode(plantCode);
            generateRequest.setQty(1);
            generateRequest.setFieldValues(fieldValues);
            generated = codeGenerationService.generate(generateRequest);
        } catch (BusinessException e) {
            return failResponse(log, sourceCode, parsed.getCodeType(), e.getMessage(), false, parsed.getWarnings());
        }

        Long mappingId;
        try {
            mappingId = codeMappingService.create(buildMappingRequest(request, parsed, generated, plantCode, fieldValues));
        } catch (DuplicateKeyException e) {
            // 并发重复扫描，唯一索引兜底，转为防重语义
            CodeMapping afterRace = codeMappingService.findBySource(sourceCode);
            if (afterRace == null) {
                return failResponse(log, sourceCode, parsed.getCodeType(), "并发换标冲突，请重试", true, null);
            }
            return handleActiveExisting(log, sourceCode, afterRace);
        }

        Set<String> warnings = new LinkedHashSet<>();
        if (parsed.getWarnings() != null) {
            warnings.addAll(parsed.getWarnings());
        }
        if (generated.getWarnings() != null) {
            warnings.addAll(generated.getWarnings());
        }

        String printTaskNo = null;
        if ("true".equalsIgnoreCase(configValue("code.relabel.auto.print", "false"))) {
            try {
                printTaskNo = autoPrint(generated, sourceCode, request, fieldValues, log.getId(), warnings);
                if (StringUtils.hasText(printTaskNo)) {
                    CodeMapping mapping = codeMappingMapper.selectById(mappingId);
                    if (mapping != null) {
                        mapping.setPrintTaskNo(printTaskNo);
                        codeMappingMapper.updateById(mapping);
                    }
                }
            } catch (Exception e) {
                warnings.add("标签打印失败：" + e.getMessage());
            }
        }

        // 更新扫描日志为成功（NEW）
        log.setValidFlag(1);
        log.setActionType(ACTION_NEW);
        log.setTargetCode(generated.getCode());
        log.setMappingId(mappingId);
        log.setSourceType(parsed.getCodeType());
        log.setRuleCode(generated.getRuleCode());
        log.setParseJson(toJson(parsed));
        scanLogMapper.updateById(log);

        RelabelScanResponse response = new RelabelScanResponse();
        response.setScanLogId(log.getId());
        response.setScanNo(scanNo);
        response.setActionType(ACTION_NEW);
        response.setValidFlag(Boolean.TRUE);
        response.setSourceCode(sourceCode);
        response.setSourceType(parsed.getCodeType());
        response.setTargetCode(generated.getCode());
        response.setMappingId(mappingId);
        response.setPrintTaskNo(printTaskNo);
        response.setSegments(generated.getSegments());
        response.setWarnings(new ArrayList<>(warnings));
        response.setSequenceValue(generated.getSequenceValue());
        response.setSequenceWarn(generated.getSequenceWarn());
        response.setSequenceMessage(generated.getSequenceMessage());
        response.setExisting(Boolean.FALSE);
        return response;
    }

    /**
     * 批量扫描换标，单条失败不中断整体。
     */
    public List<RelabelScanResponse> scanBatch(RelabelBatchRequest request) {
        if (CollectionUtils.isEmpty(request.getSourceCodes())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "扫描清单不能为空");
        }
        List<RelabelScanResponse> results = new ArrayList<>();
        for (String sourceCode : request.getSourceCodes()) {
            RelabelScanRequest one = new RelabelScanRequest();
            one.setSourceCode(sourceCode);
            one.setCodeType(request.getCodeType());
            one.setPlantCode(request.getPlantCode());
            one.setTerminalNo(request.getTerminalNo());
            one.setFieldValues(request.getFieldValues());
            try {
                results.add(scan(one));
            } catch (Exception e) {
                RelabelScanResponse fail = new RelabelScanResponse();
                fail.setSourceCode(sourceCode);
                fail.setActionType(ACTION_FAIL);
                fail.setValidFlag(Boolean.FALSE);
                fail.setFailReason(e.getMessage());
                results.add(fail);
            }
        }
        return results;
    }

    public CodeParseResponse parseOnly(CodeParseRequest request) {
        return codeParseService.parse(request.getCode(), request.getCodeType());
    }

    public PageResult<ScanLog> pageLogs(ScanLogQuery query) {
        Page<ScanLog> page = query.toPage();
        scanLogMapper.selectPage(page, Wrappers.<ScanLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getScanNo()), ScanLog::getScanNo, query.getScanNo())
                .eq(StringUtils.hasText(query.getSourceCode()), ScanLog::getSourceCode, query.getSourceCode())
                .eq(StringUtils.hasText(query.getTargetCode()), ScanLog::getTargetCode, query.getTargetCode())
                .eq(StringUtils.hasText(query.getActionType()), ScanLog::getActionType, query.getActionType())
                .eq(query.getValidFlag() != null, ScanLog::getValidFlag, query.getValidFlag())
                .eq(StringUtils.hasText(query.getTerminalNo()), ScanLog::getTerminalNo, query.getTerminalNo())
                .eq(StringUtils.hasText(query.getRuleCode()), ScanLog::getRuleCode, query.getRuleCode())
                .ge(query.getDateFrom() != null, ScanLog::getScanAt,
                        query.getDateFrom() == null ? null : query.getDateFrom().atStartOfDay())
                .lt(query.getDateTo() != null, ScanLog::getScanAt,
                        query.getDateTo() == null ? null : query.getDateTo().plusDays(1).atStartOfDay())
                .orderByDesc(ScanLog::getScanAt)
                .orderByDesc(ScanLog::getId));
        return PageResult.of(page);
    }

    public ScanLog logDetail(Long scanLogId) {
        ScanLog log = scanLogMapper.selectById(scanLogId);
        if (log == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "扫描日志不存在: " + scanLogId);
        }
        return log;
    }

    /**
     * 命中已有有效映射：按防重策略返回或拒绝。
     */
    private RelabelScanResponse handleActiveExisting(ScanLog log, String sourceCode, CodeMapping existing) {
        String policy = configValue("code.relabel.idempotent", "reuse");
        if ("reuse".equalsIgnoreCase(policy)) {
            codeMappingService.touch(existing.getId());
            log.setValidFlag(1);
            log.setActionType(ACTION_REUSE);
            log.setTargetCode(existing.getTargetCode());
            log.setMappingId(existing.getId());
            log.setRuleCode(existing.getRuleCode());
            scanLogMapper.updateById(log);

            List<String> warnings = new ArrayList<>();
            warnings.add("该原码已完成换标，本次按防重策略返回原追溯码");
            RelabelScanResponse response = new RelabelScanResponse();
            response.setScanLogId(log.getId());
            response.setScanNo(log.getScanNo());
            response.setActionType(ACTION_REUSE);
            response.setValidFlag(Boolean.TRUE);
            response.setSourceCode(sourceCode);
            response.setSourceType(existing.getSourceCodeType());
            response.setTargetCode(existing.getTargetCode());
            response.setMappingId(existing.getId());
            response.setWarnings(warnings);
            response.setExisting(Boolean.TRUE);
            return response;
        }
        log.setTargetCode(existing.getTargetCode());
        String failReason = "该原码已生成追溯码 " + existing.getTargetCode() + "，系统配置为不允许重复生成";
        return failResponse(log, sourceCode, existing.getSourceCodeType(), failReason, true, null);
    }

    /**
     * 命中已作废映射：配置允许时先让位唯一索引再重新换标，否则拒绝。
     */
    private RelabelScanResponse handleVoidExisting(ScanLog log, String sourceCode, CodeMapping existing) {
        if (!"true".equalsIgnoreCase(configValue("code.relabel.allow.void", "false"))) {
            String failReason = "该原码映射已作废，是否允许重新换标待业务方确认（配置项 code.relabel.allow.void）";
            return failResponse(log, sourceCode, existing.getSourceCodeType(), failReason, true, null);
        }
        existing.setSourceCode(existing.getSourceCode() + TARGET_SAFE_SEPARATOR + existing.getId());
        existing.setRemark(StringUtils.hasText(existing.getRemark())
                ? existing.getRemark() + "；原映射作废后重新换标" : "原映射作废后重新换标");
        codeMappingMapper.updateById(existing);
        return null;
    }

    private CodeMappingSaveRequest buildMappingRequest(RelabelScanRequest request, CodeParseResponse parsed,
                                                       CodeGenerateResponse generated, String plantCode,
                                                       Map<String, String> fieldValues) {
        CodeMappingSaveRequest mappingRequest = new CodeMappingSaveRequest();
        mappingRequest.setSourceCode(request.getSourceCode().trim());
        mappingRequest.setSourceCodeType(parsed.getCodeType());
        mappingRequest.setTargetCode(generated.getCode());
        mappingRequest.setTargetCodeType(CODE_TYPE_24);
        mappingRequest.setRuleId(generated.getRuleId());
        mappingRequest.setRuleCode(generated.getRuleCode());
        mappingRequest.setPlantCode(plantCode);
        mappingRequest.setCustomerCode(request.getCustomerCode());
        mappingRequest.setVersionNo(fieldValues.get("versionNo"));
        mappingRequest.setProductCode(request.getProductCode());
        mappingRequest.setMaterialCode(request.getMaterialCode());
        mappingRequest.setBatchNo(request.getBatchNo());
        mappingRequest.setQty(request.getQty());
        mappingRequest.setOperatorId(UserContext.getUserId());
        mappingRequest.setOperatorName(UserContext.getUsername());
        mappingRequest.setRemark(request.getRemark());
        return mappingRequest;
    }

    private String autoPrint(CodeGenerateResponse generated, String sourceCode, RelabelScanRequest request,
                             Map<String, String> fieldValues, Long scanLogId, Set<String> warnings) {
        LabelPrintRequest printRequest = new LabelPrintRequest();
        printRequest.setTargetCode(generated.getCode());
        printRequest.setSourceCode(sourceCode);
        printRequest.setLabelType(CODE_TYPE_24);
        printRequest.setProductCode(request.getProductCode());
        printRequest.setMaterialCode(request.getMaterialCode());
        printRequest.setQty(request.getQty() == null ? 1 : request.getQty());
        printRequest.setScanLogId(scanLogId);
        printRequest.setFieldValues(fieldValues);
        Long taskId = labelPrintService.print(printRequest);
        LabelPrintTask task = labelPrintService.detail(taskId);
        return task == null ? null : task.getTaskNo();
    }

    private ScanLog insertInitialLog(String scanNo, RelabelScanRequest request, String sourceCode) {
        ScanLog log = new ScanLog();
        log.setScanNo(scanNo);
        log.setSourceCode(sourceCode);
        log.setValidFlag(0);
        log.setActionType(ACTION_FAIL);
        log.setScanAt(LocalDateTime.now());
        log.setTerminalNo(request.getTerminalNo());
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setRemark(request.getRemark());
        scanLogMapper.insert(log);
        return log;
    }

    private RelabelScanResponse failResponse(ScanLog log, String sourceCode, String sourceType, String failReason,
                                             boolean existing, List<String> warnings) {
        log.setValidFlag(0);
        log.setActionType(ACTION_FAIL);
        log.setFailReason(failReason);
        if (StringUtils.hasText(sourceType)) {
            log.setSourceType(sourceType);
        }
        scanLogMapper.updateById(log);

        RelabelScanResponse response = new RelabelScanResponse();
        response.setScanLogId(log.getId());
        response.setScanNo(log.getScanNo());
        response.setActionType(ACTION_FAIL);
        response.setValidFlag(Boolean.FALSE);
        response.setFailReason(failReason);
        response.setSourceCode(sourceCode);
        response.setSourceType(sourceType);
        response.setExisting(existing);
        response.setWarnings(warnings);
        return response;
    }

    private String generateScanNo() {
        return "SC" + LocalDateTime.now().format(SCAN_NO_FORMAT)
                + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
    }

    private String configValue(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
