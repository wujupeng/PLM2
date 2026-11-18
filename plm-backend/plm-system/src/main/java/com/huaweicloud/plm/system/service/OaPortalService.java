package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.PortalApplicationItem;
import com.huaweicloud.plm.system.dto.PortalHomeResponse;
import com.huaweicloud.plm.system.dto.UserInfoResponse;
import com.huaweicloud.plm.system.entity.SysDelegation;
import com.huaweicloud.plm.system.mapper.SysDelegationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * OA 门户首页聚合服务：汇总登录用户信息、可见应用与代理授权概览。
 */
@Service
@RequiredArgsConstructor
public class OaPortalService {

    private final UserService userService;
    private final ApplicationService applicationService;
    private final SysDelegationMapper delegationMapper;

    public PortalHomeResponse home(Long userId) {
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到登录用户");
        }
        UserInfoResponse userInfo = userService.buildUserInfo(userId);

        PortalHomeResponse response = new PortalHomeResponse();
        response.setUserId(userInfo.getUserId());
        response.setUsername(userInfo.getUsername());
        response.setDisplayName(userInfo.getDisplayName());
        response.setRoles(userInfo.getRoles());
        response.setOrgId(userInfo.getOrgId());
        response.setOrganization(userInfo.getOrganization());
        response.setApplications(applicationService.listVisibleForUser(userId).stream()
                .map(application -> {
                    PortalApplicationItem item = new PortalApplicationItem();
                    item.setId(application.getId());
                    item.setAppCode(application.getAppCode());
                    item.setAppName(application.getAppName());
                    item.setAppType(application.getAppType());
                    item.setEntryUrl(application.getEntryUrl());
                    item.setIcon(application.getIcon());
                    item.setAppCategory(application.getAppCategory());
                    item.setSsoEnabled(application.getSsoEnabled());
                    return item;
                }).toList());
        response.setMyDelegationCount(delegationMapper.selectCount(Wrappers.<SysDelegation>lambdaQuery()
                .eq(SysDelegation::getDelegatorUserId, userId)
                .eq(SysDelegation::getDelegationStatus, "ACTIVE")));
        response.setDelegatedToMeCount(delegationMapper.selectCount(Wrappers.<SysDelegation>lambdaQuery()
                .eq(SysDelegation::getDelegateUserId, userId)
                .eq(SysDelegation::getDelegationStatus, "ACTIVE")));
        return response;
    }
}
