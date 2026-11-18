package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgPackageDetailResponse;
import com.huaweicloud.plm.system.dto.MfgPackageQuery;
import com.huaweicloud.plm.system.dto.MfgPackageSaveRequest;
import com.huaweicloud.plm.system.dto.MfgPackageSealRequest;
import com.huaweicloud.plm.system.entity.MfgPackage;
import com.huaweicloud.plm.system.entity.MfgPackageItem;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgPackageService;
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
 * 包装与箱码接口（N8，DEV-089）：内/外箱与托盘、箱内产品清单、封箱与按批次自动装箱。
 */
@RestController
@RequestMapping("/mfg/packages")
@RequiredArgsConstructor
public class MfgPackageController {

    private final MfgPackageService mfgPackageService;

    @GetMapping
    @RequirePermission("mfg:package:list")
    public ApiResponse<PageResult<MfgPackage>> page(MfgPackageQuery query) {
        return ApiResponse.success(mfgPackageService.page(query));
    }

    @GetMapping("/{packageNo}")
    @RequirePermission("mfg:package:list")
    public ApiResponse<MfgPackageDetailResponse> detail(@PathVariable String packageNo) {
        return ApiResponse.success(mfgPackageService.detail(packageNo));
    }

    @GetMapping("/{packageNo}/items")
    @RequirePermission("mfg:package:list")
    public ApiResponse<List<MfgPackageItem>> listItems(@PathVariable String packageNo) {
        return ApiResponse.success(mfgPackageService.listItems(packageNo));
    }

    @GetMapping("/batch/{batchNo}")
    @RequirePermission("mfg:package:list")
    public ApiResponse<List<MfgPackage>> listByBatch(@PathVariable String batchNo) {
        return ApiResponse.success(mfgPackageService.listByBatch(batchNo));
    }

    @PostMapping
    @RequirePermission("mfg:package:save")
    public ApiResponse<Long> create(@Valid @RequestBody MfgPackageSaveRequest request) {
        return ApiResponse.success(mfgPackageService.create(request));
    }

    @PutMapping("/{packageNo}")
    @RequirePermission("mfg:package:save")
    public ApiResponse<Void> update(@PathVariable String packageNo,
                                    @Valid @RequestBody MfgPackageSaveRequest request) {
        mfgPackageService.update(packageNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/pack-by-batch")
    @RequirePermission("mfg:package:save")
    public ApiResponse<Long> packByBatch(@RequestParam String batchNo,
                                         @RequestParam(required = false) String productCode,
                                         @RequestParam(required = false) String customerCode,
                                         @RequestParam(required = false) Integer maxQty,
                                         @RequestParam(required = false) String operator) {
        return ApiResponse.success(mfgPackageService.packByBatch(batchNo, productCode, customerCode, maxQty, operator));
    }

    @PostMapping("/{packageNo}/seal")
    @RequirePermission("mfg:package:seal")
    public ApiResponse<Void> seal(@PathVariable String packageNo,
                                  @RequestBody(required = false) MfgPackageSealRequest request) {
        mfgPackageService.seal(packageNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{packageNo}")
    @RequirePermission("mfg:package:save")
    public ApiResponse<Void> delete(@PathVariable String packageNo) {
        mfgPackageService.delete(packageNo);
        return ApiResponse.success();
    }
}
