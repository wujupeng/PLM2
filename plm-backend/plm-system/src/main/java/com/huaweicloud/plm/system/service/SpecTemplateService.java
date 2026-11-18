package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.SpecTemplateDetailResponse;
import com.huaweicloud.plm.system.dto.SpecTemplateFieldSaveRequest;
import com.huaweicloud.plm.system.dto.SpecTemplateQuery;
import com.huaweicloud.plm.system.dto.SpecTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.SpecInstance;
import com.huaweicloud.plm.system.entity.SpecTemplate;
import com.huaweicloud.plm.system.entity.SpecTemplateField;
import com.huaweicloud.plm.system.mapper.SpecInstanceMapper;
import com.huaweicloud.plm.system.mapper.SpecTemplateFieldMapper;
import com.huaweicloud.plm.system.mapper.SpecTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 产品技术规格模板服务（DEV-042）。
 */
@Service
@RequiredArgsConstructor
public class SpecTemplateService {

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_RELEASED = "released";
    private static final String DEFAULT_VERSION = "V1";
    private static final String DEFAULT_DATA_TYPE = "number";

    private final SpecTemplateMapper templateMapper;
    private final SpecTemplateFieldMapper fieldMapper;
    private final SpecInstanceMapper instanceMapper;

    public PageResult<SpecTemplate> page(SpecTemplateQuery query) {
        Page<SpecTemplate> page = query.toPage();
        templateMapper.selectPage(page, Wrappers.<SpecTemplate>lambdaQuery()
                .eq(StringUtils.hasText(query.getTemplateCode()), SpecTemplate::getTemplateCode, query.getTemplateCode())
                .eq(StringUtils.hasText(query.getSpecCategory()), SpecTemplate::getSpecCategory, query.getSpecCategory())
                .eq(StringUtils.hasText(query.getProductSeries()), SpecTemplate::getProductSeries, query.getProductSeries())
                .eq(StringUtils.hasText(query.getStatus()), SpecTemplate::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SpecTemplate::getTemplateCode, query.getKeyword()).or()
                        .like(SpecTemplate::getTemplateName, query.getKeyword()))
                .orderByDesc(SpecTemplate::getCreatedAt));
        return PageResult.of(page);
    }

    public SpecTemplateDetailResponse detail(Long templateId) {
        SpecTemplate template = requireTemplate(templateId);
        SpecTemplateDetailResponse response = new SpecTemplateDetailResponse();
        response.setTemplate(template);
        response.setFields(listFields(templateId));
        return response;
    }

    public List<SpecTemplate> options() {
        return templateMapper.selectList(Wrappers.<SpecTemplate>lambdaQuery()
                .orderByAsc(SpecTemplate::getTemplateCode)
                .orderByAsc(SpecTemplate::getVersionNo));
    }

    @Transactional
    public Long create(SpecTemplateSaveRequest request) {
        String versionNo = normalizeVersion(request.getVersionNo());
        ensureCodeUnique(request.getTemplateCode(), versionNo, -1L);
        SpecTemplate template = new SpecTemplate();
        applyRequest(template, request);
        templateMapper.insert(template);
        replaceFields(template.getId(), request.getFields());
        return template.getId();
    }

    @Transactional
    public void update(Long templateId, SpecTemplateSaveRequest request) {
        SpecTemplate template = requireTemplate(templateId);
        if (STATUS_RELEASED.equals(template.getStatus()) && referencedByInstance(templateId)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "模板已发布且存在实例引用，不可修改");
        }
        String versionNo = normalizeVersion(request.getVersionNo());
        if (templateMapper.countByCode(request.getTemplateCode(), versionNo, templateId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "模板编码与版本已存在: " + request.getTemplateCode() + "/" + versionNo);
        }
        applyRequest(template, request);
        templateMapper.updateById(template);
        replaceFields(templateId, request.getFields());
    }

    @Transactional
    public void delete(Long templateId) {
        SpecTemplate template = requireTemplate(templateId);
        if (STATUS_RELEASED.equals(template.getStatus()) && referencedByInstance(templateId)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "模板已发布且存在实例引用，不可删除");
        }
        fieldMapper.delete(Wrappers.<SpecTemplateField>lambdaQuery()
                .eq(SpecTemplateField::getTemplateId, templateId));
        templateMapper.deleteById(templateId);
    }

    @Transactional
    public void release(Long templateId) {
        SpecTemplate template = requireTemplate(templateId);
        if (countFields(templateId) < 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "模板至少需要一个字段明细才能发布");
        }
        template.setStatus(STATUS_RELEASED);
        templateMapper.updateById(template);
    }

    private void replaceFields(Long templateId, List<SpecTemplateFieldSaveRequest> fields) {
        fieldMapper.delete(Wrappers.<SpecTemplateField>lambdaQuery()
                .eq(SpecTemplateField::getTemplateId, templateId));
        if (fields == null || fields.isEmpty()) {
            return;
        }
        for (SpecTemplateFieldSaveRequest request : fields) {
            SpecTemplateField field = new SpecTemplateField();
            field.setTemplateId(templateId);
            field.setFieldCode(request.getFieldCode());
            field.setFieldName(request.getFieldName());
            field.setFieldCategory(request.getFieldCategory());
            field.setDataType(StringUtils.hasText(request.getDataType())
                    ? request.getDataType() : DEFAULT_DATA_TYPE);
            field.setUnit(request.getUnit());
            field.setMinValue(request.getMinValue());
            field.setMaxValue(request.getMaxValue());
            field.setTargetValue(request.getTargetValue());
            field.setRequiredFlag(request.getRequiredFlag() == null ? 0 : request.getRequiredFlag());
            field.setDefaultValue(request.getDefaultValue());
            field.setOptionsText(request.getOptionsText());
            field.setInspectionMethod(request.getInspectionMethod());
            field.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
            field.setStatus(request.getStatus() == null ? 1 : request.getStatus());
            field.setRemark(request.getRemark());
            fieldMapper.insert(field);
        }
    }

    private void applyRequest(SpecTemplate template, SpecTemplateSaveRequest request) {
        template.setTemplateCode(request.getTemplateCode());
        template.setTemplateName(request.getTemplateName());
        template.setProductSeries(request.getProductSeries());
        template.setProductCode(request.getProductCode());
        template.setSpecCategory(request.getSpecCategory());
        template.setVersionNo(normalizeVersion(request.getVersionNo()));
        template.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus()
                : (StringUtils.hasText(template.getStatus()) ? template.getStatus() : STATUS_DRAFT));
        template.setDescription(request.getDescription());
        template.setRemark(request.getRemark());
    }

    private List<SpecTemplateField> listFields(Long templateId) {
        return fieldMapper.selectList(Wrappers.<SpecTemplateField>lambdaQuery()
                .eq(SpecTemplateField::getTemplateId, templateId)
                .orderByAsc(SpecTemplateField::getSortNo)
                .orderByAsc(SpecTemplateField::getId));
    }

    private long countFields(Long templateId) {
        return fieldMapper.selectCount(Wrappers.<SpecTemplateField>lambdaQuery()
                .eq(SpecTemplateField::getTemplateId, templateId));
    }

    private boolean referencedByInstance(Long templateId) {
        return instanceMapper.selectCount(Wrappers.<SpecInstance>lambdaQuery()
                .eq(SpecInstance::getTemplateId, templateId)) > 0;
    }

    private void ensureCodeUnique(String templateCode, String versionNo, Long excludeId) {
        if (templateMapper.countByCode(templateCode, versionNo, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "模板编码与版本已存在: " + templateCode + "/" + versionNo);
        }
    }

    private String normalizeVersion(String versionNo) {
        return StringUtils.hasText(versionNo) ? versionNo : DEFAULT_VERSION;
    }

    private SpecTemplate requireTemplate(Long templateId) {
        SpecTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "规格模板不存在: " + templateId);
        }
        return template;
    }
}
