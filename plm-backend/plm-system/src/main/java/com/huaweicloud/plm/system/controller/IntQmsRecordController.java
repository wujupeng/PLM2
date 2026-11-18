package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntQmsRecordQuery;
import com.huaweicloud.plm.system.dto.IntQmsRecordSaveRequest;
import com.huaweicloud.plm.system.entity.IntQmsRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntQmsRecordService;
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

/** QMS 质量记录接口（N9，DEV-097）。 */
@RestController
@RequestMapping("/int/qms-records")
@RequiredArgsConstructor
public class IntQmsRecordController {

    private final IntQmsRecordService intQmsRecordService;

    @GetMapping
    @RequirePermission("int:qms:list")
    public ApiResponse<PageResult<IntQmsRecord>> page(IntQmsRecordQuery query) {
        return ApiResponse.success(intQmsRecordService.page(query));
    }

    @GetMapping("/{recordNo}")
    @RequirePermission("int:qms:list")
    public ApiResponse<IntQmsRecord> detail(@PathVariable String recordNo) {
        return ApiResponse.success(intQmsRecordService.require(recordNo));
    }

    @PostMapping
    @RequirePermission("int:qms:save")
    public ApiResponse<String> create(@Valid @RequestBody IntQmsRecordSaveRequest request) {
        return ApiResponse.success(intQmsRecordService.create(request));
    }

    @PutMapping("/{recordNo}")
    @RequirePermission("int:qms:save")
    public ApiResponse<Void> update(@PathVariable String recordNo,
                                    @Valid @RequestBody IntQmsRecordSaveRequest request) {
        intQmsRecordService.update(recordNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{recordNo}")
    @RequirePermission("int:qms:save")
    public ApiResponse<Void> delete(@PathVariable String recordNo) {
        intQmsRecordService.delete(recordNo);
        return ApiResponse.success();
    }

    @PostMapping("/receive")
    @RequirePermission("int:qms:receive")
    public ApiResponse<IntQmsRecord> receive(@Valid @RequestBody IntQmsRecordSaveRequest request) {
        return ApiResponse.success(intQmsRecordService.receive(request));
    }
}
