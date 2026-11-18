package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsBatchQuery;
import com.huaweicloud.plm.system.dto.WmsBatchSaveRequest;
import com.huaweicloud.plm.system.entity.WmsMaterialBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsMaterialBatchService;
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

import java.util.List;

/**
 * 批次库存与物料标识接口（N7，DEV-075/079）。
 */
@RestController
@RequestMapping("/wms/batches")
@RequiredArgsConstructor
public class WmsMaterialBatchController {

    private final WmsMaterialBatchService wmsMaterialBatchService;

    @GetMapping
    @RequirePermission("wms:batch:list")
    public ApiResponse<PageResult<WmsMaterialBatch>> page(WmsBatchQuery query) {
        return ApiResponse.success(wmsMaterialBatchService.page(query));
    }

    @GetMapping("/by-material")
    @RequirePermission("wms:batch:list")
    public ApiResponse<List<WmsMaterialBatch>> listByMaterial(@RequestParam String materialCode) {
        return ApiResponse.success(wmsMaterialBatchService.listByMaterial(materialCode));
    }

    @GetMapping("/fifo")
    @RequirePermission("wms:batch:list")
    public ApiResponse<List<WmsMaterialBatch>> fifo(@RequestParam String materialCode,
                                                    @RequestParam(required = false) String locationCode) {
        return ApiResponse.success(wmsMaterialBatchService.fifoOrder(materialCode, locationCode));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:batch:list")
    public ApiResponse<WmsMaterialBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(wmsMaterialBatchService.requireBatch(id));
    }

    @PostMapping
    @RequirePermission("wms:batch:save")
    public ApiResponse<Long> create(@Valid @RequestBody WmsBatchSaveRequest request) {
        return ApiResponse.success(wmsMaterialBatchService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:batch:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody WmsBatchSaveRequest request) {
        wmsMaterialBatchService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:batch:save")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        wmsMaterialBatchService.delete(id);
        return ApiResponse.success();
    }
}
