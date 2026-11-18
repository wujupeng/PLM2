package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesInspectionJudgeQuery;
import com.huaweicloud.plm.system.dto.MesInspectionJudgeSaveRequest;
import com.huaweicloud.plm.system.entity.MesInspectionJudge;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesInspectionJudgeService;
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
 * 检验判定接口：判定登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/judges")
@RequiredArgsConstructor
public class MesInspectionJudgeController {

    private final MesInspectionJudgeService service;

    @GetMapping
    @RequirePermission("mes:quality:judge:list")
    public ApiResponse<PageResult<MesInspectionJudge>> page(MesInspectionJudgeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:judge:list")
    public ApiResponse<MesInspectionJudge> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:judge:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesInspectionJudgeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:judge:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesInspectionJudgeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:judge:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
