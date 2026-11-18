package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CadAttrMappingQuery;
import com.huaweicloud.plm.system.dto.CadAttrMappingSaveRequest;
import com.huaweicloud.plm.system.dto.CadAttrValue;
import com.huaweicloud.plm.system.dto.CadExtractRequest;
import com.huaweicloud.plm.system.dto.CadExtractResult;
import com.huaweicloud.plm.system.dto.CadFileDetailResponse;
import com.huaweicloud.plm.system.dto.CadFileQuery;
import com.huaweicloud.plm.system.dto.CadFileSaveRequest;
import com.huaweicloud.plm.system.entity.CadAttrMapping;
import com.huaweicloud.plm.system.entity.CadExtractError;
import com.huaweicloud.plm.system.entity.CadFile;
import com.huaweicloud.plm.system.mapper.CadAttrMappingMapper;
import com.huaweicloud.plm.system.mapper.CadExtractErrorMapper;
import com.huaweicloud.plm.system.mapper.CadFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * CAD 文件与属性映射服务（DEV-033 ~ DEV-038）。
 *
 * <p>当前落地方式：无真实 CAD 解析服务，CAD 属性提取以上传入参（前端/调用方提供的属性键值）+ 后台映射表
 * （cad_attr_mapping）驱动，避免把属性规则写死在代码里；未配置映射的属性按 cad.extract.error.policy
 * 的 report_only 原则仅报告不改写。切换真实 CAD 解析服务时，只需替换提取来源（即属性键值的获取方式），
 * 映射驱动的匹配与异常判定逻辑保持不变。</p>
 */
@Service
@RequiredArgsConstructor
public class CadFileService {

    private static final String TARGET_ENTITY_DOCUMENT = "document";
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_SUCCESS = "success";
    private static final String STATUS_PARTIAL = "partial";
    private static final String STATUS_FAILED = "failed";
    private static final String ERROR_TYPE_MISSING = "missing";
    private static final String ERROR_TYPE_UNMAPPED = "unmapped";

    // 兼容版本范围未提供时从该配置项回退；提取模式（cad.attr.extract.mode）与异常策略
    // （cad.extract.error.policy）当前实现为映射驱动 + report_only，故不在此处分叉。
    private static final String CONFIG_CAD_COMPAT_RANGE = "cad.software.compat_range";

    private final CadFileMapper cadFileMapper;
    private final CadAttrMappingMapper cadAttrMappingMapper;
    private final CadExtractErrorMapper cadExtractErrorMapper;
    private final ConfigService configService;
    private final ObjectMapper objectMapper;

    public PageResult<CadFile> page(CadFileQuery query) {
        Page<CadFile> page = query.toPage();
        cadFileMapper.selectPage(page, Wrappers.<CadFile>lambdaQuery()
                .eq(StringUtils.hasText(query.getCadNo()), CadFile::getCadNo, query.getCadNo())
                .eq(StringUtils.hasText(query.getFileFormat()), CadFile::getFileFormat, query.getFileFormat())
                .eq(StringUtils.hasText(query.getMaterialCode()), CadFile::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getProductCode()), CadFile::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getExtractStatus()), CadFile::getExtractStatus, query.getExtractStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(CadFile::getCadNo, query.getKeyword()).or()
                        .like(CadFile::getFileName, query.getKeyword()))
                .orderByDesc(CadFile::getCreatedAt));
        return PageResult.of(page);
    }

    public CadFileDetailResponse getDetail(Long cadFileId) {
        requireCadFile(cadFileId);
        CadFileDetailResponse response = new CadFileDetailResponse();
        response.setCadFile(cadFileMapper.selectById(cadFileId));
        response.setErrors(cadExtractErrorMapper.selectList(Wrappers.<CadExtractError>lambdaQuery()
                .eq(CadExtractError::getCadFileId, cadFileId)
                .orderByAsc(CadExtractError::getId)));
        response.setMappings(listEnabledDocumentMappings());
        return response;
    }

    @Transactional
    public Long create(CadFileSaveRequest request) {
        CadFile cadFile = new CadFile();
        applyRequest(cadFile, request);
        if (!StringUtils.hasText(cadFile.getCadNo())) {
            cadFile.setCadNo(generateCadNo());
        }
        if (!StringUtils.hasText(cadFile.getExtractStatus())) {
            cadFile.setExtractStatus(STATUS_PENDING);
        }
        // 兼容版本范围未提供时，回退到后台配置项。
        if (!StringUtils.hasText(cadFile.getCompatRange())) {
            cadFile.setCompatRange(configService.getValue(CONFIG_CAD_COMPAT_RANGE));
        }
        cadFileMapper.insert(cadFile);
        return cadFile.getId();
    }

    public void update(Long cadFileId, CadFileSaveRequest request) {
        CadFile cadFile = requireCadFile(cadFileId);
        applyRequest(cadFile, request);
        cadFileMapper.updateById(cadFile);
    }

    public void delete(Long cadFileId) {
        requireCadFile(cadFileId);
        cadFileMapper.deleteById(cadFileId);
    }

    /**
     * CAD 属性提取：入参属性 + 映射表驱动。提取前清空旧异常，保证结果可重复。
     */
    @Transactional
    public CadExtractResult extract(Long cadFileId, CadExtractRequest request) {
        CadFile cadFile = requireCadFile(cadFileId);
        cadExtractErrorMapper.delete(Wrappers.<CadExtractError>lambdaQuery()
                .eq(CadExtractError::getCadFileId, cadFileId));

        List<CadAttrMapping> mappings = listEnabledDocumentMappings();
        Map<String, String> attrValues = collectAttrValues(request);

        Map<String, String> matched = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();
        Set<String> mappedAttrNames = new HashSet<>();

        for (CadAttrMapping mapping : mappings) {
            String attrName = mapping.getCadAttrName();
            mappedAttrNames.add(attrName);
            String value = attrValues.get(attrName);
            String label = StringUtils.hasText(mapping.getCadAttrLabel()) ? mapping.getCadAttrLabel() : attrName;
            boolean required = mapping.getRequiredFlag() != null && mapping.getRequiredFlag() == 1;
            if (StringUtils.hasText(value)) {
                // transformRule 原样写入，不实现复杂转换。
                matched.put(mapping.getPlmFieldName(), value);
            } else {
                String errorMessage = (required ? "必填属性缺失: " : "可选属性缺失: ") + label;
                errors.add(errorMessage);
                if (required) {
                    saveError(cadFileId, attrName, ERROR_TYPE_MISSING, errorMessage, null);
                }
            }
        }

        // 未配置映射的属性：按 report_only 原则仅报告，不改写原始数据。
        for (Map.Entry<String, String> entry : attrValues.entrySet()) {
            if (!mappedAttrNames.contains(entry.getKey())) {
                String errorMessage = "未配置映射的属性: " + entry.getKey();
                errors.add(errorMessage);
                saveError(cadFileId, entry.getKey(), ERROR_TYPE_UNMAPPED, errorMessage, entry.getValue());
            }
        }

        String extractStatus;
        if (errors.isEmpty()) {
            extractStatus = STATUS_SUCCESS;
        } else if (matched.isEmpty()) {
            extractStatus = STATUS_FAILED;
        } else {
            extractStatus = STATUS_PARTIAL;
        }
        String message = "命中 " + matched.size() + " 项，异常 " + errors.size() + " 项";

        cadFile.setExtractStatus(extractStatus);
        cadFile.setExtractMessage(message);
        cadFile.setExtractedJson(toJson(matched));
        cadFileMapper.updateById(cadFile);

        CadExtractResult result = new CadExtractResult();
        result.setCadFileId(cadFileId);
        result.setExtractStatus(extractStatus);
        result.setMatched(matched);
        result.setErrors(errors);
        result.setMessage(message);
        return result;
    }

    public List<CadExtractError> listErrors(Long cadFileId) {
        requireCadFile(cadFileId);
        return cadExtractErrorMapper.selectList(Wrappers.<CadExtractError>lambdaQuery()
                .eq(CadExtractError::getCadFileId, cadFileId)
                .orderByAsc(CadExtractError::getId));
    }

    public PageResult<CadAttrMapping> pageMappings(CadAttrMappingQuery query) {
        Page<CadAttrMapping> page = query.toPage();
        cadAttrMappingMapper.selectPage(page, Wrappers.<CadAttrMapping>lambdaQuery()
                .eq(StringUtils.hasText(query.getTargetEntity()), CadAttrMapping::getTargetEntity, query.getTargetEntity())
                .eq(query.getStatus() != null, CadAttrMapping::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(CadAttrMapping::getCadAttrName, query.getKeyword()).or()
                        .like(CadAttrMapping::getPlmFieldName, query.getKeyword()))
                .orderByAsc(CadAttrMapping::getSortNo)
                .orderByAsc(CadAttrMapping::getId));
        return PageResult.of(page);
    }

    public Long createMapping(CadAttrMappingSaveRequest request) {
        String targetEntity = resolveTargetEntity(request.getTargetEntity());
        if (countMapping(request.getCadAttrName(), targetEntity, -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "同一目标实体下该 CAD 属性已映射: " + request.getCadAttrName());
        }
        CadAttrMapping mapping = new CadAttrMapping();
        applyMappingRequest(mapping, request);
        mapping.setTargetEntity(targetEntity);
        if (mapping.getStatus() == null) {
            mapping.setStatus(1);
        }
        cadAttrMappingMapper.insert(mapping);
        return mapping.getId();
    }

    public void updateMapping(Long mappingId, CadAttrMappingSaveRequest request) {
        CadAttrMapping mapping = requireMapping(mappingId);
        String targetEntity = resolveTargetEntity(request.getTargetEntity());
        if (countMapping(request.getCadAttrName(), targetEntity, mappingId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "同一目标实体下该 CAD 属性已映射: " + request.getCadAttrName());
        }
        applyMappingRequest(mapping, request);
        mapping.setTargetEntity(targetEntity);
        cadAttrMappingMapper.updateById(mapping);
    }

    public void deleteMapping(Long mappingId) {
        requireMapping(mappingId);
        cadAttrMappingMapper.deleteById(mappingId);
    }

    private List<CadAttrMapping> listEnabledDocumentMappings() {
        return cadAttrMappingMapper.selectList(Wrappers.<CadAttrMapping>lambdaQuery()
                .eq(CadAttrMapping::getTargetEntity, TARGET_ENTITY_DOCUMENT)
                .eq(CadAttrMapping::getStatus, 1)
                .orderByAsc(CadAttrMapping::getSortNo)
                .orderByAsc(CadAttrMapping::getId));
    }

    private Map<String, String> collectAttrValues(CadExtractRequest request) {
        Map<String, String> attrValues = new HashMap<>();
        List<CadAttrValue> attributes = request == null ? null : request.getAttributes();
        if (attributes != null) {
            for (CadAttrValue attrValue : attributes) {
                if (attrValue != null && StringUtils.hasText(attrValue.getName())) {
                    attrValues.put(attrValue.getName(), attrValue.getValue());
                }
            }
        }
        return attrValues;
    }

    private void saveError(Long cadFileId, String attrName, String errorType, String errorMessage, String rawValue) {
        CadExtractError error = new CadExtractError();
        error.setCadFileId(cadFileId);
        error.setAttrName(attrName);
        error.setErrorType(errorType);
        error.setErrorMessage(errorMessage);
        error.setRawValue(rawValue);
        cadExtractErrorMapper.insert(error);
    }

    private String toJson(Map<String, String> matched) {
        try {
            return objectMapper.writeValueAsString(matched);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ResultCode.ERROR, "生成提取结果失败: " + e.getMessage());
        }
    }

    /**
     * 自动生成 CAD 文件编号，格式 CAD-{4 位序号}，冲突时继续递增直到不重复。
     */
    private String generateCadNo() {
        long count = cadFileMapper.selectCount(null);
        int seq = (int) count + 1;
        while (true) {
            String candidate = String.format("CAD-%04d", seq);
            long exists = cadFileMapper.selectCount(Wrappers.<CadFile>lambdaQuery()
                    .eq(CadFile::getCadNo, candidate));
            if (exists == 0) {
                return candidate;
            }
            seq++;
        }
    }

    private void applyRequest(CadFile cadFile, CadFileSaveRequest request) {
        if (StringUtils.hasText(request.getCadNo())) {
            cadFile.setCadNo(request.getCadNo());
        }
        cadFile.setFileName(request.getFileName());
        cadFile.setFilePath(request.getFilePath());
        cadFile.setFileFormat(request.getFileFormat());
        cadFile.setCadSoftware(request.getCadSoftware());
        cadFile.setSoftwareVersion(request.getSoftwareVersion());
        cadFile.setCompatRange(request.getCompatRange());
        cadFile.setFileSize(request.getFileSize());
        cadFile.setFileHash(request.getFileHash());
        cadFile.setDocumentId(request.getDocumentId());
        cadFile.setDocNo(request.getDocNo());
        cadFile.setProductCode(request.getProductCode());
        cadFile.setMaterialCode(request.getMaterialCode());
        cadFile.setRemark(request.getRemark());
    }

    private void applyMappingRequest(CadAttrMapping mapping, CadAttrMappingSaveRequest request) {
        mapping.setCadAttrName(request.getCadAttrName());
        mapping.setCadAttrLabel(request.getCadAttrLabel());
        mapping.setPlmFieldName(request.getPlmFieldName());
        mapping.setPlmFieldLabel(request.getPlmFieldLabel());
        mapping.setRequiredFlag(request.getRequiredFlag() == null ? 0 : request.getRequiredFlag());
        mapping.setTransformRule(request.getTransformRule());
        mapping.setDefaultValue(request.getDefaultValue());
        mapping.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        if (request.getStatus() != null) {
            mapping.setStatus(request.getStatus());
        }
        mapping.setRemark(request.getRemark());
    }

    private String resolveTargetEntity(String targetEntity) {
        return StringUtils.hasText(targetEntity) ? targetEntity : TARGET_ENTITY_DOCUMENT;
    }

    private long countMapping(String cadAttrName, String targetEntity, Long excludeId) {
        return cadAttrMappingMapper.selectCount(Wrappers.<CadAttrMapping>lambdaQuery()
                .eq(CadAttrMapping::getCadAttrName, cadAttrName)
                .eq(CadAttrMapping::getTargetEntity, targetEntity)
                .ne(excludeId != null && excludeId > 0, CadAttrMapping::getId, excludeId));
    }

    private CadFile requireCadFile(Long cadFileId) {
        CadFile cadFile = cadFileMapper.selectById(cadFileId);
        if (cadFile == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "CAD 文件不存在: " + cadFileId);
        }
        return cadFile;
    }

    private CadAttrMapping requireMapping(Long mappingId) {
        CadAttrMapping mapping = cadAttrMappingMapper.selectById(mappingId);
        if (mapping == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "CAD 属性映射不存在: " + mappingId);
        }
        return mapping;
    }
}
