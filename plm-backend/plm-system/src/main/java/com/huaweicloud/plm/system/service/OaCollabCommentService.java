package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.CollabCommentSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaCollabComment;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaOaCollabCommentMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

/**
 * 协同办公评论服务：面向各类业务对象的通用评论与回复。
 */
@Service
@RequiredArgsConstructor
public class OaCollabCommentService {

    private final OaOaCollabCommentMapper commentMapper;
    private final SysUserMapper userMapper;

    /** 业务对象评论列表：按创建时间升序。 */
    public List<OaOaCollabComment> list(String bizType, Long bizId) {
        return commentMapper.selectList(Wrappers.<OaOaCollabComment>lambdaQuery()
                .eq(StringUtils.hasText(bizType), OaOaCollabComment::getBizType, bizType)
                .eq(bizId != null, OaOaCollabComment::getBizId, bizId)
                .orderByAsc(OaOaCollabComment::getCreatedAt));
    }

    /** 发表评论：以当前登录用户为评论人。 */
    @Transactional
    public Long add(CollabCommentSaveRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        OaOaCollabComment comment = new OaOaCollabComment();
        comment.setBizType(request.getBizType());
        comment.setBizId(request.getBizId());
        comment.setContent(request.getContent());
        comment.setParentId(request.getParentId());
        comment.setAuthorUserId(userId);
        comment.setAuthorName(resolveDisplayName(userId));
        commentMapper.insert(comment);
        return comment.getId();
    }

    /** 删除评论：仅评论作者本人或具备通配权限的管理员可删。 */
    @Transactional
    public void delete(Long id) {
        OaOaCollabComment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在: " + id);
        }
        UserContext.Principal principal = UserContext.get();
        boolean admin = principal != null && principal.hasPermission("*");
        if (!admin && !Objects.equals(comment.getAuthorUserId(), UserContext.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "仅评论作者或管理员可删除评论");
        }
        commentMapper.deleteById(id);
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
