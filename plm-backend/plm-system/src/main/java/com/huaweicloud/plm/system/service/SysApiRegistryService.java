package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysApiRegistrySaveRequest;
import com.huaweicloud.plm.system.entity.SysApiRegistry;
import com.huaweicloud.plm.system.mapper.SysApiRegistryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 接口注册中心（G1-N1 集成平台 T009）：接口契约登记、发布/废弃/下线状态流转与统计。
 * 接口编码前缀、默认超时与 SLA 均为可配置项，便于按集成计划调整。
 */
@Service
@RequiredArgsConstructor
public class SysApiRegistryService {

    private static final String DIRECTION_IN = "IN";
    private static final String DIRECTION_OUT = "OUT";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DEPRECATED = "DEPRECATED";
    private static final String STATUS_OFFLINE = "OFFLINE";

    private final SysApiRegistryMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<SysApiRegistry> pageApis(IntegrationQuery query) {
        Page<SysApiRegistry> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(StringUtils.hasText(query.getSystemCode()), SysApiRegistry::getSystemCode, query.getSystemCode())
                .eq(StringUtils.hasText(query.getDirection()), SysApiRegistry::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getApiStatus()), SysApiRegistry::getApiStatus, query.getApiStatus())
                .ge(query.getStartDate() != null, SysApiRegistry::getCreatedAt, OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(query.getEndDate() != null, SysApiRegistry::getCreatedAt, OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApiRegistry::getApiCode, query.getKeyword()).or()
                        .like(SysApiRegistry::getApiName, query.getKeyword()).or()
                        .like(SysApiRegistry::getUrlPath, query.getKeyword()))
                .orderByDesc(SysApiRegistry::getId));
        return PageResult.of(page);
    }

    public SysApiRegistry detail(Long id) {
        return requireApi(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApiRegistrySaveRequest request) {
        SysApiRegistry entity;
        if (id == null) {
            entity = new SysApiRegistry();
            entity.setApiCode(StringUtils.hasText(request.getApiCode())
                    ? request.getApiCode() : flowSupport.nextBizNo("API"));
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DIRECTION_OUT);
            entity.setProtocol(StringUtils.hasText(request.getProtocol())
                    ? request.getProtocol() : "HTTP");
            entity.setAuthType(StringUtils.hasText(request.getAuthType())
                    ? request.getAuthType() : "JWT");
            entity.setApiVersion(StringUtils.hasText(request.getApiVersion())
                    ? request.getApiVersion() : "v1");
            entity.setApiStatus(StringUtils.hasText(request.getApiStatus())
                    ? request.getApiStatus() : STATUS_DRAFT);
            entity.setTimeoutMs(request.getTimeoutMs() != null ? request.getTimeoutMs() : 5000);
            entity.setSlaMs(request.getSlaMs() != null ? request.getSlaMs() : 2000);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireApi(id);
            if (StringUtils.hasText(request.getApiCode())) {
                entity.setApiCode(request.getApiCode());
            }
            if (StringUtils.hasText(request.getDirection())) {
                entity.setDirection(request.getDirection());
            }
            if (StringUtils.hasText(request.getProtocol())) {
                entity.setProtocol(request.getProtocol());
            }
            if (StringUtils.hasText(request.getAuthType())) {
                entity.setAuthType(request.getAuthType());
            }
            if (StringUtils.hasText(request.getApiVersion())) {
                entity.setApiVersion(request.getApiVersion());
            }
            if (StringUtils.hasText(request.getApiStatus())) {
                entity.setApiStatus(request.getApiStatus());
            }
            if (request.getTimeoutMs() != null) {
                entity.setTimeoutMs(request.getTimeoutMs());
            }
            if (request.getSlaMs() != null) {
                entity.setSlaMs(request.getSlaMs());
            }
        }
        entity.setApiName(request.getApiName());
        entity.setSystemCode(request.getSystemCode());
        entity.setHttpMethod(request.getHttpMethod());
        entity.setUrlPath(request.getUrlPath());
        entity.setOwnerName(request.getOwnerName());
        entity.setDescription(request.getDescription());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 发布接口：状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApiRegistry publish(Long id) {
        return changeStatus(id, STATUS_ACTIVE);
    }

    /** 废弃接口：状态置为 DEPRECATED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApiRegistry deprecate(Long id) {
        return changeStatus(id, STATUS_DEPRECATED);
    }

    /** 下线接口：状态置为 OFFLINE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApiRegistry offline(Long id) {
        return changeStatus(id, STATUS_OFFLINE);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireApi(id);
        mapper.deleteById(id);
    }

    /** 接口注册中心统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", mapper.selectCount(Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(SysApiRegistry::getApiStatus, STATUS_DRAFT)));
        result.put("active", mapper.selectCount(Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(SysApiRegistry::getApiStatus, STATUS_ACTIVE)));
        result.put("deprecated", mapper.selectCount(Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(SysApiRegistry::getApiStatus, STATUS_DEPRECATED)));
        result.put("offline", mapper.selectCount(Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(SysApiRegistry::getApiStatus, STATUS_OFFLINE)));
        result.put("inCount", mapper.selectCount(Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(SysApiRegistry::getDirection, DIRECTION_IN)));
        result.put("outCount", mapper.selectCount(Wrappers.<SysApiRegistry>lambdaQuery()
                .eq(SysApiRegistry::getDirection, DIRECTION_OUT)));
        return result;
    }

    public SysApiRegistry requireApi(Long id) {
        SysApiRegistry entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "接口注册不存在: " + id);
        }
        return entity;
    }

    private SysApiRegistry changeStatus(Long id, String status) {
        SysApiRegistry entity = requireApi(id);
        entity.setApiStatus(status);
        mapper.updateById(entity);
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
