package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntDeliveryItemQuery;
import com.huaweicloud.plm.system.dto.IntDeliveryItemSaveRequest;
import com.huaweicloud.plm.system.dto.IntGoliveExecuteRequest;
import com.huaweicloud.plm.system.dto.IntGoliveRecordQuery;
import com.huaweicloud.plm.system.dto.IntGoliveRecordSaveRequest;
import com.huaweicloud.plm.system.dto.IntTrainingRecordQuery;
import com.huaweicloud.plm.system.dto.IntTrainingRecordSaveRequest;
import com.huaweicloud.plm.system.entity.IntDeliveryItem;
import com.huaweicloud.plm.system.entity.IntGoliveRecord;
import com.huaweicloud.plm.system.entity.IntTrainingRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntDeliveryItemService;
import com.huaweicloud.plm.system.service.IntGoliveService;
import com.huaweicloud.plm.system.service.IntTrainingService;
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
 * 培训与上线接口（N9，DEV-104 / DEV-105）。
 */
@RestController
@RequestMapping("/int")
@RequiredArgsConstructor
public class IntGoliveController {

    private final IntTrainingService intTrainingService;
    private final IntGoliveService intGoliveService;
    private final IntDeliveryItemService intDeliveryItemService;

    // ==================== 培训记录 ====================

    /** 分页查询培训记录。 */
    @GetMapping("/trainings")
    @RequirePermission("int:training:list")
    public ApiResponse<PageResult<IntTrainingRecord>> pageTrainings(IntTrainingRecordQuery query) {
        return ApiResponse.success(intTrainingService.page(query));
    }

    /** 查询培训记录详情。 */
    @GetMapping("/trainings/{trainingNo}")
    @RequirePermission("int:training:list")
    public ApiResponse<IntTrainingRecord> trainingDetail(@PathVariable String trainingNo) {
        return ApiResponse.success(intTrainingService.require(trainingNo));
    }

    /** 新增培训记录。 */
    @PostMapping("/trainings")
    @RequirePermission("int:training:save")
    public ApiResponse<String> createTraining(@Valid @RequestBody IntTrainingRecordSaveRequest request) {
        return ApiResponse.success(intTrainingService.create(request));
    }

    /** 修改培训记录。 */
    @PutMapping("/trainings/{trainingNo}")
    @RequirePermission("int:training:save")
    public ApiResponse<Void> updateTraining(@PathVariable String trainingNo,
                                            @Valid @RequestBody IntTrainingRecordSaveRequest request) {
        intTrainingService.update(trainingNo, request);
        return ApiResponse.success();
    }

    /** 删除培训记录。 */
    @DeleteMapping("/trainings/{trainingNo}")
    @RequirePermission("int:training:save")
    public ApiResponse<Void> deleteTraining(@PathVariable String trainingNo) {
        intTrainingService.delete(trainingNo);
        return ApiResponse.success();
    }

    // ==================== 上线切换记录 ====================

    /** 分页查询上线切换记录。 */
    @GetMapping("/golive")
    @RequirePermission("int:golive:list")
    public ApiResponse<PageResult<IntGoliveRecord>> pageGolive(IntGoliveRecordQuery query) {
        return ApiResponse.success(intGoliveService.page(query));
    }

    /** 查询上线切换记录详情。 */
    @GetMapping("/golive/{goliveNo}")
    @RequirePermission("int:golive:list")
    public ApiResponse<IntGoliveRecord> goliveDetail(@PathVariable String goliveNo) {
        return ApiResponse.success(intGoliveService.require(goliveNo));
    }

    /** 新增上线切换记录。 */
    @PostMapping("/golive")
    @RequirePermission("int:golive:save")
    public ApiResponse<String> createGolive(@Valid @RequestBody IntGoliveRecordSaveRequest request) {
        return ApiResponse.success(intGoliveService.create(request));
    }

    /** 修改上线切换记录。 */
    @PutMapping("/golive/{goliveNo}")
    @RequirePermission("int:golive:save")
    public ApiResponse<Void> updateGolive(@PathVariable String goliveNo,
                                          @Valid @RequestBody IntGoliveRecordSaveRequest request) {
        intGoliveService.update(goliveNo, request);
        return ApiResponse.success();
    }

    /** 删除上线切换记录。 */
    @DeleteMapping("/golive/{goliveNo}")
    @RequirePermission("int:golive:save")
    public ApiResponse<Void> deleteGolive(@PathVariable String goliveNo) {
        intGoliveService.delete(goliveNo);
        return ApiResponse.success();
    }

    /** 执行上线切换。 */
    @PostMapping("/golive/{goliveNo}/execute")
    @RequirePermission("int:golive:execute")
    public ApiResponse<IntGoliveRecord> executeGolive(@PathVariable String goliveNo,
                                                      @Valid @RequestBody IntGoliveExecuteRequest request) {
        return ApiResponse.success(intGoliveService.execute(goliveNo, request));
    }

    // ==================== 交付物 ====================

    /** 分页查询交付物。 */
    @GetMapping("/deliveries")
    @RequirePermission("int:delivery:list")
    public ApiResponse<PageResult<IntDeliveryItem>> pageDeliveries(IntDeliveryItemQuery query) {
        return ApiResponse.success(intDeliveryItemService.page(query));
    }

    /** 查询交付物详情。 */
    @GetMapping("/deliveries/{itemNo}")
    @RequirePermission("int:delivery:list")
    public ApiResponse<IntDeliveryItem> deliveryDetail(@PathVariable String itemNo) {
        return ApiResponse.success(intDeliveryItemService.require(itemNo));
    }

    /** 新增交付物。 */
    @PostMapping("/deliveries")
    @RequirePermission("int:delivery:save")
    public ApiResponse<String> createDelivery(@Valid @RequestBody IntDeliveryItemSaveRequest request) {
        return ApiResponse.success(intDeliveryItemService.create(request));
    }

    /** 修改交付物。 */
    @PutMapping("/deliveries/{itemNo}")
    @RequirePermission("int:delivery:save")
    public ApiResponse<Void> updateDelivery(@PathVariable String itemNo,
                                            @Valid @RequestBody IntDeliveryItemSaveRequest request) {
        intDeliveryItemService.update(itemNo, request);
        return ApiResponse.success();
    }

    /** 删除交付物。 */
    @DeleteMapping("/deliveries/{itemNo}")
    @RequirePermission("int:delivery:save")
    public ApiResponse<Void> deleteDelivery(@PathVariable String itemNo) {
        intDeliveryItemService.delete(itemNo);
        return ApiResponse.success();
    }

    /** 验收交付物。 */
    @PostMapping("/deliveries/{itemNo}/verify")
    @RequirePermission("int:delivery:verify")
    public ApiResponse<IntDeliveryItem> verifyDelivery(@PathVariable String itemNo) {
        return ApiResponse.success(intDeliveryItemService.verify(itemNo));
    }
}
