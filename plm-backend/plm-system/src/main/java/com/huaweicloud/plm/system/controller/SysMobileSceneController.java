package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MobileSceneQuery;
import com.huaweicloud.plm.system.dto.MobileSceneSaveRequest;
import com.huaweicloud.plm.system.entity.SysMobileScene;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMobileSceneService;
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
 * 移动场景接口（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 场景登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mobile/scenes")
@RequiredArgsConstructor
public class SysMobileSceneController {

    private final SysMobileSceneService service;

    @GetMapping
    @RequirePermission("platform:mobile:scene:list")
    public ApiResponse<PageResult<SysMobileScene>> page(MobileSceneQuery query) {
        return ApiResponse.success(service.pageScenes(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mobile:scene:list")
    public ApiResponse<SysMobileScene> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mobile:scene:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MobileSceneSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mobile:scene:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MobileSceneSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mobile:scene:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
