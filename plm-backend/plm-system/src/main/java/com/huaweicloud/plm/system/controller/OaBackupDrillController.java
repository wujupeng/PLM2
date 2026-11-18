package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaBackupDrillSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaBackupDrill;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBackupDrillService;
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

import java.util.Map;

/**
 * 备份恢复演练接口（OA-DEV-110）：演练指标维护与恢复结论推导。
 */
@RestController
@RequestMapping("/oa/test/backup-drills")
@RequiredArgsConstructor
public class OaBackupDrillController {

    private final OaBackupDrillService backupDrillService;

    @GetMapping
    @RequirePermission("oa:test:backup:list")
    public ApiResponse<PageResult<OaBackupDrill>> page(OaTestQuery query) {
        return ApiResponse.success(backupDrillService.pageBackupDrills(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:backup:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(backupDrillService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:backup:list")
    public ApiResponse<OaBackupDrill> detail(@PathVariable Long id) {
        return ApiResponse.success(backupDrillService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:test:backup:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaBackupDrillSaveRequest request) {
        return ApiResponse.success(backupDrillService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:backup:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaBackupDrillSaveRequest request) {
        return ApiResponse.success(backupDrillService.save(id, request));
    }

    /** 依据数据校验与实际 RPO/RTO 推导恢复结论。 */
    @PostMapping("/{id}/restore")
    @RequirePermission("oa:test:backup:manage")
    public ApiResponse<OaBackupDrill> restore(@PathVariable Long id) {
        return ApiResponse.success(backupDrillService.restore(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:backup:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        backupDrillService.delete(id);
        return ApiResponse.success();
    }
}
