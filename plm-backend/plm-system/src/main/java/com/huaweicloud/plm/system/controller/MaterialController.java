package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MaterialImportRequest;
import com.huaweicloud.plm.system.dto.MaterialImportResult;
import com.huaweicloud.plm.system.dto.MaterialQuery;
import com.huaweicloud.plm.system.dto.MaterialSaveRequest;
import com.huaweicloud.plm.system.dto.MaterialSubstituteRequest;
import com.huaweicloud.plm.system.entity.MdChangeLog;
import com.huaweicloud.plm.system.entity.MdMaterial;
import com.huaweicloud.plm.system.entity.MdMaterialSubstitute;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MaterialImportService;
import com.huaweicloud.plm.system.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 物料主档接口（DEV-018 / DEV-019 / DEV-020 / DEV-021 / DEV-022 / DEV-023）。
 */
@RestController
@RequestMapping("/product-data/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;
    private final MaterialImportService materialImportService;

    @GetMapping
    @RequirePermission("material:list")
    public ApiResponse<PageResult<MdMaterial>> page(MaterialQuery query) {
        return ApiResponse.success(materialService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("material:list")
    public ApiResponse<List<MdMaterial>> options() {
        return ApiResponse.success(materialService.options());
    }

    @GetMapping("/{materialId}")
    @RequirePermission("material:list")
    public ApiResponse<MdMaterial> getById(@PathVariable Long materialId) {
        return ApiResponse.success(materialService.getById(materialId));
    }

    @PostMapping
    @RequirePermission("material:create")
    public ApiResponse<Long> create(@Valid @RequestBody MaterialSaveRequest request) {
        return ApiResponse.success(materialService.create(request));
    }

    @PutMapping("/{materialId}")
    @RequirePermission("material:update")
    public ApiResponse<Void> update(@PathVariable Long materialId, @Valid @RequestBody MaterialSaveRequest request) {
        materialService.update(materialId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{materialId}")
    @RequirePermission("material:delete")
    public ApiResponse<Void> delete(@PathVariable Long materialId) {
        materialService.delete(materialId);
        return ApiResponse.success();
    }

    @PutMapping("/{materialId}/lifecycle")
    @RequirePermission("material:update")
    public ApiResponse<Void> changeLifecycle(@PathVariable Long materialId, @RequestBody Map<String, String> body) {
        materialService.changeLifecycle(materialId, body.get("status"));
        return ApiResponse.success();
    }

    @GetMapping("/{materialId}/change-logs")
    @RequirePermission("material:list")
    public ApiResponse<List<MdChangeLog>> changeLogs(@PathVariable Long materialId) {
        return ApiResponse.success(materialService.listChangeLogs(materialId));
    }

    @GetMapping("/{materialId}/substitutes")
    @RequirePermission("material:substitute")
    public ApiResponse<List<MdMaterialSubstitute>> substitutes(@PathVariable Long materialId) {
        return ApiResponse.success(materialService.listSubstitutes(materialId));
    }

    @PostMapping("/{materialId}/substitutes")
    @RequirePermission("material:substitute")
    public ApiResponse<Long> addSubstitute(@PathVariable Long materialId,
                                           @Valid @RequestBody MaterialSubstituteRequest request) {
        return ApiResponse.success(materialService.addSubstitute(materialId, request));
    }

    @DeleteMapping("/substitutes/{substituteId}")
    @RequirePermission("material:substitute")
    public ApiResponse<Void> deleteSubstitute(@PathVariable Long substituteId) {
        materialService.deleteSubstitute(substituteId);
        return ApiResponse.success();
    }

    @PostMapping("/import")
    @RequirePermission("material:import")
    public ApiResponse<MaterialImportResult> importMaterials(@Valid @RequestBody MaterialImportRequest request) {
        return ApiResponse.success(materialImportService.importMaterials(request));
    }
}
