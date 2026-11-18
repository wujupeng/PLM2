package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocCommentItem;
import com.huaweicloud.plm.system.dto.DocCommentSaveRequest;
import com.huaweicloud.plm.system.dto.NotificationBroadcastRequest;
import com.huaweicloud.plm.system.entity.OaDocComment;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaDocCommentMapper;
import com.huaweicloud.plm.system.mapper.OaDocumentMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 文档评论服务（OA-DEV-050）：支持针对指定版本与父评论的讨论，以及 @ 提醒站内通知。
 * 评论销毁采用逻辑删除，保留完整协作轨迹便于审计与导出。
 */
@Service
@RequiredArgsConstructor
public class OaDocCommentService {

    private static final String STATUS_ENABLED = "enabled";
    private static final int NOTIFY_TITLE_LIMIT = 60;

    private final OaDocCommentMapper commentMapper;
    private final OaDocumentMapper documentMapper;
    private final DocPermissionService permissionService;
    private final NotificationService notificationService;
    private final SysUserMapper userMapper;

    /** 文档评论列表：按时间正序，便于呈现讨论过程。 */
    public List<DocCommentItem> list(Long docId) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentReadable(doc);
        return commentMapper.selectList(Wrappers.<OaDocComment>lambdaQuery()
                        .eq(OaDocComment::getDocId, docId)
                        .orderByAsc(OaDocComment::getId))
                .stream().map(this::toItem).toList();
    }

    /** 发表评论：具备读权限即可评论，被 @ 的用户收到站内通知。 */
    @Transactional
    public Long create(Long docId, DocCommentSaveRequest request) {
        OaDocument doc = requireDocument(docId);
        permissionService.requireDocumentReadable(doc);
        validateParent(docId, request.getParentCommentId());
        OaDocComment comment = new OaDocComment();
        comment.setDocId(docId);
        comment.setVersionId(request.getVersionId());
        comment.setParentCommentId(request.getParentCommentId());
        comment.setContent(request.getContent());
        comment.setMentionUserIds(request.getMentionUserIds());
        Long authorId = permissionService.currentUserId();
        comment.setAuthorUserId(authorId);
        comment.setAuthorName(resolveDisplayName(authorId));
        comment.setStatus(STATUS_ENABLED);
        comment.setRemark(request.getRemark());
        commentMapper.insert(comment);
        notifyMentions(doc, comment);
        return comment.getId();
    }

    /** 删除评论：评论作者或具备文档管理权限者可删除。 */
    @Transactional
    public void delete(Long commentId) {
        OaDocComment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在: " + commentId);
        }
        OaDocument doc = requireDocument(comment.getDocId());
        boolean author = Objects.equals(comment.getAuthorUserId(), permissionService.currentUserId());
        if (!author) {
            permissionService.requireDocumentManage(doc);
        }
        commentMapper.deleteById(commentId);
    }

    public DocCommentItem toItem(OaDocComment comment) {
        DocCommentItem item = new DocCommentItem();
        item.setId(comment.getId());
        item.setDocId(comment.getDocId());
        item.setVersionId(comment.getVersionId());
        item.setParentCommentId(comment.getParentCommentId());
        item.setContent(comment.getContent());
        item.setMentionUserIds(comment.getMentionUserIds());
        item.setAuthorUserId(comment.getAuthorUserId());
        item.setAuthorName(comment.getAuthorName());
        item.setStatus(comment.getStatus());
        item.setCreatedAt(comment.getCreatedAt());
        return item;
    }

    // ---------------- 内部实现 ----------------

    private void validateParent(Long docId, Long parentCommentId) {
        if (parentCommentId == null) {
            return;
        }
        OaDocComment parent = commentMapper.selectById(parentCommentId);
        if (parent == null || !Objects.equals(parent.getDocId(), docId)) {
            throw new BusinessException("回复的父评论不存在或不属于该文档");
        }
    }

    /** @ 提醒：被 @ 的用户收到站内通知，渠道与模板复用统一消息中心，失败不阻断评论。 */
    private void notifyMentions(OaDocument doc, OaDocComment comment) {
        List<Long> receivers = parseIds(comment.getMentionUserIds());
        receivers.removeIf(id -> Objects.equals(id, comment.getAuthorUserId()));
        if (receivers.isEmpty()) {
            return;
        }
        NotificationBroadcastRequest request = new NotificationBroadcastRequest();
        request.setReceiverUserIds(receivers);
        request.setMessageType(NotificationService.TYPE_BUSINESS);
        request.setTitle("文档评论提到了你");
        request.setContent(comment.getContent().length() > NOTIFY_TITLE_LIMIT
                ? comment.getContent().substring(0, NOTIFY_TITLE_LIMIT) : comment.getContent());
        request.setLinkUrl("/oa/documents?docId=" + doc.getId());
        request.setRemark("文档「" + doc.getTitle() + "」评论 @ 提醒");
        notificationService.broadcast(request);
    }

    private List<Long> parseIds(String ids) {
        List<Long> result = new ArrayList<>();
        if (!StringUtils.hasText(ids)) {
            return result;
        }
        for (String part : ids.split(",")) {
            String value = part.trim();
            if (!value.isEmpty()) {
                try {
                    result.add(Long.valueOf(value));
                } catch (NumberFormatException ignored) {
                    // 忽略非法标识，避免单个异常值影响通知投递
                }
            }
        }
        return result;
    }

    private OaDocument requireDocument(Long docId) {
        OaDocument doc = documentMapper.selectById(docId);
        if (doc == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档不存在: " + docId);
        }
        return doc;
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
}
