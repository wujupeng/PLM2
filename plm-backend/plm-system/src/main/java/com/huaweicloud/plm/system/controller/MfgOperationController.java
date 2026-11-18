package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgOperationQuery;
import com.huaweicloud.plm.system.dto.MfgOperationSaveRequest;
import com.huaweicloud.plm.system.entity.MfgOperationRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgOperationService;
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

/**
 * 工序过站与采集接口（N8，DEV-086）：对接 MES（IF-10）采集工序、设备、工位、人员与结果。
 */
@RestController
@RequestMapping("/mfg/operations")
@RequiredArgsConstructor
public class MfgOperationController {

    private final MfgOperationService mfgOperationService;

    @GetMapping
    @RequirePermission("mfg:operation:list")
    public ApiResponse<PageResult<MfgOperationRecord>> page(MfgOperationQuery query) {
        return ApiResponse.success(mfgOperationService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mfg:operation:list")
    public ApiResponse<MfgOperationRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(mfgOperationService.require(id));
    }

    @GetMapping("/batch/{batchNo}")
    @RequirePermission("mfg:operation:list")
    public ApiResponse<List<MfgOperationRecord>> listByBatch(@PathVariable String batchNo) {
        return ApiResponse.success(mfgOperationService.listByBatch(batchNo));
    }

    @PostMapping
    @RequirePermission("mfg:operation:save")
    public ApiResponse<Long> create(@Valid @RequestBody MfgOperationSaveRequest request) {
        return ApiResponse.success(mfgOperationService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mfg:operation:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody MfgOperationSaveRequest request) {
        mfgOperationService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mfg:operation:save")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mfgOperationService.delete(id);
        return ApiResponse.success();
    }
}
