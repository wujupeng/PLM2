package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DevopsRepositoryQuery;
import com.huaweicloud.plm.system.dto.DevopsRepositorySaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsRepository;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDevopsRepositoryService;
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
 * 代码仓库接口（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 仓库登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/devops/repositories")
@RequiredArgsConstructor
public class SysDevopsRepositoryController {

    private final SysDevopsRepositoryService service;

    @GetMapping
    @RequirePermission("platform:devops:repository:list")
    public ApiResponse<PageResult<SysDevopsRepository>> page(DevopsRepositoryQuery query) {
        return ApiResponse.success(service.pageRepositories(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:devops:repository:list")
    public ApiResponse<SysDevopsRepository> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:devops:repository:manage")
    public ApiResponse<Long> create(@Valid @RequestBody DevopsRepositorySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:devops:repository:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody DevopsRepositorySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:devops:repository:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
