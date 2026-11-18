package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.FormDefinitionQuery;
import com.huaweicloud.plm.system.dto.FormDefinitionSaveRequest;
import com.huaweicloud.plm.system.dto.FormDetailResponse;
import com.huaweicloud.plm.system.dto.FormFieldSaveRequest;
import com.huaweicloud.plm.system.entity.OaFormDefinition;
import com.huaweicloud.plm.system.entity.OaFormField;
import com.huaweicloud.plm.system.mapper.OaFormDefinitionMapper;
import com.huaweicloud.plm.system.mapper.OaFormFieldMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 低代码表单定义服务：表单与字段均为可配置数据，管理员可通过界面维护，不写死在代码里。
 */
@Service
@RequiredArgsConstructor
public class FormDefinitionService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";

    private final OaFormDefinitionMapper formMapper;
    private final OaFormFieldMapper formFieldMapper;

    public PageResult<OaFormDefinition> page(FormDefinitionQuery query) {
        Page<OaFormDefinition> page = query.toPage();
        formMapper.selectPage(page, Wrappers.<OaFormDefinition>lambdaQuery()
                .eq(StringUtils.hasText(query.getCategory()), OaFormDefinition::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getStatus()), OaFormDefinition::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaFormDefinition::getFormCode, query.getKeyword()).or()
                        .like(OaFormDefinition::getFormName, query.getKeyword()))
                .orderByDesc(OaFormDefinition::getUpdatedAt));
        return PageResult.of(page);
    }

    /** 供流程设计器与发起页选择表单，仅返回已发布表单。 */
    public List<OaFormDefinition> listPublished() {
        return formMapper.selectList(Wrappers.<OaFormDefinition>lambdaQuery()
                .eq(OaFormDefinition::getStatus, STATUS_PUBLISHED)
                .orderByAsc(OaFormDefinition::getFormName));
    }

    public FormDetailResponse getDetail(Long formId) {
        OaFormDefinition form = requireForm(formId);
        FormDetailResponse response = new FormDetailResponse();
        response.setForm(form);
        response.setFields(listFields(formId));
        return response;
    }

    public List<OaFormField> listFields(Long formId) {
        return formFieldMapper.selectList(Wrappers.<OaFormField>lambdaQuery()
                .eq(OaFormField::getFormId, formId)
                .orderByAsc(OaFormField::getSortNo));
    }

    @Transactional
    public Long create(FormDefinitionSaveRequest request) {
        if (formMapper.countByCode(request.getFormCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "表单编码已存在: " + request.getFormCode());
        }
        OaFormDefinition form = new OaFormDefinition();
        applyRequest(form, request, true);
        formMapper.insert(form);
        saveFields(form.getId(), request.getFields());
        return form.getId();
    }

    @Transactional
    public void update(Long formId, FormDefinitionSaveRequest request) {
        OaFormDefinition form = requireForm(formId);
        if (formMapper.countByCode(request.getFormCode(), formId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "表单编码已存在: " + request.getFormCode());
        }
        applyRequest(form, request, false);
        formMapper.updateById(form);
        if (request.getFields() != null) {
            formFieldMapper.delete(Wrappers.<OaFormField>lambdaQuery().eq(OaFormField::getFormId, formId));
            saveFields(formId, request.getFields());
        }
    }

    @Transactional
    public void delete(Long formId) {
        requireForm(formId);
        formMapper.deleteById(formId);
        formFieldMapper.delete(Wrappers.<OaFormField>lambdaQuery().eq(OaFormField::getFormId, formId));
    }

    /** 发布表单：发布后方可用于流程发起，同时递增版本号。 */
    public void publish(Long formId) {
        OaFormDefinition form = requireForm(formId);
        if (!STATUS_PUBLISHED.equals(form.getStatus())) {
            form.setVersionNo((form.getVersionNo() == null ? 1 : form.getVersionNo()) + 1);
        }
        form.setStatus(STATUS_PUBLISHED);
        formMapper.updateById(form);
    }

    public OaFormDefinition requireForm(Long formId) {
        OaFormDefinition form = formMapper.selectById(formId);
        if (form == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "表单不存在: " + formId);
        }
        return form;
    }

    private void saveFields(Long formId, List<FormFieldSaveRequest> fields) {
        if (CollectionUtils.isEmpty(fields)) {
            return;
        }
        int index = 0;
        for (FormFieldSaveRequest fieldRequest : fields) {
            index++;
            OaFormField field = new OaFormField();
            field.setFormId(formId);
            field.setFieldCode(fieldRequest.getFieldCode());
            field.setFieldName(fieldRequest.getFieldName());
            field.setFieldType(StringUtils.hasText(fieldRequest.getFieldType())
                    ? fieldRequest.getFieldType() : "TEXT");
            field.setRequiredFlag(fieldRequest.getRequiredFlag() == null ? 0 : fieldRequest.getRequiredFlag());
            field.setDataSource(StringUtils.hasText(fieldRequest.getDataSource())
                    ? fieldRequest.getDataSource() : "MANUAL");
            field.setSourceValue(fieldRequest.getSourceValue());
            field.setOptionsJson(fieldRequest.getOptionsJson());
            field.setRulesJson(fieldRequest.getRulesJson());
            field.setPlaceholder(fieldRequest.getPlaceholder());
            field.setSortNo(fieldRequest.getSortNo() == null ? index : fieldRequest.getSortNo());
            field.setRemark(fieldRequest.getRemark());
            formFieldMapper.insert(field);
        }
    }

    private void applyRequest(OaFormDefinition form, FormDefinitionSaveRequest request, boolean creating) {
        form.setFormCode(request.getFormCode());
        form.setFormName(request.getFormName());
        form.setCategory(request.getCategory());
        form.setSchemaJson(request.getSchemaJson());
        form.setDescription(request.getDescription());
        form.setRemark(request.getRemark());
        if (creating) {
            form.setVersionNo(1);
            form.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
        } else if (StringUtils.hasText(request.getStatus())) {
            form.setStatus(request.getStatus());
        }
    }
}
