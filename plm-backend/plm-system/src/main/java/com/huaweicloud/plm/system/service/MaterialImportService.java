package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ImportRowError;
import com.huaweicloud.plm.system.dto.MaterialImportRequest;
import com.huaweicloud.plm.system.dto.MaterialImportResult;
import com.huaweicloud.plm.system.dto.MaterialImportRow;
import com.huaweicloud.plm.system.entity.MdMaterial;
import com.huaweicloud.plm.system.entity.MdMaterialCategory;
import com.huaweicloud.plm.system.mapper.MdMaterialCategoryMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 物料批量导入服务（DEV-020）。
 */
@Service
@RequiredArgsConstructor
public class MaterialImportService {

    private final MdMaterialMapper materialMapper;
    private final MdMaterialCategoryMapper categoryMapper;

    @Transactional
    public MaterialImportResult importMaterials(MaterialImportRequest request) {
        MaterialImportResult result = new MaterialImportResult();
        result.setSourceFile(request.getSourceFile());
        List<ImportRowError> errors = new ArrayList<>();
        result.setErrors(errors);

        List<MaterialImportRow> rows = request.getRows() == null ? List.of() : request.getRows();
        result.setTotalRows(rows.size());
        if (CollectionUtils.isEmpty(rows)) {
            result.setSuccessRows(0);
            result.setFailRows(0);
            return result;
        }

        // 一次性查出库内已存在的编码与分类，避免逐行查询导致 N+1。
        List<String> codes = rows.stream()
                .map(MaterialImportRow::getMaterialCode)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        Set<String> existingCodes = codes.isEmpty() ? Set.of()
                : materialMapper.selectList(Wrappers.<MdMaterial>lambdaQuery()
                        .select(MdMaterial::getMaterialCode)
                        .in(MdMaterial::getMaterialCode, codes))
                .stream().map(MdMaterial::getMaterialCode).collect(Collectors.toSet());

        List<String> categoryCodes = rows.stream()
                .map(MaterialImportRow::getCategoryCode)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        Map<String, MdMaterialCategory> categoryMap = categoryCodes.isEmpty() ? Map.of()
                : categoryMapper.selectList(Wrappers.<MdMaterialCategory>lambdaQuery()
                        .in(MdMaterialCategory::getCategoryCode, categoryCodes))
                .stream().collect(Collectors.toMap(MdMaterialCategory::getCategoryCode, Function.identity(), (a, b) -> a));

        Set<String> seenCodes = new HashSet<>();
        int success = 0;
        for (MaterialImportRow row : rows) {
            String code = row.getMaterialCode();
            if (!StringUtils.hasText(code)) {
                errors.add(error(row, "materialCode", "物料编码不能为空"));
                continue;
            }
            if (!StringUtils.hasText(row.getMaterialName())) {
                errors.add(error(row, "materialName", "物料名称不能为空"));
                continue;
            }
            if (!StringUtils.hasText(row.getUnit())) {
                errors.add(error(row, "unit", "单位不能为空"));
                continue;
            }
            if (row.getStdCost() != null && row.getStdCost().compareTo(BigDecimal.ZERO) < 0) {
                errors.add(error(row, "stdCost", "标准成本不能为负数"));
                continue;
            }
            if (!seenCodes.add(code)) {
                errors.add(error(row, "materialCode", "导入文件中物料编码重复: " + code));
                continue;
            }
            if (existingCodes.contains(code)) {
                errors.add(error(row, "materialCode", "物料编码已存在: " + code));
                continue;
            }
            MdMaterialCategory category = null;
            if (StringUtils.hasText(row.getCategoryCode())) {
                category = categoryMap.get(row.getCategoryCode());
                if (category == null) {
                    errors.add(error(row, "categoryCode", "物料分类不存在: " + row.getCategoryCode()));
                    continue;
                }
            }
            MdMaterial material = new MdMaterial();
            material.setMaterialCode(code);
            material.setMaterialName(row.getMaterialName());
            if (category != null) {
                material.setCategoryId(category.getId());
                material.setCategoryCode(category.getCategoryCode());
            }
            material.setSpec(row.getSpec());
            if (StringUtils.hasText(row.getMaterialType())) {
                material.setMaterialType(row.getMaterialType());
            }
            material.setUnit(row.getUnit());
            material.setSourceType(row.getSourceType());
            material.setSupplierCode(row.getSupplierCode());
            material.setLifecycleStatus(StringUtils.hasText(row.getLifecycleStatus()) ? row.getLifecycleStatus() : "draft");
            material.setVersionNo("V1");
            material.setStdCost(row.getStdCost());
            materialMapper.insert(material);
            success++;
        }

        result.setSuccessRows(success);
        result.setFailRows(errors.size());
        return result;
    }

    private ImportRowError error(MaterialImportRow row, String field, String message) {
        ImportRowError error = new ImportRowError();
        error.setSheetName(row.getSheetName());
        error.setRowNumber(row.getRowNumber());
        error.setField(field);
        error.setMessage(message);
        return error;
    }
}
