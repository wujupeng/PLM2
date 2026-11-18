package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysSsoProviderSaveRequest;
import com.huaweicloud.plm.system.entity.SysSsoProvider;
import com.huaweicloud.plm.system.mapper.SysSsoProviderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 单点登录提供商（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）：
 * SSO 提供商登记、发布/停用状态流转与统计。
 * 提供商编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysSsoProviderService {

    private static final String DEFAULT_PROTOCOL = "OIDC";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysSsoProviderMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询 SSO 提供商：协议/提供商状态精确，关键字匹配提供商编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysSsoProvider> pageProviders(IamQuery query) {
        Page<SysSsoProvider> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysSsoProvider>lambdaQuery()
                .eq(StringUtils.hasText(query.getProtocol()),
                        SysSsoProvider::getProtocol, query.getProtocol())
                .eq(StringUtils.hasText(query.getProviderStatus()),
                        SysSsoProvider::getProviderStatus, query.getProviderStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysSsoProvider::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysSsoProvider::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysSsoProvider::getProviderCode, query.getKeyword()).or()
                        .like(SysSsoProvider::getProviderName, query.getKeyword()))
                .orderByDesc(SysSsoProvider::getId));
        return PageResult.of(page);
    }

    public SysSsoProvider detail(Long id) {
        return require(id);
    }

    /** 新增或更新 SSO 提供商：新增时回填默认协议与提供商状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysSsoProviderSaveRequest request) {
        SysSsoProvider entity;
        if (id == null) {
            entity = new SysSsoProvider();
            entity.setProviderCode(StringUtils.hasText(request.getProviderCode())
                    ? request.getProviderCode() : flowSupport.nextBizNo("SSO"));
            entity.setProtocol(DEFAULT_PROTOCOL);
            entity.setProviderStatus(STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getProviderCode())) {
                entity.setProviderCode(request.getProviderCode());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 发布：提供商状态置为 ACTIVE 并记录最近同步时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysSsoProvider publish(Long id) {
        SysSsoProvider entity = require(id);
        entity.setProviderStatus(STATUS_ACTIVE);
        entity.setLastSyncAt(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 停用：提供商状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysSsoProvider disable(Long id) {
        SysSsoProvider entity = require(id);
        entity.setProviderStatus(STATUS_DISABLED);
        mapper.updateById(entity);
        return entity;
    }

    /** 删除 SSO 提供商：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** SSO 提供商统计：按提供商状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", countBy(SysSsoProvider::getProviderStatus, STATUS_DRAFT));
        result.put("active", countBy(SysSsoProvider::getProviderStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysSsoProvider::getProviderStatus, STATUS_DISABLED));
        return result;
    }

    public SysSsoProvider require(Long id) {
        SysSsoProvider entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "单点登录提供商不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysSsoProvider entity, SysSsoProviderSaveRequest request) {
        if (StringUtils.hasText(request.getProviderName())) {
            entity.setProviderName(request.getProviderName());
        }
        if (StringUtils.hasText(request.getProtocol())) {
            entity.setProtocol(request.getProtocol());
        }
        if (StringUtils.hasText(request.getProtocolVer())) {
            entity.setProtocolVer(request.getProtocolVer());
        }
        if (StringUtils.hasText(request.getIssuer())) {
            entity.setIssuer(request.getIssuer());
        }
        if (StringUtils.hasText(request.getSsoUrl())) {
            entity.setSsoUrl(request.getSsoUrl());
        }
        if (StringUtils.hasText(request.getLogoutUrl())) {
            entity.setLogoutUrl(request.getLogoutUrl());
        }
        if (StringUtils.hasText(request.getMetadataUrl())) {
            entity.setMetadataUrl(request.getMetadataUrl());
        }
        if (StringUtils.hasText(request.getClientId())) {
            entity.setClientId(request.getClientId());
        }
        if (StringUtils.hasText(request.getCertificateAlgo())) {
            entity.setCertificateAlgo(request.getCertificateAlgo());
        }
        if (StringUtils.hasText(request.getProviderStatus())) {
            entity.setProviderStatus(request.getProviderStatus());
        }
        if (request.getLastSyncAt() != null) {
            entity.setLastSyncAt(request.getLastSyncAt());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countBy(SFunction<SysSsoProvider, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysSsoProvider>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
