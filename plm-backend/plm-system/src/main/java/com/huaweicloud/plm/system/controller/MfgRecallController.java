package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgRecallCloseRequest;
import com.huaweicloud.plm.system.dto.MfgRecallDetailResponse;
import com.huaweicloud.plm.system.dto.MfgRecallQuery;
import com.huaweicloud.plm.system.dto.MfgRecallSaveRequest;
import com.huaweicloud.plm.system.entity.MfgRecallImpact;
import com.huaweicloud.plm.system.entity.MfgRecallOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgRecallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 召回与批次隔离接口（N8，DEV-094）：圈定风险范围、生成影响清单、冻结库存与关闭召回。
 */
@RestController
@RequestMapping("/mfg/recalls")
@RequiredArgsConstructor
public class MfgRecallController {

    private final MfgRecallService mfgRecallService;

    @GetMapping
    @RequirePermission("mfg:recall:list")
    public ApiResponse<PageResult<MfgRecallOrder>> page(MfgRecallQuery query) {
        return ApiResponse.success(mfgRecallService.page(query));
    }

    @GetMapping("/{recallNo}")
    @RequirePermission("mfg:recall:list")
    public ApiResponse<MfgRecallDetailResponse> detail(@PathVariable String recallNo) {
        return ApiResponse.success(mfgRecallService.detail(recallNo));
    }

    @GetMapping("/{recallNo}/impacts")
    @RequirePermission("mfg:recall:list")
    public ApiResponse<List<MfgRecallImpact>> listImpacts(@PathVariable String recallNo) {
        return ApiResponse.success(mfgRecallService.listImpacts(recallNo));
    }

    @PostMapping
    @RequirePermission("mfg:recall:create")
    public ApiResponse<Long> create(@Valid @RequestBody MfgRecallSaveRequest request) {
        return ApiResponse.success(mfgRecallService.create(request));
    }

    @PostMapping("/{recallNo}/isolate")
    @RequirePermission("mfg:recall:isolate")
    public ApiResponse<MfgRecallOrder> isolate(@PathVariable String recallNo) {
        return ApiResponse.success(mfgRecallService.isolate(recallNo));
    }

    @PostMapping("/{recallNo}/close")
    @RequirePermission("mfg:recall:close")
    public ApiResponse<MfgRecallOrder> close(@PathVariable String recallNo,
                                             @Valid @RequestBody MfgRecallCloseRequest request) {
        return ApiResponse.success(mfgRecallService.close(recallNo, request));
    }

    @DeleteMapping("/{recallNo}")
    @RequirePermission("mfg:recall:create")
    public ApiResponse<Void> delete(@PathVariable String recallNo) {
        mfgRecallService.delete(recallNo);
        return ApiResponse.success();
    }
}
