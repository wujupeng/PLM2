package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizWorkshopDailySaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizWorkshopDaily;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizWorkshopDailyService;
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
 * 车间生产日报接口（OA-DEV-067）：无流程单据，承载日报录入、提交、确认与删除。
 */
@RestController
@RequestMapping("/oa/biz/workshop-dailies")
@RequiredArgsConstructor
public class OaBizWorkshopDailyController {

    private final OaBizWorkshopDailyService workshopDailyService;

    /** 车间生产日报分页。 */
    @GetMapping
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<PageResult<OaBizWorkshopDaily>> page(OaBizFlowQuery query) {
        return ApiResponse.success(workshopDailyService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<OaBizWorkshopDaily> detail(@PathVariable Long id) {
        return ApiResponse.success(workshopDailyService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizWorkshopDailySaveRequest request) {
        return ApiResponse.success(workshopDailyService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizWorkshopDailySaveRequest request) {
        workshopDailyService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workshopDailyService.delete(id);
        return ApiResponse.success();
    }

    /** 提交日报：草稿可提交。 */
    @PutMapping("/{id}/submit")
    @RequirePermission("oa:biz:sales:manage")
    public ApiResponse<Void> submit(@PathVariable Long id) {
        workshopDailyService.submit(id);
        return ApiResponse.success();
    }

    /** 确认日报：与 MES 生产实绩对账后确认。 */
    @PutMapping("/{id}/confirm")
    @RequirePermission("oa:biz:sales:manage")
    public ApiResponse<Void> confirm(@PathVariable Long id) {
        workshopDailyService.confirm(id);
        return ApiResponse.success();
    }
}
