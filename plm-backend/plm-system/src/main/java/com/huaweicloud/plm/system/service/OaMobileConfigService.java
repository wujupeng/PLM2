package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MobileConfigQuery;
import com.huaweicloud.plm.system.dto.MobileConfigSaveRequest;
import com.huaweicloud.plm.system.dto.MobileWorkbenchResponse;
import com.huaweicloud.plm.system.entity.OaMailRecipient;
import com.huaweicloud.plm.system.entity.OaMobileConfig;
import com.huaweicloud.plm.system.entity.OaNotification;
import com.huaweicloud.plm.system.entity.OaTask;
import com.huaweicloud.plm.system.mapper.OaMailRecipientMapper;
import com.huaweicloud.plm.system.mapper.OaMobileConfigMapper;
import com.huaweicloud.plm.system.mapper.OaNotificationMapper;
import com.huaweicloud.plm.system.mapper.OaTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 移动端配置与工作台服务：菜单/策略等移动端配置的维护，以及工作台待办与未读汇总。
 */
@Service
@RequiredArgsConstructor
public class OaMobileConfigService {

    /** 配置状态：启用。 */
    public static final String STATUS_ENABLED = "ENABLED";

    /** 配置状态：停用。 */
    public static final String STATUS_DISABLED = "DISABLED";

    /** 配置类型：菜单。 */
    public static final String TYPE_MENU = "MENU";

    /** 配置类型：推送。 */
    public static final String TYPE_PUSH = "PUSH";

    /** 配置类型：策略。 */
    public static final String TYPE_POLICY = "POLICY";

    /** 移动端总开关配置键。 */
    private static final String CONFIG_MOBILE_ENABLED = "oa.mobile.enabled";

    /** 工作台菜单最大展示数量配置键。 */
    private static final String CONFIG_WORKBENCH_MAX_ITEMS = "oa.mobile.workbench.max.items";

    private static final int DEFAULT_WORKBENCH_MAX_ITEMS = 12;

    private final OaMobileConfigMapper mobileConfigMapper;
    private final OaTaskMapper taskMapper;
    private final OaNotificationMapper notificationMapper;
    private final OaMailRecipientMapper mailRecipientMapper;
    private final HrFlowSupport flowSupport;

    public PageResult<OaMobileConfig> page(MobileConfigQuery query) {
        Page<OaMobileConfig> page = query.toPage();
        mobileConfigMapper.selectPage(page, Wrappers.<OaMobileConfig>lambdaQuery()
                .eq(StringUtils.hasText(query.getConfigType()),
                        OaMobileConfig::getConfigType, query.getConfigType())
                .eq(StringUtils.hasText(query.getConfigStatus()),
                        OaMobileConfig::getConfigStatus, query.getConfigStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMobileConfig::getConfigKey, query.getKeyword()).or()
                        .like(OaMobileConfig::getConfigName, query.getKeyword()))
                .orderByAsc(OaMobileConfig::getSortNo)
                .orderByAsc(OaMobileConfig::getId));
        return PageResult.of(page);
    }

    /** 按配置类型查询启用状态的配置，未指定类型时返回全部启用配置。 */
    public List<OaMobileConfig> listEnabled(String configType) {
        return mobileConfigMapper.selectList(Wrappers.<OaMobileConfig>lambdaQuery()
                .eq(StringUtils.hasText(configType), OaMobileConfig::getConfigType, configType)
                .eq(OaMobileConfig::getConfigStatus, STATUS_ENABLED)
                .orderByAsc(OaMobileConfig::getSortNo)
                .orderByAsc(OaMobileConfig::getId));
    }

    /** 启用状态的移动端菜单。 */
    public List<OaMobileConfig> listMenus() {
        return listEnabled(TYPE_MENU);
    }

    @Transactional
    public Long create(MobileConfigSaveRequest request) {
        ensureUniqueKey(request.getConfigKey(), -1L);
        OaMobileConfig config = new OaMobileConfig();
        applyRequest(config, request);
        mobileConfigMapper.insert(config);
        return config.getId();
    }

    @Transactional
    public void update(Long id, MobileConfigSaveRequest request) {
        OaMobileConfig config = requireConfig(id);
        ensureUniqueKey(request.getConfigKey(), id);
        applyRequest(config, request);
        mobileConfigMapper.updateById(config);
    }

    @Transactional
    public void delete(Long id) {
        requireConfig(id);
        mobileConfigMapper.deleteById(id);
    }

    /** 移动端工作台：汇总菜单、策略、待办任务数与未读通知/邮件数。 */
    public MobileWorkbenchResponse workbench() {
        // 移动端总开关关闭时，仅具备通配权限的用户可访问。
        if (!flowSupport.configBoolean(CONFIG_MOBILE_ENABLED, true)) {
            UserContext.Principal principal = UserContext.get();
            if (principal == null || !principal.hasPermission("*")) {
                throw new BusinessException(ResultCode.FORBIDDEN, "移动端访问已停用");
            }
        }

        MobileWorkbenchResponse response = new MobileWorkbenchResponse();

        List<OaMobileConfig> menus = listMenus();
        int maxItems = flowSupport.configInt(CONFIG_WORKBENCH_MAX_ITEMS, DEFAULT_WORKBENCH_MAX_ITEMS);
        if (maxItems > 0 && menus.size() > maxItems) {
            menus = new ArrayList<>(menus.subList(0, maxItems));
        }
        response.setMenus(menus);
        response.setPolicies(listEnabled(TYPE_POLICY));

        Long userId = UserContext.getUserId();
        if (userId == null) {
            response.setPendingTaskCount(0L);
            response.setUnreadNotificationCount(0L);
            response.setUnreadMailCount(0L);
            return response;
        }

        response.setPendingTaskCount(taskMapper.selectCount(Wrappers.<OaTask>lambdaQuery()
                .eq(OaTask::getAssigneeUserId, userId)
                .eq(OaTask::getTaskStatus, WorkflowEngineService.TASK_PENDING)));
        response.setUnreadNotificationCount(notificationMapper.selectCount(Wrappers.<OaNotification>lambdaQuery()
                .eq(OaNotification::getReceiverUserId, userId)
                .eq(OaNotification::getReadFlag, 0)
                .eq(OaNotification::getArchivedFlag, 0)));
        response.setUnreadMailCount(mailRecipientMapper.selectCount(Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getRecipientUserId, userId)
                .eq(OaMailRecipient::getReadFlag, 0)
                .eq(OaMailRecipient::getDeletedFlag, 0)));
        return response;
    }

    private void applyRequest(OaMobileConfig config, MobileConfigSaveRequest request) {
        config.setConfigType(request.getConfigType());
        config.setConfigKey(request.getConfigKey());
        config.setConfigName(request.getConfigName());
        config.setConfigValue(request.getConfigValue());
        config.setIcon(request.getIcon());
        config.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        config.setConfigStatus(StringUtils.hasText(request.getConfigStatus())
                ? request.getConfigStatus() : STATUS_ENABLED);
        config.setRemark(request.getRemark());
    }

    private void ensureUniqueKey(String configKey, Long excludeId) {
        if (!StringUtils.hasText(configKey)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "配置键不能为空");
        }
        Long count = mobileConfigMapper.selectCount(Wrappers.<OaMobileConfig>lambdaQuery()
                .eq(OaMobileConfig::getConfigKey, configKey)
                .ne(OaMobileConfig::getId, excludeId));
        if (count != null && count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "配置键已存在: " + configKey);
        }
    }

    private OaMobileConfig requireConfig(Long id) {
        OaMobileConfig config = mobileConfigMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "移动端配置不存在: " + id);
        }
        return config;
    }
}
