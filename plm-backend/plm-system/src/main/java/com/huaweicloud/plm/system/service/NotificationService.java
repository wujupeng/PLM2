package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.NotificationBroadcastRequest;
import com.huaweicloud.plm.system.dto.NotificationQuery;
import com.huaweicloud.plm.system.entity.OaNotification;
import com.huaweicloud.plm.system.entity.OaNotifyTemplate;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaNotificationMapper;
import com.huaweicloud.plm.system.mapper.OaNotifyTemplateMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 统一消息中心服务：站内通知的查询、已读、归档与群发，以及按模板生成业务通知。
 * 站内渠道始终落库；邮件、移动推送与短信渠道受可配置开关控制，未启用渠道保留待发送状态以便追溯（IF-OA-07）。
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    public static final String TYPE_WORKFLOW = "WORKFLOW";
    public static final String TYPE_ANNOUNCEMENT = "ANNOUNCEMENT";
    public static final String TYPE_SYSTEM = "SYSTEM";
    public static final String TYPE_INTEGRATION = "INTEGRATION";
    public static final String TYPE_BUSINESS = "BUSINESS";

    public static final String CHANNEL_STATION = "STATION";
    public static final String CHANNEL_EMAIL = "EMAIL";
    public static final String CHANNEL_MOBILE = "MOBILE";
    public static final String CHANNEL_SMS = "SMS";
    public static final String CHANNEL_IM = "IM";

    public static final String SEND_PENDING = "PENDING";
    public static final String SEND_SENT = "SENT";
    public static final String SEND_FAILED = "FAILED";

    /** 与 oa_notify_template.template_code 对应的内置流程通知模板。 */
    public static final String TEMPLATE_WORKFLOW_TODO = "WORKFLOW_TODO";
    public static final String TEMPLATE_WORKFLOW_REJECT = "WORKFLOW_REJECT";
    public static final String TEMPLATE_WORKFLOW_CANCEL = "WORKFLOW_CANCEL";

    /** 通知关联的业务对象类型。 */
    public static final String BIZ_OA_TASK = "OA_TASK";
    public static final String BIZ_OA_PROCESS_INSTANCE = "OA_PROCESS_INSTANCE";

    private static final String PRIORITY_NORMAL = "NORMAL";
    private static final String STATUS_ENABLED = "enabled";

    private final OaNotificationMapper notificationMapper;
    private final OaNotifyTemplateMapper templateMapper;
    private final SysUserMapper userMapper;
    private final OaMailSupportService supportService;

    /** 消息中心列表：仅返回当前用户收到的通知。 */
    public PageResult<OaNotification> page(NotificationQuery query) {
        Long userId = currentUserId();
        Page<OaNotification> page = query.toPage();
        notificationMapper.selectPage(page, Wrappers.<OaNotification>lambdaQuery()
                .eq(OaNotification::getReceiverUserId, userId)
                .eq(StringUtils.hasText(query.getMessageType()),
                        OaNotification::getMessageType, query.getMessageType())
                .eq(StringUtils.hasText(query.getChannel()), OaNotification::getChannel, query.getChannel())
                .eq(StringUtils.hasText(query.getBizType()), OaNotification::getBizType, query.getBizType())
                .eq(query.getReadFlag() != null, OaNotification::getReadFlag, query.getReadFlag())
                .eq(query.getArchivedFlag() != null, OaNotification::getArchivedFlag, query.getArchivedFlag())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaNotification::getTitle, query.getKeyword()).or()
                        .like(OaNotification::getContent, query.getKeyword()))
                .orderByDesc(OaNotification::getId));
        return PageResult.of(page);
    }

    /** 未读消息数，用于门户与菜单角标。 */
    public long unreadCount() {
        return notificationMapper.selectCount(Wrappers.<OaNotification>lambdaQuery()
                .eq(OaNotification::getReceiverUserId, currentUserId())
                .eq(OaNotification::getReadFlag, 0)
                .eq(OaNotification::getArchivedFlag, 0));
    }

    public OaNotification detail(Long notificationId) {
        return requireOwned(notificationId);
    }

    public void markRead(Long notificationId, Integer readFlag) {
        OaNotification notification = requireOwned(notificationId);
        boolean read = readFlag == null || readFlag == 1;
        notification.setReadFlag(read ? 1 : 0);
        notification.setReadAt(read ? LocalDateTime.now() : null);
        notificationMapper.updateById(notification);
    }

    /** 全部标记已读：仅作用于当前用户的未读消息。 */
    @Transactional
    public int markAllRead() {
        return notificationMapper.update(null, Wrappers.<OaNotification>lambdaUpdate()
                .eq(OaNotification::getReceiverUserId, currentUserId())
                .eq(OaNotification::getReadFlag, 0)
                .set(OaNotification::getReadFlag, 1)
                .set(OaNotification::getReadAt, LocalDateTime.now()));
    }

    /** 归档/取消归档：不传状态时按归档处理，与接口语义保持一致。 */
    public void archive(Long notificationId, Integer archivedFlag) {
        OaNotification notification = requireOwned(notificationId);
        notification.setArchivedFlag(archivedFlag == null || archivedFlag == 1 ? 1 : 0);
        notificationMapper.updateById(notification);
    }

    /** 管理员群发站内通知。 */
    @Transactional
    public int broadcast(NotificationBroadcastRequest request) {
        List<Long> receivers = distinct(request.getReceiverUserIds());
        if (receivers.isEmpty()) {
            throw new BusinessException("接收人不能为空");
        }
        String channel = StringUtils.hasText(request.getChannel())
                ? request.getChannel().trim().toUpperCase()
                : supportService.config("oa.notify.template.default.channel", CHANNEL_STATION);
        int count = 0;
        for (Long receiverId : receivers) {
            OaNotification notification = newNotification(receiverId, request.getMessageType(), channel);
            notification.setTitle(request.getTitle());
            notification.setContent(request.getContent());
            notification.setLinkUrl(request.getLinkUrl());
            notification.setPriority(request.getPriority());
            notification.setTemplateCode(request.getTemplateCode());
            if (StringUtils.hasText(request.getRemark())) {
                notification.setRemark(request.getRemark());
            }
            notificationMapper.insert(notification);
            count++;
        }
        return count;
    }

    /**
     * 按模板生成通知：模板缺失或已停用时静默跳过，不阻断主业务。
     *
     * @param templateCode    通知模板编码
     * @param receiverUserIds 接收人
     * @param variables       模板变量，用于替换 ${变量名} 占位符
     * @param bizType         关联业务对象类型，例如 OA_TASK
     * @param bizId           关联业务对象主键
     * @param bizNo           关联业务对象编号
     * @param linkUrl         点击通知后的跳转地址
     * @return 实际生成的通知条数
     */
    @Transactional
    public int sendByTemplate(String templateCode, List<Long> receiverUserIds, Map<String, Object> variables,
                              String bizType, Long bizId, String bizNo, String linkUrl) {
        List<Long> receivers = distinct(receiverUserIds);
        if (receivers.isEmpty() || !StringUtils.hasText(templateCode)) {
            return 0;
        }
        OaNotifyTemplate template = templateMapper.selectOne(Wrappers.<OaNotifyTemplate>lambdaQuery()
                .eq(OaNotifyTemplate::getTemplateCode, templateCode)
                .eq(OaNotifyTemplate::getStatus, STATUS_ENABLED)
                .last("LIMIT 1"));
        if (template == null) {
            return 0;
        }
        Map<String, Object> vars = variables == null ? Collections.emptyMap() : variables;
        String channel = StringUtils.hasText(template.getChannel())
                ? template.getChannel().trim().toUpperCase()
                : supportService.config("oa.notify.template.default.channel", CHANNEL_STATION);
        int count = 0;
        for (Long receiverId : receivers) {
            OaNotification notification = newNotification(receiverId, template.getMessageType(), channel);
            notification.setTitle(render(template.getTitleTemplate(), vars, template.getTemplateName()));
            notification.setContent(render(template.getContentTemplate(), vars, null));
            notification.setTemplateCode(templateCode);
            notification.setBizType(bizType);
            notification.setBizId(bizId);
            notification.setBizNo(bizNo);
            notification.setLinkUrl(linkUrl);
            notificationMapper.insert(notification);
            count++;
        }
        return count;
    }

    /** 通道校验：短信与企业 IM 归属后续节点接入，当前统一按渠道开关判定。 */
    public boolean isChannelEnabled(String channel) {
        String code = StringUtils.hasText(channel) ? channel.trim().toUpperCase() : CHANNEL_STATION;
        if (CHANNEL_STATION.equals(code)) {
            return supportService.configBool("oa.notify.station.enabled", true);
        }
        if (CHANNEL_EMAIL.equals(code)) {
            return supportService.configBool("oa.notify.email.enabled", false);
        }
        if (CHANNEL_MOBILE.equals(code)) {
            return supportService.configBool("oa.notify.mobile.enabled", false);
        }
        return false;
    }

    /** 重试上限来自可配置项，供外发通道接入后控制失败重试次数。 */
    public int retryMax() {
        return supportService.configInt("oa.notify.retry.max", 3);
    }

    // ---------------- 内部实现 ----------------

    private OaNotification newNotification(Long receiverId, String messageType, String channel) {
        OaNotification notification = new OaNotification();
        notification.setNotificationNo(supportService.nextNo(
                supportService.config("oa.notify.no.prefix", "MSG-")));
        notification.setReceiverUserId(receiverId);
        notification.setReceiverName(resolveDisplayName(receiverId));
        notification.setMessageType(StringUtils.hasText(messageType)
                ? messageType.trim().toUpperCase() : TYPE_SYSTEM);
        notification.setChannel(StringUtils.hasText(channel)
                ? channel.trim().toUpperCase() : CHANNEL_STATION);
        notification.setPriority(PRIORITY_NORMAL);
        notification.setReadFlag(0);
        notification.setArchivedFlag(0);
        applySendStatus(notification);
        return notification;
    }

    /** 渠道已启用时直接记为已发送；未启用时保留待发送状态并说明原因，便于后续通道接入后重试。 */
    private void applySendStatus(OaNotification notification) {
        boolean deliverable = isChannelEnabled(notification.getChannel());
        notification.setSendStatus(deliverable ? SEND_SENT : SEND_PENDING);
        notification.setSentAt(deliverable ? LocalDateTime.now() : null);
        if (!deliverable) {
            notification.setRemark("渠道未启用（" + notification.getChannel()
                    + "），消息已落库，待通道接入后按 oa.notify.retry.max 重试");
        }
    }

    /** 模板渲染：将 ${变量名} 替换为传入变量值，未提供的变量保持原样便于排查。 */
    private String render(String template, Map<String, Object> variables, String fallback) {
        if (!StringUtils.hasText(template)) {
            return fallback;
        }
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            result = result.replace("${" + entry.getKey() + "}", String.valueOf(entry.getValue()));
        }
        return result;
    }

    private OaNotification requireOwned(Long notificationId) {
        OaNotification notification = notificationMapper.selectById(notificationId);
        if (notification == null || !Objects.equals(notification.getReceiverUserId(), currentUserId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "通知不存在: " + notificationId);
        }
        return notification;
    }

    private List<Long> distinct(List<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return Collections.emptyList();
        }
        return ids.stream().filter(Objects::nonNull).distinct().toList();
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }
}
