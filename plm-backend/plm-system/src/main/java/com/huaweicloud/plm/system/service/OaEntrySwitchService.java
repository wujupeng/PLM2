package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaEntrySwitchSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaEntrySwitch;
import com.huaweicloud.plm.system.mapper.OaEntrySwitchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 切换门户入口与身份（OA-DEV-116）：入口切换方案、DNS 生效、SSO 与移动端开关、切换结果维护。
 * DNS 缓存时间取自可配置项，便于按上线计划调整。
 */
@Service
@RequiredArgsConstructor
public class OaEntrySwitchService {

    private static final String TYPE_PORTAL = "PORTAL";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_DONE = "DONE";
    private static final String STATUS_ROLLBACK = "ROLLBACK";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaEntrySwitchMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaEntrySwitch> pageEntrySwitches(OaGoliveQuery query) {
        Page<OaEntrySwitch> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaEntrySwitch>lambdaQuery()
                .eq(StringUtils.hasText(query.getSwitchType()), OaEntrySwitch::getSwitchType, query.getSwitchType())
                .eq(StringUtils.hasText(query.getSwitchStatus()), OaEntrySwitch::getSwitchStatus, query.getSwitchStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaEntrySwitch::getSwitchNo, query.getKeyword()).or()
                        .like(OaEntrySwitch::getSwitchName, query.getKeyword()).or()
                        .like(OaEntrySwitch::getOldEntry, query.getKeyword()).or()
                        .like(OaEntrySwitch::getNewEntry, query.getKeyword()))
                .orderByDesc(OaEntrySwitch::getId));
        return PageResult.of(page);
    }

    public OaEntrySwitch detail(Long id) {
        return requireSwitch(id);
    }

    @Transactional
    public Long save(Long id, OaEntrySwitchSaveRequest request) {
        OaEntrySwitch entity;
        if (id == null) {
            entity = new OaEntrySwitch();
            entity.setSwitchNo(StringUtils.hasText(request.getSwitchNo())
                    ? request.getSwitchNo() : flowSupport.nextBizNo("ES"));
            entity.setSwitchType(StringUtils.hasText(request.getSwitchType())
                    ? request.getSwitchType() : TYPE_PORTAL);
            entity.setDnsTtlMinutes(request.getDnsTtlMinutes() != null
                    ? request.getDnsTtlMinutes() : flowSupport.configInt("oa.golive.dns.ttl.minutes", 10));
            entity.setSsoEnabled(request.getSsoEnabled() != null ? request.getSsoEnabled() : 1);
            entity.setMobileEnabled(request.getMobileEnabled() != null ? request.getMobileEnabled() : 1);
            entity.setSwitchStatus(StringUtils.hasText(request.getSwitchStatus())
                    ? request.getSwitchStatus() : STATUS_PENDING);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireSwitch(id);
            if (StringUtils.hasText(request.getSwitchNo())) {
                entity.setSwitchNo(request.getSwitchNo());
            }
            if (StringUtils.hasText(request.getSwitchType())) {
                entity.setSwitchType(request.getSwitchType());
            }
            if (request.getDnsTtlMinutes() != null) {
                entity.setDnsTtlMinutes(request.getDnsTtlMinutes());
            }
            if (request.getSsoEnabled() != null) {
                entity.setSsoEnabled(request.getSsoEnabled());
            }
            if (request.getMobileEnabled() != null) {
                entity.setMobileEnabled(request.getMobileEnabled());
            }
            if (StringUtils.hasText(request.getSwitchStatus())) {
                entity.setSwitchStatus(request.getSwitchStatus());
            }
        }
        entity.setSwitchName(request.getSwitchName());
        entity.setOldEntry(request.getOldEntry());
        entity.setNewEntry(request.getNewEntry());
        entity.setSwitchPlan(request.getSwitchPlan());
        entity.setSwitchTime(parseTimestamp(request.getSwitchTime()));
        entity.setVerifyResult(request.getVerifyResult());
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

    /** 执行入口切换：状态置为 DONE 并回写切换时间。 */
    @Transactional
    public OaEntrySwitch cutover(Long id) {
        OaEntrySwitch entity = requireSwitch(id);
        entity.setSwitchStatus(STATUS_DONE);
        entity.setSwitchTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 回滚入口切换：状态置为 ROLLBACK。 */
    @Transactional
    public OaEntrySwitch rollback(Long id) {
        OaEntrySwitch entity = requireSwitch(id);
        entity.setSwitchStatus(STATUS_ROLLBACK);
        mapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void delete(Long id) {
        requireSwitch(id);
        mapper.deleteById(id);
    }

    /** 切换门户入口与身份统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaEntrySwitch>lambdaQuery()
                .eq(OaEntrySwitch::getSwitchStatus, STATUS_PENDING)));
        result.put("done", mapper.selectCount(Wrappers.<OaEntrySwitch>lambdaQuery()
                .eq(OaEntrySwitch::getSwitchStatus, STATUS_DONE)));
        result.put("rollback", mapper.selectCount(Wrappers.<OaEntrySwitch>lambdaQuery()
                .eq(OaEntrySwitch::getSwitchStatus, STATUS_ROLLBACK)));
        result.put("ssoEnabledCount", mapper.selectCount(Wrappers.<OaEntrySwitch>lambdaQuery()
                .eq(OaEntrySwitch::getSsoEnabled, 1)));
        result.put("mobileEnabledCount", mapper.selectCount(Wrappers.<OaEntrySwitch>lambdaQuery()
                .eq(OaEntrySwitch::getMobileEnabled, 1)));
        result.put("dnsTtlMinutes", flowSupport.configInt("oa.golive.dns.ttl.minutes", 10));
        return result;
    }

    public OaEntrySwitch requireSwitch(Long id) {
        OaEntrySwitch entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "入口切换记录不存在: " + id);
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
