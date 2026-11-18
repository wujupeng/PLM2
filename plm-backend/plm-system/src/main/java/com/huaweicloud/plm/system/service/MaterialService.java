package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MaterialQuery;
import com.huaweicloud.plm.system.dto.MaterialSaveRequest;
import com.huaweicloud.plm.system.dto.MaterialSubstituteRequest;
import com.huaweicloud.plm.system.entity.MdChangeLog;
import com.huaweicloud.plm.system.entity.MdMaterial;
import com.huaweicloud.plm.system.entity.MdMaterialCategory;
import com.huaweicloud.plm.system.entity.MdMaterialSubstitute;
import com.huaweicloud.plm.system.mapper.MdChangeLogMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialCategoryMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialSubstituteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 物料主档服务（DEV-018 / DEV-019 / DEV-021 / DEV-022 / DEV-023）。
 */
@Service
@RequiredArgsConstructor
public class MaterialService {

    public static final String ENTITY_TYPE_MATERIAL = "MATERIAL";
    public static final String CHANGE_UPDATE = "UPDATE";
    public static final String CHANGE_REVISION = "REVISION";
    public static final String CHANGE_LIFECYCLE = "LIFECYCLE";

    private static final String CONFIG_REQUIRED_FIELDS_DEFAULT = "material.required_fields.default";
    private static final String CONFIG_SUPPLIER_REQUIRED_WHEN_BUY = "material.supplier.required_when_buy";
    private static final String CONFIG_RELEASED_EDIT_POLICY = "material.released.edit.policy";
    private static final String CONFIG_LIFECYCLE_STATES = "material.lifecycle.states";
    private static final String STATUS_RELEASED = "released";
    private static final String SOURCE_TYPE_BUY = "buy";

    private final MdMaterialMapper materialMapper;
    private final MdMaterialCategoryMapper categoryMapper;
    private final MdMaterialSubstituteMapper substituteMapper;
    private final MdChangeLogMapper changeLogMapper;
    private final ConfigService configService;

    /** 字段新旧值对，用于变更留痕比较。 */
    private record ChangePair(String field, Object oldValue, Object newValue) {
    }

    public PageResult<MdMaterial> page(MaterialQuery query) {
        Page<MdMaterial> page = query.toPage();
        materialMapper.selectPage(page, Wrappers.<MdMaterial>lambdaQuery()
                .eq(StringUtils.hasText(query.getCategoryCode()), MdMaterial::getCategoryCode, query.getCategoryCode())
                .eq(StringUtils.hasText(query.getLifecycleStatus()), MdMaterial::getLifecycleStatus, query.getLifecycleStatus())
                .eq(StringUtils.hasText(query.getSourceType()), MdMaterial::getSourceType, query.getSourceType())
                .eq(StringUtils.hasText(query.getMaterialType()), MdMaterial::getMaterialType, query.getMaterialType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MdMaterial::getMaterialCode, query.getKeyword()).or()
                        .like(MdMaterial::getMaterialName, query.getKeyword()))
                .orderByDesc(MdMaterial::getCreatedAt));
        return PageResult.of(page);
    }

    public MdMaterial getById(Long materialId) {
        return requireMaterial(materialId);
    }

    public List<MdMaterial> options() {
        return materialMapper.selectList(Wrappers.<MdMaterial>lambdaQuery()
                .orderByAsc(MdMaterial::getMaterialCode));
    }

    @Transactional
    public Long create(MaterialSaveRequest request) {
        if (materialMapper.countByCode(request.getMaterialCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "物料编码已存在: " + request.getMaterialCode());
        }
        String resolvedCategoryCode = resolveCategoryCode(request.getCategoryId(), request.getCategoryCode());
        validateRequiredFields(request, resolvedCategoryCode);
        validateSupplierWhenBuy(request);

        MdMaterial material = new MdMaterial();
        applyRequest(material, request, resolvedCategoryCode);
        if (!StringUtils.hasText(material.getLifecycleStatus())) {
            material.setLifecycleStatus("draft");
        }
        if (!StringUtils.hasText(material.getVersionNo())) {
            material.setVersionNo("V1");
        }
        materialMapper.insert(material);
        return material.getId();
    }

    @Transactional
    public void update(Long materialId, MaterialSaveRequest request) {
        MdMaterial material = requireMaterial(materialId);
        if (!material.getMaterialCode().equals(request.getMaterialCode())
                && materialMapper.countByCode(request.getMaterialCode(), materialId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "物料编码已存在: " + request.getMaterialCode());
        }
        String resolvedCategoryCode = resolveCategoryCode(request.getCategoryId(), request.getCategoryCode());
        validateRequiredFields(request, resolvedCategoryCode);
        validateSupplierWhenBuy(request);

        String oldLifecycleStatus = material.getLifecycleStatus();
        String oldVersionNo = material.getVersionNo();

        List<ChangePair> pairs = new ArrayList<>();
        pairs.add(new ChangePair("materialCode", material.getMaterialCode(), request.getMaterialCode()));
        pairs.add(new ChangePair("materialName", material.getMaterialName(), request.getMaterialName()));
        pairs.add(new ChangePair("categoryId", material.getCategoryId(), request.getCategoryId()));
        pairs.add(new ChangePair("categoryCode", material.getCategoryCode(), resolvedCategoryCode));
        pairs.add(new ChangePair("spec", material.getSpec(), request.getSpec()));
        pairs.add(new ChangePair("materialType", material.getMaterialType(), request.getMaterialType()));
        pairs.add(new ChangePair("unit", material.getUnit(), request.getUnit()));
        pairs.add(new ChangePair("sourceType", material.getSourceType(), request.getSourceType()));
        pairs.add(new ChangePair("supplierId", material.getSupplierId(), request.getSupplierId()));
        pairs.add(new ChangePair("supplierCode", material.getSupplierCode(), request.getSupplierCode()));
        pairs.add(new ChangePair("lifecycleStatus", material.getLifecycleStatus(), request.getLifecycleStatus()));
        pairs.add(new ChangePair("stdCost", material.getStdCost(), request.getStdCost()));
        pairs.add(new ChangePair("effectiveDate", material.getEffectiveDate(), request.getEffectiveDate()));
        pairs.add(new ChangePair("obsoleteDate", material.getObsoleteDate(), request.getObsoleteDate()));
        pairs.add(new ChangePair("remark", material.getRemark(), request.getRemark()));

        applyRequest(material, request, resolvedCategoryCode);

        boolean controlledRevision = STATUS_RELEASED.equalsIgnoreCase(oldLifecycleStatus)
                && StringUtils.hasText(configService.getValue(CONFIG_RELEASED_EDIT_POLICY));
        if (controlledRevision) {
            material.setVersionNo(nextVersionNo(oldVersionNo));
        }
        materialMapper.updateById(material);

        for (ChangePair pair : pairs) {
            logIfChanged(material, CHANGE_UPDATE, pair.field(), pair.oldValue(), pair.newValue(), null);
        }
        if (controlledRevision) {
            writeChangeLog(material, CHANGE_REVISION, "versionNo", oldVersionNo, material.getVersionNo(),
                    "已发布物料受控修订，版本号自动递增");
        }
    }

    @Transactional
    public void delete(Long materialId) {
        requireMaterial(materialId);
        materialMapper.deleteById(materialId);
    }

    /** 生命周期变更。 */
    @Transactional
    public void changeLifecycle(Long materialId, String status) {
        MdMaterial material = requireMaterial(materialId);
        String states = configService.getValue(CONFIG_LIFECYCLE_STATES);
        if (StringUtils.hasText(states)
                && Arrays.stream(states.split(",")).map(String::trim).noneMatch(status::equals)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "非法的物料生命周期状态: " + status);
        }
        String oldStatus = material.getLifecycleStatus();
        material.setLifecycleStatus(status);
        materialMapper.updateById(material);
        writeChangeLog(material, CHANGE_LIFECYCLE, "lifecycleStatus", oldStatus, status, null);
    }

    public List<MdMaterialSubstitute> listSubstitutes(Long materialId) {
        requireMaterial(materialId);
        return substituteMapper.selectList(Wrappers.<MdMaterialSubstitute>lambdaQuery()
                .eq(MdMaterialSubstitute::getMaterialId, materialId)
                .orderByAsc(MdMaterialSubstitute::getPriority));
    }

    @Transactional
    public Long addSubstitute(Long materialId, MaterialSubstituteRequest request) {
        MdMaterial material = requireMaterial(materialId);
        String substituteCode = request.getSubstituteMaterialCode();
        MdMaterial substitute = materialMapper.selectOne(
                Wrappers.<MdMaterial>lambdaQuery().eq(MdMaterial::getMaterialCode, substituteCode));
        if (substitute == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "替代物料不存在: " + substituteCode);
        }
        if (substitute.getId().equals(material.getId())) {
            throw new BusinessException(ResultCode.CONFLICT, "物料不能替代自身");
        }
        long exists = substituteMapper.selectCount(Wrappers.<MdMaterialSubstitute>lambdaQuery()
                .eq(MdMaterialSubstitute::getMaterialId, materialId)
                .eq(MdMaterialSubstitute::getSubstituteMaterialId, substitute.getId()));
        if (exists > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该替代关系已存在: " + substituteCode);
        }
        MdMaterialSubstitute entity = new MdMaterialSubstitute();
        entity.setMaterialId(material.getId());
        entity.setMaterialCode(material.getMaterialCode());
        entity.setSubstituteMaterialId(substitute.getId());
        entity.setSubstituteMaterialCode(substitute.getMaterialCode());
        entity.setPriority(request.getPriority() == null ? 1 : request.getPriority());
        entity.setApplicableCondition(request.getApplicableCondition());
        entity.setValidFrom(request.getValidFrom());
        entity.setValidTo(request.getValidTo());
        entity.setStatus(1);
        entity.setRemark(request.getRemark());
        substituteMapper.insert(entity);
        return entity.getId();
    }

    @Transactional
    public void deleteSubstitute(Long substituteId) {
        MdMaterialSubstitute entity = substituteMapper.selectById(substituteId);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "替代关系不存在: " + substituteId);
        }
        substituteMapper.deleteById(substituteId);
    }

    public List<MdChangeLog> listChangeLogs(Long materialId) {
        requireMaterial(materialId);
        return changeLogMapper.selectList(Wrappers.<MdChangeLog>lambdaQuery()
                .eq(MdChangeLog::getEntityType, ENTITY_TYPE_MATERIAL)
                .eq(MdChangeLog::getEntityId, materialId)
                .orderByDesc(MdChangeLog::getCreatedAt)
                .orderByDesc(MdChangeLog::getId));
    }

    private void applyRequest(MdMaterial material, MaterialSaveRequest request, String resolvedCategoryCode) {
        material.setMaterialCode(request.getMaterialCode());
        material.setMaterialName(request.getMaterialName());
        material.setCategoryId(request.getCategoryId());
        material.setCategoryCode(resolvedCategoryCode);
        material.setSpec(request.getSpec());
        if (StringUtils.hasText(request.getMaterialType())) {
            material.setMaterialType(request.getMaterialType());
        }
        material.setUnit(request.getUnit());
        material.setSourceType(request.getSourceType());
        material.setSupplierId(request.getSupplierId());
        material.setSupplierCode(request.getSupplierCode());
        if (StringUtils.hasText(request.getLifecycleStatus())) {
            material.setLifecycleStatus(request.getLifecycleStatus());
        }
        material.setStdCost(request.getStdCost());
        material.setEffectiveDate(request.getEffectiveDate());
        material.setObsoleteDate(request.getObsoleteDate());
        material.setRemark(request.getRemark());
    }

    private String resolveCategoryCode(Long categoryId, String categoryCode) {
        if (StringUtils.hasText(categoryCode)) {
            return categoryCode;
        }
        if (categoryId == null) {
            return null;
        }
        MdMaterialCategory category = categoryMapper.selectById(categoryId);
        return category == null ? null : category.getCategoryCode();
    }

    private void validateRequiredFields(MaterialSaveRequest request, String resolvedCategoryCode) {
        MdMaterialCategory category = StringUtils.hasText(resolvedCategoryCode)
                ? categoryMapper.selectOne(Wrappers.<MdMaterialCategory>lambdaQuery()
                        .eq(MdMaterialCategory::getCategoryCode, resolvedCategoryCode))
                : null;
        String required = category != null && StringUtils.hasText(category.getRequiredFields())
                ? category.getRequiredFields()
                : configService.getValue(CONFIG_REQUIRED_FIELDS_DEFAULT);
        if (!StringUtils.hasText(required)) {
            return;
        }
        Map<String, String> values = new HashMap<>();
        values.put("materialCode", request.getMaterialCode());
        values.put("materialName", request.getMaterialName());
        values.put("categoryCode", resolvedCategoryCode);
        values.put("spec", request.getSpec());
        values.put("materialType", request.getMaterialType());
        values.put("unit", request.getUnit());
        values.put("sourceType", request.getSourceType());
        values.put("supplierCode", request.getSupplierCode());
        for (String field : required.split(",")) {
            String key = field.trim();
            if (!key.isEmpty() && !StringUtils.hasText(values.get(key))) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "物料必填字段缺失: " + key);
            }
        }
    }

    private void validateSupplierWhenBuy(MaterialSaveRequest request) {
        if (!SOURCE_TYPE_BUY.equalsIgnoreCase(request.getSourceType())) {
            return;
        }
        String required = configService.getValue(CONFIG_SUPPLIER_REQUIRED_WHEN_BUY);
        if (Boolean.parseBoolean(required) && !StringUtils.hasText(request.getSupplierCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "外购物料必须指定供应商编码");
        }
    }

    private void logIfChanged(MdMaterial material, String changeType, String field,
                              Object oldValue, Object newValue, String remark) {
        if (!Objects.equals(oldValue, newValue)) {
            writeChangeLog(material, changeType, field, str(oldValue), str(newValue), remark);
        }
    }

    private void writeChangeLog(MdMaterial material, String changeType, String field,
                                String oldValue, String newValue, String remark) {
        MdChangeLog log = new MdChangeLog();
        log.setEntityType(ENTITY_TYPE_MATERIAL);
        log.setEntityId(material.getId());
        log.setEntityCode(material.getMaterialCode());
        log.setChangeType(changeType);
        log.setFieldName(field);
        log.setOldValue(truncate(oldValue));
        log.setNewValue(truncate(newValue));
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setRemark(remark);
        changeLogMapper.insert(log);
    }

    private String nextVersionNo(String current) {
        if (!StringUtils.hasText(current)) {
            return "V2";
        }
        Matcher matcher = Pattern.compile("\\d+").matcher(current);
        if (matcher.find()) {
            int next = Integer.parseInt(matcher.group()) + 1;
            return current.substring(0, matcher.start()) + next + current.substring(matcher.end());
        }
        return current + "-V2";
    }

    private String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String truncate(String value) {
        if (value == null || value.length() <= 1000) {
            return value;
        }
        return value.substring(0, 1000);
    }

    private MdMaterial requireMaterial(Long materialId) {
        MdMaterial material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "物料不存在: " + materialId);
        }
        return material;
    }
}
