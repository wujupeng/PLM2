package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizContractSaveRequest;
import com.huaweicloud.plm.system.dto.BizContractVersionSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaContract;
import com.huaweicloud.plm.system.entity.OaContractVersion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaContractService;
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
 * 合同管理与合约评审接口（OA-DEV-080）：登记、评审、审批、版本、到期提醒与归档。
 */
@RestController
@RequestMapping("/oa/special/contracts")
@RequiredArgsConstructor
public class OaContractController {

    private final OaContractService contractService;

    @GetMapping
    @RequirePermission("oa:contract:list")
    public ApiResponse<PageResult<OaContract>> page(OaBizFlowQuery query) {
        return ApiResponse.success(contractService.page(query, query.getApplicantUserId()));
    }

    /** 到期提醒：距到期日在配置天数内的生效合同。 */
    @GetMapping("/expire-alert")
    @RequirePermission("oa:contract:list")
    public ApiResponse<List<OaContract>> expireAlert() {
        return ApiResponse.success(contractService.expireAlert());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:contract:list")
    public ApiResponse<OaContract> detail(@PathVariable Long id) {
        return ApiResponse.success(contractService.detail(id));
    }

    /** 合同版本列表。 */
    @GetMapping("/{id}/versions")
    @RequirePermission("oa:contract:list")
    public ApiResponse<List<OaContractVersion>> listVersions(@PathVariable Long id) {
        return ApiResponse.success(contractService.listVersions(id));
    }

    @PostMapping
    @RequirePermission("oa:contract:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizContractSaveRequest request) {
        return ApiResponse.success(contractService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:contract:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizContractSaveRequest request) {
        contractService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:contract:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        contractService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅评审中的合同可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:contract:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        contractService.withdraw(id);
        return ApiResponse.success();
    }

    /** 新增合同版本。 */
    @PostMapping("/{id}/versions")
    @RequirePermission("oa:contract:manage")
    public ApiResponse<Long> addVersion(@PathVariable Long id, @Valid @RequestBody BizContractVersionSaveRequest request) {
        return ApiResponse.success(contractService.addVersion(id, request));
    }

    /** 归档合同。 */
    @PutMapping("/{id}/archive")
    @RequirePermission("oa:contract:manage")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        contractService.archive(id);
        return ApiResponse.success();
    }

    /** 终止合同。 */
    @PutMapping("/{id}/terminate")
    @RequirePermission("oa:contract:manage")
    public ApiResponse<Void> terminate(@PathVariable Long id, @RequestParam(required = false) String reason) {
        contractService.terminate(id, reason);
        return ApiResponse.success();
    }
}
