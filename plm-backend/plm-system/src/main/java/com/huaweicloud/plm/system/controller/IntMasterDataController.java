package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntMasterDataDiffQuery;
import com.huaweicloud.plm.system.dto.IntMasterDataDiffResolveRequest;
import com.huaweicloud.plm.system.dto.IntMasterDataSyncQuery;
import com.huaweicloud.plm.system.dto.IntMasterDataSyncSaveRequest;
import com.huaweicloud.plm.system.entity.IntMasterDataDiff;
import com.huaweicloud.plm.system.entity.IntMasterDataSync;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntMasterDataSyncService;
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

/** 主数据同步接口（N9，DEV-095）。 */
@RestController
@RequestMapping("/int/master-data")
@RequiredArgsConstructor
public class IntMasterDataController {

    private final IntMasterDataSyncService intMasterDataSyncService;

    @GetMapping
    @RequirePermission("int:mds:list")
    public ApiResponse<PageResult<IntMasterDataSync>> page(IntMasterDataSyncQuery query) {
        return ApiResponse.success(intMasterDataSyncService.page(query));
    }

    @GetMapping("/diffs")
    @RequirePermission("int:mds:diff:list")
    public ApiResponse<PageResult<IntMasterDataDiff>> diffPage(IntMasterDataDiffQuery query) {
        return ApiResponse.success(intMasterDataSyncService.diffPage(query));
    }

    @GetMapping("/{syncNo}")
    @RequirePermission("int:mds:list")
    public ApiResponse<IntMasterDataSync> detail(@PathVariable String syncNo) {
        return ApiResponse.success(intMasterDataSyncService.require(syncNo));
    }

    @PostMapping
    @RequirePermission("int:mds:save")
    public ApiResponse<String> create(@Valid @RequestBody IntMasterDataSyncSaveRequest request) {
        return ApiResponse.success(intMasterDataSyncService.create(request));
    }

    @PutMapping("/{syncNo}")
    @RequirePermission("int:mds:save")
    public ApiResponse<Void> update(@PathVariable String syncNo,
                                    @Valid @RequestBody IntMasterDataSyncSaveRequest request) {
        intMasterDataSyncService.update(syncNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{syncNo}")
    @RequirePermission("int:mds:save")
    public ApiResponse<Void> delete(@PathVariable String syncNo) {
        intMasterDataSyncService.delete(syncNo);
        return ApiResponse.success();
    }

    @PostMapping("/{syncNo}/sync")
    @RequirePermission("int:mds:sync")
    public ApiResponse<IntMasterDataSync> sync(@PathVariable String syncNo) {
        return ApiResponse.success(intMasterDataSyncService.sync(syncNo));
    }

    @PostMapping("/diffs/{id}/resolve")
    @RequirePermission("int:mds:diff:resolve")
    public ApiResponse<IntMasterDataDiff> diffResolve(@PathVariable Long id,
                                                      @Valid @RequestBody IntMasterDataDiffResolveRequest request) {
        return ApiResponse.success(intMasterDataSyncService.diffResolve(id, request));
    }
}
