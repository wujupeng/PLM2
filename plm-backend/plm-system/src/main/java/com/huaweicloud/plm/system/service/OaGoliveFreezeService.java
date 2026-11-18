package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaGoliveFreezeSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaGoliveFreeze;
import com.huaweicloud.plm.system.mapper.OaGoliveFreezeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 冻结旧OA关键写入（OA-DEV-114）：冻结窗口、只读保留、应急预案与通知状态维护。
 * 冻结窗口时长取自可配置项，便于按上线计划调整。
 */
@Service
@RequiredArgsConstructor
public class OaGoliveFreezeService {

    private static final String TYPE_ALL = "ALL";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_RELEASED = "RELEASED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaGoliveFreezeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaGoliveFreeze> pageFreezes(OaGoliveQuery query) {
        Page<OaGoliveFreeze> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaGoliveFreeze>lambdaQuery()
                .eq(StringUtils.hasText(query.getFreezeType()), OaGoliveFreeze::getFreezeType, query.getFreezeType())
                .eq(StringUtils.hasText(query.getFreezeStatus()), OaGoliveFreeze::getFreezeStatus, query.getFreezeStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaGoliveFreeze::getFreezeNo, query.getKeyword()).or()
                        .like(OaGoliveFreeze::getFreezeName, query.getKeyword()).or()
                        .like(OaGoliveFreeze::getDutyPerson, query.getKeyword()))
                .orderByDesc(OaGoliveFreeze::getId));
        return PageResult.of(page);
    }

    public OaGoliveFreeze detail(Long id) {
        return requireFreeze(id);
    }

    @Transactional
    public Long save(Long id, OaGoliveFreezeSaveRequest request) {
        OaGoliveFreeze entity;
        if (id == null) {
            entity = new OaGoliveFreeze();
            entity.setFreezeNo(StringUtils.hasText(request.getFreezeNo())
                    ? request.getFreezeNo() : flowSupport.nextBizNo("GF"));
            entity.setFreezeType(StringUtils.hasText(request.getFreezeType())
                    ? request.getFreezeType() : TYPE_ALL);
            entity.setFreezeStatus(StringUtils.hasText(request.getFreezeStatus())
                    ? request.getFreezeStatus() : STATUS_PENDING);
            entity.setReadOnlyRetained(request.getReadOnlyRetained() != null ? request.getReadOnlyRetained() : 1);
            entity.setNoticePublished(request.getNoticePublished() != null ? request.getNoticePublished() : 0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireFreeze(id);
            if (StringUtils.hasText(request.getFreezeNo())) {
                entity.setFreezeNo(request.getFreezeNo());
            }
            if (StringUtils.hasText(request.getFreezeType())) {
                entity.setFreezeType(request.getFreezeType());
            }
            if (StringUtils.hasText(request.getFreezeStatus())) {
                entity.setFreezeStatus(request.getFreezeStatus());
            }
            if (request.getReadOnlyRetained() != null) {
                entity.setReadOnlyRetained(request.getReadOnlyRetained());
            }
            if (request.getNoticePublished() != null) {
                entity.setNoticePublished(request.getNoticePublished());
            }
        }
        entity.setFreezeName(request.getFreezeName());
        entity.setFreezeScope(request.getFreezeScope());
        entity.setFreezeStart(parseTimestamp(request.getFreezeStart()));
        entity.setFreezeEnd(parseTimestamp(request.getFreezeEnd()));
        entity.setEmergencyPlan(request.getEmergencyPlan());
        entity.setNoticeTime(parseTimestamp(request.getNoticeTime()));
        entity.setDutyPerson(request.getDutyPerson());
        entity.setOperatorName(request.getOperatorName());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 生效冻结：状态置为 ACTIVE，冻结开始时间为空时取当前时间。 */
    @Transactional
    public OaGoliveFreeze activate(Long id) {
        OaGoliveFreeze entity = requireFreeze(id);
        entity.setFreezeStatus(STATUS_ACTIVE);
        if (entity.getFreezeStart() == null) {
            entity.setFreezeStart(LocalDateTime.now());
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 解除冻结：状态置为 RELEASED，冻结结束时间为空时取当前时间。 */
    @Transactional
    public OaGoliveFreeze release(Long id) {
        OaGoliveFreeze entity = requireFreeze(id);
        entity.setFreezeStatus(STATUS_RELEASED);
        if (entity.getFreezeEnd() == null) {
            entity.setFreezeEnd(LocalDateTime.now());
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 发布冻结通知：回写通知状态与通知时间。 */
    @Transactional
    public OaGoliveFreeze notice(Long id) {
        OaGoliveFreeze entity = requireFreeze(id);
        entity.setNoticePublished(1);
        entity.setNoticeTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void delete(Long id) {
        requireFreeze(id);
        mapper.deleteById(id);
    }

    /** 冻结旧OA关键写入统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaGoliveFreeze>lambdaQuery()
                .eq(OaGoliveFreeze::getFreezeStatus, STATUS_PENDING)));
        result.put("active", mapper.selectCount(Wrappers.<OaGoliveFreeze>lambdaQuery()
                .eq(OaGoliveFreeze::getFreezeStatus, STATUS_ACTIVE)));
        result.put("released", mapper.selectCount(Wrappers.<OaGoliveFreeze>lambdaQuery()
                .eq(OaGoliveFreeze::getFreezeStatus, STATUS_RELEASED)));
        result.put("readOnlyRetained", mapper.selectCount(Wrappers.<OaGoliveFreeze>lambdaQuery()
                .eq(OaGoliveFreeze::getReadOnlyRetained, 1)));
        result.put("noticePublished", mapper.selectCount(Wrappers.<OaGoliveFreeze>lambdaQuery()
                .eq(OaGoliveFreeze::getNoticePublished, 1)));
        result.put("freezeWindowHours", flowSupport.configInt("oa.golive.freeze.window.hours", 12));
        return result;
    }

    public OaGoliveFreeze requireFreeze(Long id) {
        OaGoliveFreeze entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "冻结记录不存在: " + id);
        }
        return entity;
    }

    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
