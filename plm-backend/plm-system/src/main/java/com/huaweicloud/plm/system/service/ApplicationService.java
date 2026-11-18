package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ApplicationQuery;
import com.huaweicloud.plm.system.dto.ApplicationSaveRequest;
import com.huaweicloud.plm.system.entity.SysApplication;
import com.huaweicloud.plm.system.entity.SysApplicationRole;
import com.huaweicloud.plm.system.entity.SysUserRole;
import com.huaweicloud.plm.system.mapper.SysApplicationMapper;
import com.huaweicloud.plm.system.mapper.SysApplicationRoleMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final SysApplicationMapper applicationMapper;
    private final SysApplicationRoleMapper applicationRoleMapper;
    private final SysUserRoleMapper userRoleMapper;

    public PageResult<SysApplication> page(ApplicationQuery query) {
        Page<SysApplication> page = query.toPage();
        applicationMapper.selectPage(page, Wrappers.<SysApplication>lambdaQuery()
                .eq(StringUtils.hasText(query.getAppType()), SysApplication::getAppType, query.getAppType())
                .eq(StringUtils.hasText(query.getAppCategory()),
                        SysApplication::getAppCategory, query.getAppCategory())
                .eq(StringUtils.hasText(query.getStatus()), SysApplication::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApplication::getAppCode, query.getKeyword()).or()
                        .like(SysApplication::getAppName, query.getKeyword()))
                .orderByAsc(SysApplication::getSortNo));
        return PageResult.of(page);
    }

    public Long create(ApplicationSaveRequest request) {
        if (applicationMapper.countByCode(request.getAppCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "应用编码已存在: " + request.getAppCode());
        }
        SysApplication application = new SysApplication();
        applyRequest(application, request);
        applicationMapper.insert(application);
        return application.getId();
    }

    public void update(Long applicationId, ApplicationSaveRequest request) {
        SysApplication application = requireApplication(applicationId);
        if (applicationMapper.countByCode(request.getAppCode(), applicationId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "应用编码已存在: " + request.getAppCode());
        }
        applyRequest(application, request);
        applicationMapper.updateById(application);
    }

    @Transactional
    public void delete(Long applicationId) {
        requireApplication(applicationId);
        applicationMapper.deleteById(applicationId);
        applicationRoleMapper.delete(Wrappers.<SysApplicationRole>lambdaQuery()
                .eq(SysApplicationRole::getApplicationId, applicationId));
    }

    /** 应用授权：以全量覆盖方式更新可见角色集合。 */
    @Transactional
    public void grant(Long applicationId, List<Long> roleIds) {
        requireApplication(applicationId);
        applicationRoleMapper.delete(Wrappers.<SysApplicationRole>lambdaQuery()
                .eq(SysApplicationRole::getApplicationId, applicationId));
        if (CollectionUtils.isEmpty(roleIds)) {
            return;
        }
        roleIds.stream().distinct().forEach(roleId -> {
            SysApplicationRole applicationRole = new SysApplicationRole();
            applicationRole.setApplicationId(applicationId);
            applicationRole.setRoleId(roleId);
            applicationRoleMapper.insert(applicationRole);
        });
    }

    public List<Long> listGrantedRoleIds(Long applicationId) {
        return applicationRoleMapper.selectList(Wrappers.<SysApplicationRole>lambdaQuery()
                        .eq(SysApplicationRole::getApplicationId, applicationId))
                .stream().map(SysApplicationRole::getRoleId).toList();
    }

    /** 按用户角色计算可见且启用的应用：全员可见 + 授权给该用户角色的应用。 */
    public List<SysApplication> listVisibleForUser(Long userId) {
        List<Long> roleIds = userRoleMapper.selectList(Wrappers.<SysUserRole>lambdaQuery()
                        .eq(SysUserRole::getUserId, userId))
                .stream().map(SysUserRole::getRoleId).toList();

        List<Long> grantedAppIds = roleIds.isEmpty() ? Collections.emptyList()
                : applicationRoleMapper.selectList(Wrappers.<SysApplicationRole>lambdaQuery()
                                .in(SysApplicationRole::getRoleId, roleIds))
                        .stream().map(SysApplicationRole::getApplicationId).distinct().toList();

        return applicationMapper.selectList(Wrappers.<SysApplication>lambdaQuery()
                .eq(SysApplication::getStatus, "enabled")
                .and(w -> {
                    w.eq(SysApplication::getVisibleScope, "ALL");
                    if (!grantedAppIds.isEmpty()) {
                        w.or().in(SysApplication::getId, grantedAppIds);
                    }
                })
                .orderByAsc(SysApplication::getSortNo));
    }

    private SysApplication requireApplication(Long applicationId) {
        SysApplication application = applicationMapper.selectById(applicationId);
        if (application == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "应用不存在: " + applicationId);
        }
        return application;
    }

    private void applyRequest(SysApplication application, ApplicationSaveRequest request) {
        application.setAppCode(request.getAppCode());
        application.setAppName(request.getAppName());
        application.setAppType(StringUtils.hasText(request.getAppType()) ? request.getAppType() : "INTERNAL");
        application.setEntryUrl(request.getEntryUrl());
        application.setIcon(request.getIcon());
        application.setAppCategory(request.getAppCategory());
        application.setVisibleScope(StringUtils.hasText(request.getVisibleScope())
                ? request.getVisibleScope() : "ALL");
        application.setSsoEnabled(request.getSsoEnabled() == null ? 0 : request.getSsoEnabled());
        application.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        application.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : "enabled");
        application.setOwner(request.getOwner());
        application.setDescription(request.getDescription());
        application.setRemark(request.getRemark());
    }
}
