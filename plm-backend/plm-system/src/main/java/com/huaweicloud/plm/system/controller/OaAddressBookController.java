package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.AddressBookItem;
import com.huaweicloud.plm.system.dto.AddressBookQuery;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaAddressBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 通讯录接口（OA-DEV-060）：仅返回启用状态员工，支持按组织过滤，并提供组织列表。
 */
@RestController
@RequestMapping("/oa/address-book")
@RequiredArgsConstructor
public class OaAddressBookController {

    private final OaAddressBookService addressBookService;

    @GetMapping
    @RequirePermission("oa:addressbook:list")
    public ApiResponse<PageResult<AddressBookItem>> page(AddressBookQuery query) {
        return ApiResponse.success(addressBookService.page(query));
    }

    /** 组织列表：供通讯录按组织筛选。 */
    @GetMapping("/orgs")
    @RequirePermission("oa:addressbook:list")
    public ApiResponse<List<SysOrganization>> orgs() {
        return ApiResponse.success(addressBookService.listOrgs());
    }
}
