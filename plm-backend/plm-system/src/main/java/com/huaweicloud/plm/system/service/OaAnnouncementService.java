package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.AnnouncementQuery;
import com.huaweicloud.plm.system.dto.AnnouncementSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaAnnouncement;
import com.huaweicloud.plm.system.entity.OaOaAnnouncementRead;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaOaAnnouncementMapper;
import com.huaweicloud.plm.system.mapper.OaOaAnnouncementReadMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 协同办公公告服务：公告的草稿维护、发布、下线与已读回执。
 */
@Service
@RequiredArgsConstructor
public class OaAnnouncementService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";
    public static final String STATUS_OFFLINE = "OFFLINE";

    private static final String NO_PREFIX = "ANN";
    private static final String CONFIG_NEED_READ = "oa.collab.announcement.need.read";

    private final OaOaAnnouncementMapper announcementMapper;
    private final OaOaAnnouncementReadMapper announcementReadMapper;
    private final HrFlowSupport flowSupport;
    private final SysUserMapper userMapper;

    /** 公告分页：按分类、状态与关键词过滤，按主键倒序。 */
    public PageResult<OaOaAnnouncement> page(AnnouncementQuery query) {
        Page<OaOaAnnouncement> page = query.toPage();
        announcementMapper.selectPage(page, Wrappers.<OaOaAnnouncement>lambdaQuery()
                .eq(StringUtils.hasText(query.getCategory()), OaOaAnnouncement::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getPublishStatus()),
                        OaOaAnnouncement::getPublishStatus, query.getPublishStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOaAnnouncement::getTitle, query.getKeyword()).or()
                        .like(OaOaAnnouncement::getContent, query.getKeyword()))
                .orderByDesc(OaOaAnnouncement::getId));
        return PageResult.of(page);
    }

    public OaOaAnnouncement requireAnnouncement(Long id) {
        OaOaAnnouncement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "公告不存在: " + id);
        }
        return announcement;
    }

    public OaOaAnnouncement detail(Long id) {
        return requireAnnouncement(id);
    }

    /** 新建公告：默认草稿状态，需读标识缺省时取配置项。 */
    @Transactional
    public Long create(AnnouncementSaveRequest request) {
        OaOaAnnouncement announcement = new OaOaAnnouncement();
        applyRequest(announcement, request);
        announcement.setAnnouncementNo(flowSupport.nextNo(NO_PREFIX));
        announcement.setPublishStatus(STATUS_DRAFT);
        Long userId = UserContext.getUserId();
        announcement.setAuthorUserId(userId);
        announcement.setAuthorName(resolveDisplayName(userId));
        if (request.getNeedReadFlag() == null) {
            announcement.setNeedReadFlag(flowSupport.configBoolean(CONFIG_NEED_READ, false) ? 1 : 0);
        }
        announcementMapper.insert(announcement);
        return announcement.getId();
    }

    @Transactional
    public void update(Long id, AnnouncementSaveRequest request) {
        OaOaAnnouncement announcement = requireAnnouncement(id);
        applyRequest(announcement, request);
        announcementMapper.updateById(announcement);
    }

    /** 发布公告：置为已发布并记录发布时间。 */
    @Transactional
    public void publish(Long id) {
        OaOaAnnouncement announcement = requireAnnouncement(id);
        announcement.setPublishStatus(STATUS_PUBLISHED);
        announcement.setPublishAt(LocalDateTime.now());
        announcementMapper.updateById(announcement);
    }

    /** 下线公告：置为已下线。 */
    @Transactional
    public void offline(Long id) {
        OaOaAnnouncement announcement = requireAnnouncement(id);
        announcement.setPublishStatus(STATUS_OFFLINE);
        announcementMapper.updateById(announcement);
    }

    @Transactional
    public void delete(Long id) {
        requireAnnouncement(id);
        announcementMapper.deleteById(id);
    }

    /** 标记已读：同一用户同一公告只保留一条回执。 */
    @Transactional
    public void markRead(Long id) {
        requireAnnouncement(id);
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        long exists = announcementReadMapper.selectCount(Wrappers.<OaOaAnnouncementRead>lambdaQuery()
                .eq(OaOaAnnouncementRead::getAnnouncementId, id)
                .eq(OaOaAnnouncementRead::getUserId, userId));
        if (exists > 0) {
            return;
        }
        OaOaAnnouncementRead read = new OaOaAnnouncementRead();
        read.setAnnouncementId(id);
        read.setUserId(userId);
        read.setUserName(resolveDisplayName(userId));
        read.setReadAt(LocalDateTime.now());
        announcementReadMapper.insert(read);
    }

    /** 已读回执数量统计。 */
    public long readCount(Long id) {
        return announcementReadMapper.selectCount(Wrappers.<OaOaAnnouncementRead>lambdaQuery()
                .eq(OaOaAnnouncementRead::getAnnouncementId, id));
    }

    private void applyRequest(OaOaAnnouncement announcement, AnnouncementSaveRequest request) {
        announcement.setTitle(request.getTitle());
        announcement.setCategory(request.getCategory());
        announcement.setContent(request.getContent());
        announcement.setPublishScope(request.getPublishScope());
        announcement.setScopeValue(request.getScopeValue());
        announcement.setPublishAt(request.getPublishAt());
        announcement.setExpireAt(request.getExpireAt());
        announcement.setTopFlag(request.getTopFlag());
        announcement.setAttachmentJson(request.getAttachmentJson());
        announcement.setRemark(request.getRemark());
        if (request.getNeedReadFlag() != null) {
            announcement.setNeedReadFlag(request.getNeedReadFlag());
        }
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
