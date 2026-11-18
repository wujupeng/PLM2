package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.AddressBookItem;
import com.huaweicloud.plm.system.dto.AddressBookQuery;
import com.huaweicloud.plm.system.entity.SysEmployment;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.SysEmploymentMapper;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 组织通讯录服务：按组织与关键字检索启用人员，并附带任职与组织信息。
 */
@Service
@RequiredArgsConstructor
public class OaAddressBookService {

    private final SysUserMapper userMapper;
    private final SysEmploymentMapper employmentMapper;
    private final SysOrganizationMapper organizationMapper;

    public PageResult<AddressBookItem> page(AddressBookQuery query) {
        Page<SysUser> page = query.toPage();
        userMapper.selectPage(page, Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getStatus, 1)
                .eq(query.getOrgId() != null, SysUser::getOrgId, query.getOrgId())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysUser::getDisplayName, query.getKeyword()).or()
                        .like(SysUser::getUsername, query.getKeyword()).or()
                        .like(SysUser::getPhone, query.getKeyword()).or()
                        .like(SysUser::getEmail, query.getKeyword()))
                .orderByAsc(SysUser::getDisplayName));

        List<SysUser> users = page.getRecords() == null ? List.of() : page.getRecords();
        Set<Long> userIds = new HashSet<>();
        Set<Long> orgIds = new HashSet<>();
        for (SysUser user : users) {
            if (user.getId() != null) {
                userIds.add(user.getId());
            }
            if (user.getOrgId() != null) {
                orgIds.add(user.getOrgId());
            }
        }

        Map<Long, SysEmployment> employmentMap = new HashMap<>();
        Set<Long> managerIds = new HashSet<>();
        if (!userIds.isEmpty()) {
            List<SysEmployment> employments = employmentMapper.selectList(Wrappers.<SysEmployment>lambdaQuery()
                    .in(SysEmployment::getUserId, userIds));
            for (SysEmployment employment : employments) {
                if (employment.getUserId() != null && !employmentMap.containsKey(employment.getUserId())) {
                    employmentMap.put(employment.getUserId(), employment);
                }
                if (employment.getManagerUserId() != null) {
                    managerIds.add(employment.getManagerUserId());
                }
            }
        }

        Map<Long, String> orgNameMap = new HashMap<>();
        if (!orgIds.isEmpty()) {
            List<SysOrganization> organizations = organizationMapper.selectList(Wrappers.<SysOrganization>lambdaQuery()
                    .in(SysOrganization::getId, orgIds));
            for (SysOrganization organization : organizations) {
                orgNameMap.put(organization.getId(), organization.getOrgName());
            }
        }

        Map<Long, String> managerNameMap = new HashMap<>();
        if (!managerIds.isEmpty()) {
            List<SysUser> managers = userMapper.selectList(Wrappers.<SysUser>lambdaQuery()
                    .in(SysUser::getId, managerIds));
            for (SysUser manager : managers) {
                managerNameMap.put(manager.getId(), manager.getDisplayName());
            }
        }

        return PageResult.of(page, user -> convert(user, employmentMap, orgNameMap, managerNameMap));
    }

    /** 组织列表，供前端筛选使用。 */
    public List<SysOrganization> listOrgs() {
        return organizationMapper.selectList(Wrappers.<SysOrganization>lambdaQuery()
                .eq(SysOrganization::getStatus, 1)
                .orderByAsc(SysOrganization::getSortNo)
                .orderByAsc(SysOrganization::getId));
    }

    private AddressBookItem convert(SysUser user, Map<Long, SysEmployment> employmentMap,
                                    Map<Long, String> orgNameMap, Map<Long, String> managerNameMap) {
        AddressBookItem item = new AddressBookItem();
        item.setUserId(user.getId());
        item.setUsername(user.getUsername());
        item.setDisplayName(user.getDisplayName());
        item.setEmail(user.getEmail());
        item.setPhone(user.getPhone());
        item.setOrgId(user.getOrgId());
        item.setOrgName(user.getOrgId() == null ? null : orgNameMap.get(user.getOrgId()));

        SysEmployment employment = user.getId() == null ? null : employmentMap.get(user.getId());
        if (employment != null) {
            item.setEmployeeNo(employment.getEmployeeNo());
            item.setPositionName(employment.getPositionName());
            item.setEmploymentType(employment.getEmploymentType());
            item.setEmploymentStatus(employment.getEmploymentStatus());
            item.setManagerUserId(employment.getManagerUserId());
            item.setWorkLocation(employment.getWorkLocation());
            if (employment.getManagerUserId() != null) {
                item.setManagerName(managerNameMap.get(employment.getManagerUserId()));
            }
        }
        return item;
    }
}
