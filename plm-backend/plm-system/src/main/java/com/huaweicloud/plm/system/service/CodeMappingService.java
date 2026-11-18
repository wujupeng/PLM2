package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CodeMappingDetailResponse;
import com.huaweicloud.plm.system.dto.CodeMappingQuery;
import com.huaweicloud.plm.system.dto.CodeMappingSaveRequest;
import com.huaweicloud.plm.system.entity.CodeMapping;
import com.huaweicloud.plm.system.entity.ScanLog;
import com.huaweicloud.plm.system.mapper.CodeMappingMapper;
import com.huaweicloud.plm.system.mapper.ScanLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 原码到新码的映射服务（N5）。
 */
@Service
@RequiredArgsConstructor
public class CodeMappingService {

    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_VOID = "void";
    private static final String DEFAULT_SOURCE_TYPE = "CODE14";
    private static final String DEFAULT_TARGET_TYPE = "CODE24";

    private final CodeMappingMapper codeMappingMapper;
    private final ScanLogMapper scanLogMapper;

    public PageResult<CodeMapping> page(CodeMappingQuery query) {
        Page<CodeMapping> page = query.toPage();
        codeMappingMapper.selectPage(page, Wrappers.<CodeMapping>lambdaQuery()
                .eq(StringUtils.hasText(query.getSourceCode()), CodeMapping::getSourceCode, query.getSourceCode())
                .eq(StringUtils.hasText(query.getTargetCode()), CodeMapping::getTargetCode, query.getTargetCode())
                .eq(StringUtils.hasText(query.getSourceCodeType()), CodeMapping::getSourceCodeType,
                        query.getSourceCodeType())
                .eq(StringUtils.hasText(query.getStatus()), CodeMapping::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getProductCode()), CodeMapping::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), CodeMapping::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getPlantCode()), CodeMapping::getPlantCode, query.getPlantCode())
                .ge(query.getDateFrom() != null, CodeMapping::getCreatedAt,
                        query.getDateFrom() == null ? null : query.getDateFrom().atStartOfDay())
                .lt(query.getDateTo() != null, CodeMapping::getCreatedAt,
                        query.getDateTo() == null ? null : query.getDateTo().plusDays(1).atStartOfDay())
                .orderByDesc(CodeMapping::getCreatedAt));
        return PageResult.of(page);
    }

    public CodeMappingDetailResponse detail(Long mappingId) {
        CodeMapping mapping = requireMapping(mappingId);
        CodeMappingDetailResponse response = new CodeMappingDetailResponse();
        response.setMapping(mapping);
        response.setLogs(listLogsBySource(mapping.getSourceCode()));
        return response;
    }

    public List<ScanLog> listLogsBySource(String sourceCode) {
        return scanLogMapper.selectList(Wrappers.<ScanLog>lambdaQuery()
                .eq(ScanLog::getSourceCode, sourceCode)
                .orderByDesc(ScanLog::getScanAt)
                .orderByDesc(ScanLog::getId));
    }

    public CodeMapping findBySource(String sourceCode) {
        if (!StringUtils.hasText(sourceCode)) {
            return null;
        }
        return codeMappingMapper.selectOne(Wrappers.<CodeMapping>lambdaQuery()
                .eq(CodeMapping::getSourceCode, sourceCode)
                .last("LIMIT 1"));
    }

    public CodeMapping findByTarget(String targetCode) {
        if (!StringUtils.hasText(targetCode)) {
            return null;
        }
        return codeMappingMapper.selectOne(Wrappers.<CodeMapping>lambdaQuery()
                .eq(CodeMapping::getTargetCode, targetCode)
                .last("LIMIT 1"));
    }

    public CodeMapping requireMapping(Long mappingId) {
        CodeMapping mapping = codeMappingMapper.selectById(mappingId);
        if (mapping == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "编码映射不存在: " + mappingId);
        }
        return mapping;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(CodeMappingSaveRequest request) {
        if (findBySource(request.getSourceCode()) != null) {
            throw new BusinessException(ResultCode.CONFLICT, "原码已存在映射: " + request.getSourceCode());
        }
        if (codeMappingMapper.countByTargetCode(request.getTargetCode()) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "追溯码已被占用: " + request.getTargetCode());
        }
        LocalDateTime now = LocalDateTime.now();
        CodeMapping mapping = new CodeMapping();
        mapping.setSourceCode(request.getSourceCode());
        mapping.setSourceCodeType(StringUtils.hasText(request.getSourceCodeType())
                ? request.getSourceCodeType() : DEFAULT_SOURCE_TYPE);
        mapping.setSourceRuleCode(request.getSourceRuleCode());
        mapping.setTargetCode(request.getTargetCode());
        mapping.setTargetCodeType(StringUtils.hasText(request.getTargetCodeType())
                ? request.getTargetCodeType() : DEFAULT_TARGET_TYPE);
        mapping.setRuleId(request.getRuleId());
        mapping.setRuleCode(request.getRuleCode());
        mapping.setProductCode(request.getProductCode());
        mapping.setMaterialCode(request.getMaterialCode());
        mapping.setBatchNo(request.getBatchNo());
        mapping.setQty(request.getQty() == null ? 1 : request.getQty());
        mapping.setPlantCode(request.getPlantCode());
        mapping.setCustomerCode(request.getCustomerCode());
        mapping.setVersionNo(request.getVersionNo());
        mapping.setStatus(STATUS_ACTIVE);
        mapping.setScanCount(1);
        mapping.setFirstScanAt(now);
        mapping.setLastScanAt(now);
        mapping.setOperatorId(request.getOperatorId());
        mapping.setOperatorName(request.getOperatorName());
        mapping.setPrintTaskNo(request.getPrintTaskNo());
        mapping.setRemark(request.getRemark());
        codeMappingMapper.insert(mapping);
        return mapping.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void voidMapping(Long mappingId, String reason) {
        CodeMapping mapping = requireMapping(mappingId);
        if (STATUS_VOID.equals(mapping.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "该映射已作废");
        }
        mapping.setStatus(STATUS_VOID);
        String voidRemark = "已作废：" + (reason == null ? "" : reason);
        mapping.setRemark(StringUtils.hasText(mapping.getRemark())
                ? mapping.getRemark() + "；" + voidRemark : voidRemark);
        codeMappingMapper.updateById(mapping);
    }

    @Transactional(rollbackFor = Exception.class)
    public void touch(Long mappingId) {
        codeMappingMapper.increaseScanCount(mappingId, LocalDateTime.now());
    }
}
