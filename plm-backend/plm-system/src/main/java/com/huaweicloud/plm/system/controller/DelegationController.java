package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DelegationQuery;
import com.huaweicloud.plm.system.dto.DelegationSaveRequest;
import com.huaweicloud.plm.system.entity.SysDelegation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DelegationService;
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

@RestController
@RequestMapping("/oa/delegations")
@RequiredArgsConstructor
public class DelegationController {

    private final DelegationService delegationService;

    @GetMapping
    @RequirePermission("oa:delegation:list")
    public ApiResponse<PageResult<SysDelegation>> page(DelegationQuery query) {
        return ApiResponse.success(delegationService.page(query));
    }

    @PostMapping
    @RequirePermission("oa:delegation:save")
    public ApiResponse<Long> create(@Valid @RequestBody DelegationSaveRequest request) {
        return ApiResponse.success(delegationService.create(request));
    }

    @PutMapping("/{delegationId}")
    @RequirePermission("oa:delegation:save")
    public ApiResponse<Void> update(@PathVariable Long delegationId,
                                    @Valid @RequestBody DelegationSaveRequest request) {
        delegationService.update(delegationId, request);
        return ApiResponse.success();
    }

    /** 撤回授权：将生效中的授权置为已撤回。 */
    @PutMapping("/{delegationId}/revoke")
    @RequirePermission("oa:delegation:save")
    public ApiResponse<Void> revoke(@PathVariable Long delegationId) {
        delegationService.revoke(delegationId);
        return ApiResponse.success();
    }

    @DeleteMapping("/{delegationId}")
    @RequirePermission("oa:delegation:delete")
    public ApiResponse<Void> delete(@PathVariable Long delegationId) {
        delegationService.delete(delegationId);
        return ApiResponse.success();
    }
}
