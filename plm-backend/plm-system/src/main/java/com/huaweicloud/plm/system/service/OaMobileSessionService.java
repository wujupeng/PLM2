package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaMobileSession;
import com.huaweicloud.plm.system.mapper.OaMobileSessionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 移动后台与设备会话（OA-DEV-085）：移动端设备会话查询、注销与过期会话清理。
 * 会话令牌与推送通道由上游移动平台签发，OA 仅承载会话台账与管理动作。
 */
@Service
@RequiredArgsConstructor
public class OaMobileSessionService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_REVOKED = "REVOKED";
    private static final String STATUS_EXPIRED = "EXPIRED";

    private final OaMobileSessionMapper mapper;

    public PageResult<OaMobileSession> page(OaBizFlowQuery query) {
        Page<OaMobileSession> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaMobileSession>lambdaQuery()
                .eq(query.getOrgId() != null, OaMobileSession::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaMobileSession::getUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getFlowStatus()), OaMobileSession::getSessionStatus, query.getFlowStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMobileSession::getSessionNo, query.getKeyword()).or()
                        .like(OaMobileSession::getUserName, query.getKeyword()).or()
                        .like(OaMobileSession::getDeviceId, query.getKeyword()))
                .orderByDesc(OaMobileSession::getLastActiveTime)
                .orderByDesc(OaMobileSession::getId));
        return PageResult.of(page);
    }

    public OaMobileSession detail(Long id) {
        return requireEntity(id);
    }

    /** 查询某用户在线的会话。 */
    public List<OaMobileSession> listActiveByUser(Long userId) {
        return mapper.selectList(Wrappers.<OaMobileSession>lambdaQuery()
                .eq(OaMobileSession::getUserId, userId)
                .eq(OaMobileSession::getSessionStatus, STATUS_ACTIVE)
                .orderByDesc(OaMobileSession::getLastActiveTime));
    }

    /** 注销会话。 */
    @Transactional
    public void revoke(Long id, String reason) {
        OaMobileSession entity = requireEntity(id);
        if (!STATUS_ACTIVE.equals(entity.getSessionStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅在线会话可注销: " + entity.getSessionStatus());
        }
        entity.setSessionStatus(STATUS_REVOKED);
        entity.setRevokeReason(reason);
        mapper.updateById(entity);
    }

    /** 清理过期会话，返回清理条数。 */
    @Transactional
    public long expireOutdated() {
        return mapper.delete(Wrappers.<OaMobileSession>lambdaQuery()
                .eq(OaMobileSession::getSessionStatus, STATUS_ACTIVE)
                .isNotNull(OaMobileSession::getExpireTime)
                .lt(OaMobileSession::getExpireTime, LocalDateTime.now()));
    }

    public OaMobileSession requireEntity(Long id) {
        OaMobileSession entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "移动会话不存在: " + id);
        }
        return entity;
    }
}
