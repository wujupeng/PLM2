package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MailDetailResponse;
import com.huaweicloud.plm.system.dto.MailItemResponse;
import com.huaweicloud.plm.system.dto.MailMessageQuery;
import com.huaweicloud.plm.system.dto.MailRecipientItem;
import com.huaweicloud.plm.system.dto.MailSendRequest;
import com.huaweicloud.plm.system.entity.OaMailMessage;
import com.huaweicloud.plm.system.entity.OaMailRecipient;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaMailMessageMapper;
import com.huaweicloud.plm.system.mapper.OaMailRecipientMapper;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 内部邮件服务：文件夹视图、写信（新建/回复/转发/草稿）、收件人状态、删除与移动。
 * 邮件权限按收发关系判定：发件人可见全部收件关系，收件人仅见自己且看不到密送对象。
 */
@Service
@RequiredArgsConstructor
public class MailMessageService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_SENT = "SENT";

    public static final String SEND_NEW = "NEW";
    public static final String SEND_REPLY = "REPLY";
    public static final String SEND_FORWARD = "FORWARD";

    public static final String TYPE_TO = "TO";
    public static final String TYPE_CC = "CC";
    public static final String TYPE_BCC = "BCC";

    private static final String PRIORITY_NORMAL = "NORMAL";
    /** 草稿态收件关系不落文件夹，避免出现在任何人的收件箱。 */
    private static final String FOLDER_UNASSIGNED = null;

    private static final int PREVIEW_LENGTH = 120;

    private final OaMailMessageMapper messageMapper;
    private final OaMailRecipientMapper recipientMapper;
    private final MailFolderService folderService;
    private final MailAttachmentService attachmentService;
    private final OaMailSupportService supportService;
    private final SysUserMapper userMapper;
    private final SysOrganizationMapper organizationMapper;

    /** 邮件列表：按文件夹维度区分发件人视图（已发送/草稿）与收件人视图（收件箱/星标/自定义/已删除）。 */
    public PageResult<MailItemResponse> page(MailMessageQuery query) {
        Long userId = currentUserId();
        String folderCode = normalizeFolder(query.getFolderCode());
        if (MailFolderService.CODE_SENT.equals(folderCode) || MailFolderService.CODE_DRAFT.equals(folderCode)) {
            return pageSenderSide(query, folderCode, userId);
        }
        return pageRecipientSide(query, folderCode, userId);
    }

    /** 收件箱未读邮件数，用于门户与消息角标。 */
    public long unreadCount() {
        Long userId = currentUserId();
        return recipientMapper.selectCount(Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getRecipientUserId, userId)
                .eq(OaMailRecipient::getFolderCode, MailFolderService.CODE_INBOX)
                .eq(OaMailRecipient::getReadFlag, 0)
                .eq(OaMailRecipient::getDeletedFlag, 0));
    }

    public MailDetailResponse detail(Long messageId) {
        Long userId = currentUserId();
        OaMailMessage message = requireMessage(messageId);
        OaMailRecipient mine = findMine(messageId, userId);
        boolean isSender = Objects.equals(message.getSenderUserId(), userId);
        if (!isSender && mine == null) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权查看该邮件");
        }

        MailDetailResponse response = new MailDetailResponse();
        response.setMessage(message);
        response.setRecipients(listRecipients(messageId, isSender, userId));
        response.setAttachments(attachmentService.listByMessage(messageId));
        response.setReadFlag(isSender ? 1 : mine.getReadFlag());
        response.setStarFlag(isSender ? message.getSenderStarFlag() : mine.getStarFlag());
        response.setFolderCode(isSender
                ? (STATUS_DRAFT.equals(message.getMessageStatus()) ? MailFolderService.CODE_DRAFT : MailFolderService.CODE_SENT)
                : mine.getFolderCode());
        return response;
    }

    /** 写信：新建、回复、转发、保存草稿与草稿转正共用同一入口。 */
    @Transactional
    public Long send(MailSendRequest request) {
        Long userId = currentUserId();
        boolean draft = Boolean.TRUE.equals(request.getDraftFlag());
        List<Long> toUsers = dedupe(request.getRecipientUserIds());
        List<Long> ccUsers = dedupe(request.getCcUserIds());
        List<Long> bccUsers = dedupe(request.getBccUserIds());
        if (!draft && toUsers.isEmpty() && ccUsers.isEmpty() && bccUsers.isEmpty()) {
            throw new BusinessException("发送邮件时至少需要填写一个收件人");
        }

        OaMailMessage message;
        if (request.getDraftId() != null) {
            message = requireSenderDraft(request.getDraftId(), userId);
        } else {
            message = new OaMailMessage();
            message.setMessageNo(supportService.nextNo(
                    supportService.config("oa.mail.message.no.prefix", "MAIL-")));
            message.setSenderUserId(userId);
            message.setSenderName(resolveDisplayName(userId));
            message.setSenderDept(resolveDeptName(userId));
            message.setSenderStarFlag(0);
            message.setSenderDeletedFlag(0);
        }
        message.setSubject(StringUtils.hasText(request.getSubject()) ? request.getSubject() : "（无主题）");
        message.setContent(request.getContent());
        message.setPriority(StringUtils.hasText(request.getPriority()) ? request.getPriority() : PRIORITY_NORMAL);
        message.setSendType(StringUtils.hasText(request.getSendType()) ? request.getSendType() : SEND_NEW);
        message.setParentMessageId(request.getParentMessageId());
        message.setRemark(request.getRemark());
        message.setMessageStatus(draft ? STATUS_DRAFT : STATUS_SENT);
        if (!draft) {
            message.setSentAt(LocalDateTime.now());
        }
        if (request.getDraftId() != null) {
            messageMapper.updateById(message);
        } else {
            messageMapper.insert(message);
        }

        recipientMapper.delete(Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getMessageId, message.getId()));
        saveRecipients(message.getId(), toUsers, TYPE_TO, draft);
        saveRecipients(message.getId(), ccUsers, TYPE_CC, draft);
        saveRecipients(message.getId(), bccUsers, TYPE_BCC, draft);

        attachmentService.bindToMessage(request.getAttachmentIds(), message.getId(), userId);
        OaMailMessage flagUpdate = new OaMailMessage();
        flagUpdate.setId(message.getId());
        flagUpdate.setHasAttachment(attachmentService.countByMessage(message.getId()) > 0 ? 1 : 0);
        messageMapper.updateById(flagUpdate);
        return message.getId();
    }

    /** 标记已读/未读（仅收件人视角生效）。 */
    public void markRead(Long messageId, Integer readFlag) {
        Long userId = currentUserId();
        OaMailRecipient mine = findMine(messageId, userId);
        if (mine == null) {
            requireSenderMessage(messageId, userId);
            return;
        }
        boolean read = readFlag == null || readFlag == 1;
        mine.setReadFlag(read ? 1 : 0);
        mine.setReadAt(read ? LocalDateTime.now() : null);
        recipientMapper.updateById(mine);
    }

    /** 星标/取消星标：收件人视角改收件关系，发件人视角改邮件本身。 */
    public void markStar(Long messageId, Integer starFlag) {
        Long userId = currentUserId();
        int star = starFlag == null || starFlag == 1 ? 1 : 0;
        OaMailRecipient mine = findMine(messageId, userId);
        if (mine != null) {
            mine.setStarFlag(star);
            recipientMapper.updateById(mine);
            return;
        }
        OaMailMessage message = requireSenderMessage(messageId, userId);
        message.setSenderStarFlag(star);
        messageMapper.updateById(message);
    }

    /** 移动邮件到指定文件夹（仅收件人视角支持）。 */
    public void move(Long messageId, String folderCode) {
        Long userId = currentUserId();
        OaMailRecipient mine = findMine(messageId, userId);
        if (mine == null) {
            throw new BusinessException(ResultCode.FORBIDDEN, "已发送与草稿邮件不支持移动文件夹");
        }
        if (!folderService.isUsableFolder(folderCode, userId)) {
            throw new BusinessException("目标文件夹不存在或不可用: " + folderCode);
        }
        mine.setFolderCode(normalizeFolder(folderCode));
        mine.setDeletedFlag(0);
        recipientMapper.updateById(mine);
    }

    /** 删除邮件：收件人视角移入已删除文件夹，已在已删除时执行彻底删除；发件人视角标记删除。 */
    @Transactional
    public void delete(Long messageId) {
        Long userId = currentUserId();
        OaMailRecipient mine = findMine(messageId, userId);
        if (mine != null) {
            if (MailFolderService.CODE_TRASH.equals(mine.getFolderCode())) {
                recipientMapper.deleteById(mine);
            } else {
                mine.setFolderCode(MailFolderService.CODE_TRASH);
                recipientMapper.updateById(mine);
            }
            return;
        }
        OaMailMessage message = requireSenderMessage(messageId, userId);
        if (message.getSenderDeletedFlag() != null && message.getSenderDeletedFlag() == 1) {
            messageMapper.deleteById(messageId);
            return;
        }
        message.setSenderDeletedFlag(1);
        messageMapper.updateById(message);
    }

    // ---------------- 内部实现 ----------------

    private PageResult<MailItemResponse> pageSenderSide(MailMessageQuery query, String folderCode, Long userId) {
        boolean draft = MailFolderService.CODE_DRAFT.equals(folderCode);
        Page<OaMailMessage> page = query.toPage();
        messageMapper.selectPage(page, Wrappers.<OaMailMessage>lambdaQuery()
                .eq(OaMailMessage::getSenderUserId, userId)
                .eq(OaMailMessage::getMessageStatus, draft ? STATUS_DRAFT : STATUS_SENT)
                .eq(OaMailMessage::getSenderDeletedFlag, 0)
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMailMessage::getSubject, query.getKeyword()).or()
                        .like(OaMailMessage::getContent, query.getKeyword()))
                .and(StringUtils.hasText(query.getSenderKeyword()), w -> w
                        .like(OaMailMessage::getSenderName, query.getSenderKeyword()).or()
                        .like(OaMailMessage::getSenderDept, query.getSenderKeyword()))
                .eq(StringUtils.hasText(query.getPriority()), OaMailMessage::getPriority, query.getPriority())
                .eq(query.getHasAttachment() != null, OaMailMessage::getHasAttachment, query.getHasAttachment())
                .ge(StringUtils.hasText(query.getStartDate()), OaMailMessage::getSentAt,
                        startOfDay(query.getStartDate()))
                .lt(StringUtils.hasText(query.getEndDate()), OaMailMessage::getSentAt,
                        startOfNextDay(query.getEndDate()))
                .eq(query.getStarFlag() != null && query.getStarFlag() == 1, OaMailMessage::getSenderStarFlag, 1)
                .orderByDesc(draft ? OaMailMessage::getId : OaMailMessage::getSentAt)
                .orderByDesc(OaMailMessage::getId));

        List<OaMailMessage> records = page.getRecords();
        Map<Long, List<OaMailRecipient>> recipientMap = loadRecipients(
                records.stream().map(OaMailMessage::getId).toList());
        List<MailItemResponse> items = new ArrayList<>();
        for (OaMailMessage message : records) {
            MailItemResponse item = baseItem(message);
            item.setReadFlag(1);
            item.setStarFlag(message.getSenderStarFlag());
            item.setFolderCode(draft ? MailFolderService.CODE_DRAFT : MailFolderService.CODE_SENT);
            item.setRecipientSummary(summarize(recipientMap.get(message.getId())));
            items.add(item);
        }
        return new PageResult<>(items, page.getTotal(), page.getCurrent(), page.getSize());
    }

    private PageResult<MailItemResponse> pageRecipientSide(MailMessageQuery query, String folderCode, Long userId) {
        List<Long> matchedMessageIds = null;
        if (hasMessageFilter(query)) {
            matchedMessageIds = messageIdsByFilter(query);
            if (matchedMessageIds.isEmpty()) {
                return PageResult.empty(query.normalizedPageNum(), query.normalizedPageSize());
            }
        }

        Page<OaMailRecipient> page = query.toPage();
        boolean starredView = MailFolderService.CODE_STARRED.equals(folderCode);
        recipientMapper.selectPage(page, Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getRecipientUserId, userId)
                .eq(OaMailRecipient::getDeletedFlag, 0)
                .eq(!starredView, OaMailRecipient::getFolderCode, folderCode)
                .eq(starredView, OaMailRecipient::getStarFlag, 1)
                .eq(query.getReadFlag() != null, OaMailRecipient::getReadFlag, query.getReadFlag())
                .eq(query.getStarFlag() != null, OaMailRecipient::getStarFlag, query.getStarFlag())
                .in(matchedMessageIds != null, OaMailRecipient::getMessageId, matchedMessageIds)
                .orderByDesc(OaMailRecipient::getId));

        List<OaMailRecipient> recipients = page.getRecords();
        Map<Long, OaMailMessage> messages = loadMessages(
                recipients.stream().map(OaMailRecipient::getMessageId).toList());
        Map<Long, List<OaMailRecipient>> recipientMap = loadRecipients(
                recipients.stream().map(OaMailRecipient::getMessageId).distinct().toList());

        List<MailItemResponse> items = new ArrayList<>();
        for (OaMailRecipient recipient : recipients) {
            OaMailMessage message = messages.get(recipient.getMessageId());
            // 草稿态邮件不进入任何人的收件箱，此处做一层兜底过滤。
            if (message == null || !STATUS_SENT.equals(message.getMessageStatus())) {
                continue;
            }
            MailItemResponse item = baseItem(message);
            item.setReadFlag(recipient.getReadFlag());
            item.setStarFlag(recipient.getStarFlag());
            item.setFolderCode(recipient.getFolderCode());
            item.setRecipientSummary(summarize(recipientMap.get(recipient.getMessageId())));
            items.add(item);
        }
        return new PageResult<>(items, page.getTotal(), page.getCurrent(), page.getSize());
    }

    private boolean hasMessageFilter(MailMessageQuery query) {
        return StringUtils.hasText(query.getKeyword())
                || StringUtils.hasText(query.getSenderKeyword())
                || StringUtils.hasText(query.getPriority())
                || query.getHasAttachment() != null
                || StringUtils.hasText(query.getStartDate())
                || StringUtils.hasText(query.getEndDate());
    }

    private List<Long> messageIdsByFilter(MailMessageQuery query) {
        return messageMapper.selectList(Wrappers.<OaMailMessage>lambdaQuery()
                        .eq(OaMailMessage::getMessageStatus, STATUS_SENT)
                        .and(StringUtils.hasText(query.getKeyword()), w -> w
                                .like(OaMailMessage::getSubject, query.getKeyword()).or()
                                .like(OaMailMessage::getContent, query.getKeyword()))
                        .and(StringUtils.hasText(query.getSenderKeyword()), w -> w
                                .like(OaMailMessage::getSenderName, query.getSenderKeyword()).or()
                                .like(OaMailMessage::getSenderDept, query.getSenderKeyword()))
                        .eq(StringUtils.hasText(query.getPriority()), OaMailMessage::getPriority, query.getPriority())
                        .eq(query.getHasAttachment() != null, OaMailMessage::getHasAttachment, query.getHasAttachment())
                        .ge(StringUtils.hasText(query.getStartDate()), OaMailMessage::getSentAt,
                                startOfDay(query.getStartDate()))
                        .lt(StringUtils.hasText(query.getEndDate()), OaMailMessage::getSentAt,
                                startOfNextDay(query.getEndDate())))
                .stream().map(OaMailMessage::getId).toList();
    }

    private List<MailRecipientItem> listRecipients(Long messageId, boolean isSender, Long userId) {
        return recipientMapper.selectList(Wrappers.<OaMailRecipient>lambdaQuery()
                        .eq(OaMailRecipient::getMessageId, messageId)
                        .orderByAsc(OaMailRecipient::getRecipientType)
                        .orderByAsc(OaMailRecipient::getId))
                .stream()
                // 密送对象仅发件人与密送接收人本人可见。
                .filter(recipient -> !TYPE_BCC.equals(recipient.getRecipientType())
                        || isSender || Objects.equals(recipient.getRecipientUserId(), userId))
                .map(this::toRecipientItem)
                .toList();
    }

    private void saveRecipients(Long messageId, List<Long> userIds, String recipientType, boolean draft) {
        if (CollectionUtils.isEmpty(userIds)) {
            return;
        }
        for (Long userId : userIds) {
            OaMailRecipient recipient = new OaMailRecipient();
            recipient.setMessageId(messageId);
            recipient.setRecipientUserId(userId);
            recipient.setRecipientName(resolveDisplayName(userId));
            recipient.setRecipientType(recipientType);
            recipient.setReadFlag(0);
            recipient.setStarFlag(0);
            recipient.setDeletedFlag(0);
            recipient.setFolderCode(draft ? FOLDER_UNASSIGNED : MailFolderService.CODE_INBOX);
            recipientMapper.insert(recipient);
        }
    }

    private MailItemResponse baseItem(OaMailMessage message) {
        MailItemResponse item = new MailItemResponse();
        item.setMessageId(message.getId());
        item.setMessageNo(message.getMessageNo());
        item.setSubject(message.getSubject());
        item.setPreview(preview(message.getContent()));
        item.setPriority(message.getPriority());
        item.setMessageStatus(message.getMessageStatus());
        item.setSenderName(message.getSenderName());
        item.setSenderDept(message.getSenderDept());
        item.setHasAttachment(message.getHasAttachment());
        item.setSentAt(message.getSentAt());
        item.setCreatedAt(message.getCreatedAt());
        return item;
    }

    private MailRecipientItem toRecipientItem(OaMailRecipient recipient) {
        MailRecipientItem item = new MailRecipientItem();
        item.setRecipientId(recipient.getId());
        item.setRecipientUserId(recipient.getRecipientUserId());
        item.setRecipientName(recipient.getRecipientName());
        item.setRecipientType(recipient.getRecipientType());
        item.setReadFlag(recipient.getReadFlag());
        item.setReadAt(recipient.getReadAt());
        item.setStarFlag(recipient.getStarFlag());
        item.setDeletedFlag(recipient.getDeletedFlag());
        item.setFolderCode(recipient.getFolderCode());
        return item;
    }

    private Map<Long, OaMailMessage> loadMessages(List<Long> messageIds) {
        List<Long> ids = messageIds.stream().filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        return messageMapper.selectBatchIds(ids).stream()
                .collect(Collectors.toMap(OaMailMessage::getId, Function.identity(), (a, b) -> a));
    }

    private Map<Long, List<OaMailRecipient>> loadRecipients(List<Long> messageIds) {
        List<Long> ids = messageIds.stream().filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Long, List<OaMailRecipient>> result = new LinkedHashMap<>();
        for (OaMailRecipient recipient : recipientMapper.selectList(Wrappers.<OaMailRecipient>lambdaQuery()
                .in(OaMailRecipient::getMessageId, ids)
                .orderByAsc(OaMailRecipient::getId))) {
            result.computeIfAbsent(recipient.getMessageId(), key -> new ArrayList<>()).add(recipient);
        }
        return result;
    }

    /** 收件人显示串：收件人优先，其后为抄送，密送不计入。 */
    private String summarize(List<OaMailRecipient> recipients) {
        if (CollectionUtils.isEmpty(recipients)) {
            return null;
        }
        List<String> names = recipients.stream()
                .filter(recipient -> !TYPE_BCC.equals(recipient.getRecipientType()))
                .map(recipient -> StringUtils.hasText(recipient.getRecipientName())
                        ? recipient.getRecipientName() : String.valueOf(recipient.getRecipientUserId()))
                .distinct()
                .toList();
        return names.isEmpty() ? null : String.join("、", names);
    }

    private OaMailRecipient findMine(Long messageId, Long userId) {
        return recipientMapper.selectOne(Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getMessageId, messageId)
                .eq(OaMailRecipient::getRecipientUserId, userId)
                .last("LIMIT 1"));
    }

    private OaMailMessage requireMessage(Long messageId) {
        OaMailMessage message = messageMapper.selectById(messageId);
        if (message == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "邮件不存在: " + messageId);
        }
        return message;
    }

    private OaMailMessage requireSenderMessage(Long messageId, Long userId) {
        OaMailMessage message = requireMessage(messageId);
        if (!Objects.equals(message.getSenderUserId(), userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权操作该邮件");
        }
        return message;
    }

    private OaMailMessage requireSenderDraft(Long messageId, Long userId) {
        OaMailMessage message = requireSenderMessage(messageId, userId);
        if (!STATUS_DRAFT.equals(message.getMessageStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿邮件可编辑后重新发送");
        }
        return message;
    }

    private String normalizeFolder(String folderCode) {
        return StringUtils.hasText(folderCode)
                ? folderCode.trim().toUpperCase() : MailFolderService.CODE_INBOX;
    }

    private List<Long> dedupe(List<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return Collections.emptyList();
        }
        return ids.stream().filter(Objects::nonNull).distinct().toList();
    }

    /** 日期条件为空时不参与比较，避免对 null 做解析。 */
    private LocalDateTime startOfDay(String date) {
        return StringUtils.hasText(date) ? LocalDate.parse(date.trim()).atStartOfDay() : null;
    }

    private LocalDateTime startOfNextDay(String date) {
        return StringUtils.hasText(date) ? LocalDate.parse(date.trim()).plusDays(1).atStartOfDay() : null;
    }

    private String preview(String content) {
        if (!StringUtils.hasText(content)) {
            return null;
        }
        String plain = content.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
        return plain.length() > PREVIEW_LENGTH ? plain.substring(0, PREVIEW_LENGTH) + "..." : plain;
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

    private String resolveDeptName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null || user.getOrgId() == null) {
            return null;
        }
        SysOrganization organization = organizationMapper.selectById(user.getOrgId());
        return organization == null ? null : organization.getOrgName();
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }

    /** 保留：便于发送人批量解析姓名（供其他服务复用）。 */
    public List<String> resolveDisplayNames(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyList();
        }
        return Arrays.stream(userIds.toArray(new Long[0]))
                .map(this::resolveDisplayName)
                .toList();
    }
}
