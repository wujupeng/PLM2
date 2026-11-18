package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpCustomerContactQuery;
import com.huaweicloud.plm.system.dto.ErpCustomerContactSaveRequest;
import com.huaweicloud.plm.system.entity.ErpCustomerContact;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpCustomerContactService;
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
 * 客户联系人接口（G3-N1 ERP 基础资料 WBS T021）：
 * 客户联系人登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/customer-contacts")
@RequiredArgsConstructor
public class ErpCustomerContactController {

    private final ErpCustomerContactService service;

    @GetMapping
    @RequirePermission("erp:base:customercontact:list")
    public ApiResponse<PageResult<ErpCustomerContact>> page(ErpCustomerContactQuery query) {
        return ApiResponse.success(service.pageCustomerContacts(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:customercontact:list")
    public ApiResponse<ErpCustomerContact> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:customercontact:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpCustomerContactSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:customercontact:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpCustomerContactSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:customercontact:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
