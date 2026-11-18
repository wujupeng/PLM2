package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaFinalMigrationSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaFinalMigration;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaFinalMigrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 执行最终全量及增量迁移接口（OA-DEV-115）：迁移批次、抽取范围、导入结果与校验状态。
 */
@RestController
@RequestMapping("/oa/golive/final-migrations")
@RequiredArgsConstructor
public class OaFinalMigrationController {

    private final OaFinalMigrationService service;

    @GetMapping
    @RequirePermission("oa:golive:migration:list")
    public ApiResponse<PageResult<OaFinalMigration>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageMigrations(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:migration:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:migration:list")
    public ApiResponse<OaFinalMigration> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:migration:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaFinalMigrationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:migration:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaFinalMigrationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 执行迁移。 */
    @PostMapping("/{id}/execute")
    @RequirePermission("oa:golive:migration:manage")
    public ApiResponse<OaFinalMigration> execute(@PathVariable Long id) {
        return ApiResponse.success(service.execute(id));
    }

    /** 校验迁移结果。 */
    @PostMapping("/{id}/verify")
    @RequirePermission("oa:golive:migration:manage")
    public ApiResponse<OaFinalMigration> verify(@PathVariable Long id,
                                                @RequestParam(required = false) Boolean verifyPass,
                                                @RequestParam(required = false) String verifyStatus) {
        return ApiResponse.success(service.verify(id, verifyPass, verifyStatus));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:migration:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
