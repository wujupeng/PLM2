package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntDefectAssignRequest;
import com.huaweicloud.plm.system.dto.IntDefectQuery;
import com.huaweicloud.plm.system.dto.IntDefectSaveRequest;
import com.huaweicloud.plm.system.entity.IntDefect;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntDefectService;
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
 * 缺陷 SLA 接口（N9，DEV-106）。
 */
@RestController
@RequestMapping("/int/defects")
@RequiredArgsConstructor
public class IntDefectController {

    private final IntDefectService intDefectService;

    /** 分页查询缺陷。 */
    @GetMapping("")
    @RequirePermission("int:defect:list")
    public ApiResponse<PageResult<IntDefect>> page(IntDefectQuery query) {
        return ApiResponse.success(intDefectService.page(query));
    }

    /** 查询缺陷详情。 */
    @GetMapping("/{defectNo}")
    @RequirePermission("int:defect:list")
    public ApiResponse<IntDefect> detail(@PathVariable String defectNo) {
        return ApiResponse.success(intDefectService.require(defectNo));
    }

    /** 新增缺陷。 */
    @PostMapping("")
    @RequirePermission("int:defect:save")
    public ApiResponse<String> create(@Valid @RequestBody IntDefectSaveRequest request) {
        return ApiResponse.success(intDefectService.create(request));
    }

    /** 修改缺陷。 */
    @PutMapping("/{defectNo}")
    @RequirePermission("int:defect:save")
    public ApiResponse<Void> update(@PathVariable String defectNo,
                                    @Valid @RequestBody IntDefectSaveRequest request) {
        intDefectService.update(defectNo, request);
        return ApiResponse.success();
    }

    /** 删除缺陷。 */
    @DeleteMapping("/{defectNo}")
    @RequirePermission("int:defect:save")
    public ApiResponse<Void> delete(@PathVariable String defectNo) {
        intDefectService.delete(defectNo);
        return ApiResponse.success();
    }

    /** 分派缺陷。 */
    @PostMapping("/{defectNo}/assign")
    @RequirePermission("int:defect:assign")
    public ApiResponse<IntDefect> assign(@PathVariable String defectNo,
                                         @Valid @RequestBody IntDefectAssignRequest request) {
        return ApiResponse.success(intDefectService.assign(defectNo, request));
    }

    /** 关闭缺陷。 */
    @PostMapping("/{defectNo}/close")
    @RequirePermission("int:defect:close")
    public ApiResponse<IntDefect> close(@PathVariable String defectNo) {
        return ApiResponse.success(intDefectService.close(defectNo));
    }

    /** 升级缺陷。 */
    @PostMapping("/{defectNo}/escalate")
    @RequirePermission("int:defect:escalate")
    public ApiResponse<IntDefect> escalate(@PathVariable String defectNo) {
        return ApiResponse.success(intDefectService.escalate(defectNo));
    }
}
