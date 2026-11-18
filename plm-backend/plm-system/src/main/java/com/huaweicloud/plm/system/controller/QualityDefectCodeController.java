package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.QualityDefectCodeQuery;
import com.huaweicloud.plm.system.dto.QualityDefectCodeSaveRequest;
import com.huaweicloud.plm.system.entity.QualityDefectCode;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.QualityDefectCodeService;
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
 * 缺陷代码库接口（DEV-049）。
 */
@RestController
@RequestMapping("/quality/defect-codes")
@RequiredArgsConstructor
public class QualityDefectCodeController {

    private final QualityDefectCodeService qualityDefectCodeService;

    @GetMapping
    @RequirePermission("quality:defect:list")
    public ApiResponse<PageResult<QualityDefectCode>> page(QualityDefectCodeQuery query) {
        return ApiResponse.success(qualityDefectCodeService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("quality:defect:list")
    public ApiResponse<List<QualityDefectCode>> options() {
        return ApiResponse.success(qualityDefectCodeService.options());
    }

    @GetMapping("/{defectCodeId}")
    @RequirePermission("quality:defect:list")
    public ApiResponse<QualityDefectCode> getById(@PathVariable Long defectCodeId) {
        return ApiResponse.success(qualityDefectCodeService.getById(defectCodeId));
    }

    @PostMapping
    @RequirePermission("quality:defect:save")
    public ApiResponse<Long> create(@Valid @RequestBody QualityDefectCodeSaveRequest request) {
        return ApiResponse.success(qualityDefectCodeService.create(request));
    }

    @PutMapping("/{defectCodeId}")
    @RequirePermission("quality:defect:save")
    public ApiResponse<Void> update(@PathVariable Long defectCodeId,
                                    @Valid @RequestBody QualityDefectCodeSaveRequest request) {
        qualityDefectCodeService.update(defectCodeId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{defectCodeId}")
    @RequirePermission("quality:defect:save")
    public ApiResponse<Void> delete(@PathVariable Long defectCodeId) {
        qualityDefectCodeService.delete(defectCodeId);
        return ApiResponse.success();
    }
}
