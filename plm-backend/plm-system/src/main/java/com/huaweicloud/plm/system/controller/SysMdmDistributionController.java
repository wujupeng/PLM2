package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmDistributionQuery;
import com.huaweicloud.plm.system.dto.SysMdmDistributionSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmDistribution;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmDistributionService;
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

/**
 * 主数据分发接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 主数据分发登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/distributions")
@RequiredArgsConstructor
public class SysMdmDistributionController {

    private final SysMdmDistributionService service;

    @GetMapping
    @RequirePermission("platform:mdm:distribution:list")
    public ApiResponse<PageResult<SysMdmDistribution>> page(SysMdmDistributionQuery query) {
        return ApiResponse.success(service.pageDistributions(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:distribution:list")
    public ApiResponse<SysMdmDistribution> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:distribution:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmDistributionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:distribution:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmDistributionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:distribution:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
