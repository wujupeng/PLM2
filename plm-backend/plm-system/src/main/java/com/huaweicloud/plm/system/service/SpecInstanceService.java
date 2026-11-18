package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.SpecInstanceDetailResponse;
import com.huaweicloud.plm.system.dto.SpecInstanceQuery;
import com.huaweicloud.plm.system.dto.SpecInstanceSaveRequest;
import com.huaweicloud.plm.system.dto.SpecInstanceValueSaveRequest;
import com.huaweicloud.plm.system.entity.SpecInstance;
import com.huaweicloud.plm.system.entity.SpecInstanceValue;
import com.huaweicloud.plm.system.entity.SpecTemplateField;
import com.huaweicloud.plm.system.mapper.SpecInstanceMapper;
import com.huaweicloud.plm.system.mapper.SpecInstanceValueMapper;
import com.huaweicloud.plm.system.mapper.SpecTemplateFieldMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 产品技术规格实例与电气性能指标服务（DEV-043）。
 */
@Service
@RequiredArgsConstructor
public class SpecInstanceService {

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_RELEASED = "released";
    private static final String DEFAULT_VERSION = "V1";
    private static final String DATA_TYPE_NUMBER = "number";
    private static final String DATA_TYPE_RANGE = "range";
    private static final String CONFIG_RELEASE_POLICY = "spec.instance.release.policy";
    private static final String DEFAULT_RELEASE_POLICY = "required_fields_complete";
    private static final String POLICY_MANUAL = "manual";
    private static final String CONFIG_ELECTRICAL_REQUIRED_FIELDS = "spec.electrical.required_fields";
    private static final String DEFAULT_ELECTRICAL_REQUIRED_FIELDS =
            "pullInTime,releaseTime,contactResistance,dielectricStrength";

    private final SpecInstanceMapper instanceMapper;
    private final SpecInstanceValueMapper valueMapper;
    private final SpecTemplateFieldMapper templateFieldMapper;
    private final ConfigService configService;

    public PageResult<SpecInstance> page(SpecInstanceQuery query) {
        Page<SpecInstance> page = query.toPage();
        instanceMapper.selectPage(page, Wrappers.<SpecInstance>lambdaQuery()
                .eq(StringUtils.hasText(query.getInstanceCode()), SpecInstance::getInstanceCode, query.getInstanceCode())
                .eq(StringUtils.hasText(query.getProductCode()), SpecInstance::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getTemplateCode()), SpecInstance::getTemplateCode, query.getTemplateCode())
                .eq(StringUtils.hasText(query.getStatus()), SpecInstance::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SpecInstance::getInstanceCode, query.getKeyword()).or()
                        .like(SpecInstance::getProductName, query.getKeyword()))
                .orderByDesc(SpecInstance::getCreatedAt));
        return PageResult.of(page);
    }

    public SpecInstanceDetailResponse detail(Long instanceId) {
        SpecInstance instance = requireInstance(instanceId);
        SpecInstanceDetailResponse response = new SpecInstanceDetailResponse();
        response.setInstance(instance);
        response.setValues(listValues(instanceId));
        return response;
    }

    public List<SpecInstance> byProduct(String productCode) {
        return instanceMapper.selectList(Wrappers.<SpecInstance>lambdaQuery()
                .eq(SpecInstance::getProductCode, productCode)
                .eq(SpecInstance::getStatus, STATUS_RELEASED)
                .orderByDesc(SpecInstance::getCreatedAt));
    }

    public List<SpecInstanceValue> values(Long instanceId) {
        requireInstance(instanceId);
        return listValues(instanceId);
    }

    @Transactional
    public Long create(SpecInstanceSaveRequest request) {
        String versionNo = normalizeVersion(request.getVersionNo());
        ensureCodeUnique(request.getInstanceCode(), versionNo, -1L);
        SpecInstance instance = new SpecInstance();
        applyRequest(instance, request);
        instanceMapper.insert(instance);
        replaceValues(instance, request.getValues());
        return instance.getId();
    }

    @Transactional
    public void update(Long instanceId, SpecInstanceSaveRequest request) {
        SpecInstance instance = requireInstance(instanceId);
        if (STATUS_RELEASED.equals(instance.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的规格实例不允许修改");
        }
        String versionNo = normalizeVersion(request.getVersionNo());
        if (instanceMapper.countByCode(request.getInstanceCode(), versionNo, instanceId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "实例编码与版本已存在: " + request.getInstanceCode() + "/" + versionNo);
        }
        applyRequest(instance, request);
        instanceMapper.updateById(instance);
        replaceValues(instance, request.getValues());
    }

    @Transactional
    public void saveValues(Long instanceId, List<SpecInstanceValueSaveRequest> values) {
        SpecInstance instance = requireInstance(instanceId);
        if (STATUS_RELEASED.equals(instance.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的规格实例不允许修改取值");
        }
        replaceValues(instance, values);
    }

    @Transactional
    public void delete(Long instanceId) {
        SpecInstance instance = requireInstance(instanceId);
        if (STATUS_RELEASED.equals(instance.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的规格实例不允许删除");
        }
        valueMapper.delete(Wrappers.<SpecInstanceValue>lambdaQuery()
                .eq(SpecInstanceValue::getInstanceId, instanceId));
        instanceMapper.deleteById(instanceId);
    }

    @Transactional
    public void release(Long instanceId) {
        SpecInstance instance = requireInstance(instanceId);
        validateRelease(instance);
        instance.setStatus(STATUS_RELEASED);
        instanceMapper.updateById(instance);
    }

    /**
     * 整体替换取值列表：先按模板字段生成取值行，再把入参按 fieldCode 合并覆盖，最后逐行做取值判定。
     */
    private void replaceValues(SpecInstance instance, List<SpecInstanceValueSaveRequest> values) {
        valueMapper.delete(Wrappers.<SpecInstanceValue>lambdaQuery()
                .eq(SpecInstanceValue::getInstanceId, instance.getId()));
        Map<String, SpecTemplateField> fieldMap = loadTemplateFieldMap(instance.getTemplateId());

        Map<String, SpecInstanceValue> merged = new LinkedHashMap<>();
        for (SpecTemplateField field : fieldMap.values()) {
            merged.put(field.getFieldCode(), buildValueFromField(instance.getId(), field));
        }
        if (values != null) {
            for (SpecInstanceValueSaveRequest request : values) {
                SpecInstanceValue value = merged.get(request.getFieldCode());
                if (value == null) {
                    value = new SpecInstanceValue();
                    value.setInstanceId(instance.getId());
                    value.setFieldCode(request.getFieldCode());
                    applyValueRequest(value, request);
                    merged.put(request.getFieldCode(), value);
                } else {
                    applyValueRequest(value, request);
                }
            }
        }
        for (SpecInstanceValue value : merged.values()) {
            judgeValue(value, fieldMap.get(value.getFieldCode()));
            valueMapper.insert(value);
        }
    }

    /**
     * 按数据类型判定取值：number/range 写入 value_number 并计算 pass_flag；其余类型保留 value_text。
     */
    private void judgeValue(SpecInstanceValue value, SpecTemplateField field) {
        String dataType = field == null ? null : field.getDataType();
        if (DATA_TYPE_NUMBER.equals(dataType) || DATA_TYPE_RANGE.equals(dataType)) {
            BigDecimal number = value.getValueNumber() != null
                    ? value.getValueNumber() : parseNumber(value.getValueText());
            value.setValueNumber(number);
            if (number == null) {
                value.setPassFlag(null);
            } else {
                value.setPassFlag(inRange(number, value.getMinValue(), value.getMaxValue()) ? 1 : 0);
            }
        }
    }

    private void validateRelease(SpecInstance instance) {
        String policy = resolveConfig(CONFIG_RELEASE_POLICY, DEFAULT_RELEASE_POLICY);
        if (POLICY_MANUAL.equalsIgnoreCase(policy)) {
            return;
        }
        Map<String, SpecInstanceValue> valueMap = new HashMap<>();
        for (SpecInstanceValue value : listValues(instance.getId())) {
            valueMap.put(value.getFieldCode(), value);
        }
        List<String> missing = new ArrayList<>();
        if (instance.getTemplateId() != null) {
            for (SpecTemplateField field : listTemplateFields(instance.getTemplateId())) {
                if (field.getRequiredFlag() != null && field.getRequiredFlag() == 1
                        && !hasValue(valueMap.get(field.getFieldCode()))) {
                    missing.add(field.getFieldName());
                }
            }
        }
        String requiredFields = resolveConfig(CONFIG_ELECTRICAL_REQUIRED_FIELDS, DEFAULT_ELECTRICAL_REQUIRED_FIELDS);
        for (String code : splitCodes(requiredFields)) {
            if (!hasValue(valueMap.get(code))) {
                missing.add(code);
            }
        }
        if (!missing.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "以下必填字段缺失取值: " + String.join(", ", missing));
        }
    }

    private boolean hasValue(SpecInstanceValue value) {
        if (value == null) {
            return false;
        }
        return value.getValueNumber() != null || StringUtils.hasText(value.getValueText());
    }

    private boolean inRange(BigDecimal number, BigDecimal min, BigDecimal max) {
        if (min != null && number.compareTo(min) < 0) {
            return false;
        }
        if (max != null && number.compareTo(max) > 0) {
            return false;
        }
        return true;
    }

    private BigDecimal parseNumber(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        try {
            return new BigDecimal(text.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private List<String> splitCodes(String text) {
        if (!StringUtils.hasText(text)) {
            return Collections.emptyList();
        }
        List<String> codes = new ArrayList<>();
        for (String part : text.split(",")) {
            String code = part.trim();
            if (!code.isEmpty()) {
                codes.add(code);
            }
        }
        return codes;
    }

    private String resolveConfig(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    private SpecInstanceValue buildValueFromField(Long instanceId, SpecTemplateField field) {
        SpecInstanceValue value = new SpecInstanceValue();
        value.setInstanceId(instanceId);
        value.setFieldCode(field.getFieldCode());
        value.setFieldName(field.getFieldName());
        value.setFieldCategory(field.getFieldCategory());
        value.setUnit(field.getUnit());
        value.setMinValue(field.getMinValue());
        value.setMaxValue(field.getMaxValue());
        value.setTargetValue(field.getTargetValue());
        value.setInspectionMethod(field.getInspectionMethod());
        value.setSortNo(field.getSortNo());
        return value;
    }

    private void applyValueRequest(SpecInstanceValue value, SpecInstanceValueSaveRequest request) {
        if (StringUtils.hasText(request.getFieldName())) {
            value.setFieldName(request.getFieldName());
        }
        if (StringUtils.hasText(request.getFieldCategory())) {
            value.setFieldCategory(request.getFieldCategory());
        }
        if (StringUtils.hasText(request.getUnit())) {
            value.setUnit(request.getUnit());
        }
        if (request.getMinValue() != null) {
            value.setMinValue(request.getMinValue());
        }
        if (request.getMaxValue() != null) {
            value.setMaxValue(request.getMaxValue());
        }
        if (StringUtils.hasText(request.getTargetValue())) {
            value.setTargetValue(request.getTargetValue());
        }
        if (StringUtils.hasText(request.getInspectionMethod())) {
            value.setInspectionMethod(request.getInspectionMethod());
        }
        if (request.getSortNo() != null) {
            value.setSortNo(request.getSortNo());
        }
        value.setValueText(request.getValueText());
        value.setValueNumber(request.getValueNumber());
        value.setPassFlag(request.getPassFlag());
        value.setRemark(request.getRemark());
    }

    private Map<String, SpecTemplateField> loadTemplateFieldMap(Long templateId) {
        Map<String, SpecTemplateField> fieldMap = new LinkedHashMap<>();
        if (templateId == null) {
            return fieldMap;
        }
        for (SpecTemplateField field : listTemplateFields(templateId)) {
            fieldMap.put(field.getFieldCode(), field);
        }
        return fieldMap;
    }

    private List<SpecTemplateField> listTemplateFields(Long templateId) {
        return templateFieldMapper.selectList(Wrappers.<SpecTemplateField>lambdaQuery()
                .eq(SpecTemplateField::getTemplateId, templateId)
                .orderByAsc(SpecTemplateField::getSortNo)
                .orderByAsc(SpecTemplateField::getId));
    }

    private List<SpecInstanceValue> listValues(Long instanceId) {
        return valueMapper.selectList(Wrappers.<SpecInstanceValue>lambdaQuery()
                .eq(SpecInstanceValue::getInstanceId, instanceId)
                .orderByAsc(SpecInstanceValue::getSortNo)
                .orderByAsc(SpecInstanceValue::getId));
    }

    private void applyRequest(SpecInstance instance, SpecInstanceSaveRequest request) {
        instance.setInstanceCode(request.getInstanceCode());
        instance.setTemplateId(request.getTemplateId());
        instance.setTemplateCode(request.getTemplateCode());
        instance.setProductCode(request.getProductCode());
        instance.setProductName(request.getProductName());
        instance.setVersionNo(normalizeVersion(request.getVersionNo()));
        instance.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus()
                : (StringUtils.hasText(instance.getStatus()) ? instance.getStatus() : STATUS_DRAFT));
        instance.setEffectiveDate(request.getEffectiveDate());
        instance.setRemark(request.getRemark());
    }

    private void ensureCodeUnique(String instanceCode, String versionNo, Long excludeId) {
        if (instanceMapper.countByCode(instanceCode, versionNo, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "实例编码与版本已存在: " + instanceCode + "/" + versionNo);
        }
    }

    private String normalizeVersion(String versionNo) {
        return StringUtils.hasText(versionNo) ? versionNo : DEFAULT_VERSION;
    }

    private SpecInstance requireInstance(Long instanceId) {
        SpecInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "规格实例不存在: " + instanceId);
        }
        return instance;
    }
}
