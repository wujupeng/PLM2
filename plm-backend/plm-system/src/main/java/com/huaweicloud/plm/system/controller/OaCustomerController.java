package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizCustomerContactSaveRequest;
import com.huaweicloud.plm.system.dto.BizCustomerSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaCustomer;
import com.huaweicloud.plm.system.entity.OaCustomerContact;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaCustomerService;
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
 * 客户管理轻量模块接口（OA-DEV-083）：客户档案与联系人维护。主数据权威归属 ERP/CRM。
 */
@RestController
@RequestMapping("/oa/special/customers")
@RequiredArgsConstructor
public class OaCustomerController {

    private final OaCustomerService customerService;

    @GetMapping
    @RequirePermission("oa:customer:list")
    public ApiResponse<PageResult<OaCustomer>> page(OaBizFlowQuery query) {
        return ApiResponse.success(customerService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:customer:list")
    public ApiResponse<OaCustomer> detail(@PathVariable Long id) {
        return ApiResponse.success(customerService.detail(id));
    }

    /** 客户联系人列表。 */
    @GetMapping("/{id}/contacts")
    @RequirePermission("oa:customer:list")
    public ApiResponse<List<OaCustomerContact>> listContacts(@PathVariable Long id) {
        return ApiResponse.success(customerService.listContacts(id));
    }

    @PostMapping
    @RequirePermission("oa:customer:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizCustomerSaveRequest request) {
        return ApiResponse.success(customerService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:customer:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizCustomerSaveRequest request) {
        customerService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:customer:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ApiResponse.success();
    }

    /** 新增客户联系人。 */
    @PostMapping("/{id}/contacts")
    @RequirePermission("oa:customer:manage")
    public ApiResponse<Long> createContact(@PathVariable Long id, @Valid @RequestBody BizCustomerContactSaveRequest request) {
        return ApiResponse.success(customerService.saveContact(id, request));
    }

    @DeleteMapping("/contacts/{contactId}")
    @RequirePermission("oa:customer:manage")
    public ApiResponse<Void> deleteContact(@PathVariable Long contactId) {
        customerService.deleteContact(contactId);
        return ApiResponse.success();
    }
}
