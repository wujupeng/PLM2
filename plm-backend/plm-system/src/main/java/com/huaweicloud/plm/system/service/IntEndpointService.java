package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.IntEndpointQuery;
import com.huaweicloud.plm.system.dto.IntEndpointSaveRequest;
import com.huaweicloud.plm.system.entity.IntEndpoint;
import com.huaweicloud.plm.system.mapper.IntEndpointMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/** 接口配置服务（N9，DEV-096）。 */
@Service
@RequiredArgsConstructor
public class IntEndpointService {

    private static final String DEFAULT_DIRECTION = "OUTBOUND";
    private static final String DEFAULT_PROTOCOL = "REST";
    private static final String DEFAULT_STATUS = "enabled";
    private static final int DEFAULT_RETRY_MAX = 3;

    private final IntEndpointMapper intEndpointMapper;
    private final IntSupportService intSupport;

    /** 分页查询接口配置。 */
    public PageResult<IntEndpoint> page(IntEndpointQuery query) {
        Page<IntEndpoint> page = query.toPage();
        intEndpointMapper.selectPage(page, Wrappers.<IntEndpoint>lambdaQuery()
                .eq(StringUtils.hasText(query.getEndpointCode()), IntEndpoint::getEndpointCode, query.getEndpointCode())
                .eq(StringUtils.hasText(query.getDomain()), IntEndpoint::getDomain, query.getDomain())
                .eq(StringUtils.hasText(query.getDirection()), IntEndpoint::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getProtocol()), IntEndpoint::getProtocol, query.getProtocol())
                .eq(StringUtils.hasText(query.getStatus()), IntEndpoint::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntEndpoint::getEndpointCode, query.getKeyword()).or()
                        .like(IntEndpoint::getEndpointName, query.getKeyword()))
                .orderByDesc(IntEndpoint::getId));
        return PageResult.of(page);
    }

    /** 查询启用状态的接口配置列表。 */
    public List<IntEndpoint> listEnabled() {
        return intEndpointMapper.selectList(Wrappers.<IntEndpoint>lambdaQuery()
                .eq(IntEndpoint::getStatus, DEFAULT_STATUS)
                .orderByAsc(IntEndpoint::getDomain));
    }

    /** 按接口编码获取接口配置，不存在则抛异常。 */
    public IntEndpoint require(String endpointCode) {
        IntEndpoint entity = intEndpointMapper.selectOne(Wrappers.<IntEndpoint>lambdaQuery()
                .eq(IntEndpoint::getEndpointCode, endpointCode));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "接口配置不存在: " + endpointCode);
        }
        return entity;
    }

    /** 新增接口配置，返回接口编码。 */
    public String create(IntEndpointSaveRequest request) {
        IntEndpoint entity = new IntEndpoint();
        entity.setEndpointCode(StringUtils.hasText(request.getEndpointCode())
                ? request.getEndpointCode() : intSupport.nextNo("IEP"));
        applyFields(entity, request);
        intEndpointMapper.insert(entity);
        return entity.getEndpointCode();
    }

    /** 更新接口配置。 */
    public void update(String endpointCode, IntEndpointSaveRequest request) {
        IntEndpoint entity = require(endpointCode);
        applyFields(entity, request);
        intEndpointMapper.updateById(entity);
    }

    /** 删除接口配置。 */
    public void delete(String endpointCode) {
        IntEndpoint entity = require(endpointCode);
        intEndpointMapper.deleteById(entity.getId());
    }

    /** 将请求字段写入实体，空值取默认值。 */
    private void applyFields(IntEndpoint entity, IntEndpointSaveRequest request) {
        entity.setEndpointName(request.getEndpointName());
        entity.setDomain(request.getDomain());
        entity.setDirection(StringUtils.hasText(request.getDirection())
                ? request.getDirection() : DEFAULT_DIRECTION);
        entity.setProtocol(StringUtils.hasText(request.getProtocol())
                ? request.getProtocol() : DEFAULT_PROTOCOL);
        entity.setEndpointUrl(request.getEndpointUrl());
        entity.setAuthType(request.getAuthType());
        entity.setTimeoutMs(request.getTimeoutMs());
        entity.setRetryMax(request.getRetryMax() == null ? DEFAULT_RETRY_MAX : request.getRetryMax());
        entity.setIdempotentEnabled(request.getIdempotentEnabled() == null ? 1 : request.getIdempotentEnabled());
        entity.setCompensateEnabled(request.getCompensateEnabled() == null ? 1 : request.getCompensateEnabled());
        entity.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus() : DEFAULT_STATUS);
        entity.setRemark(request.getRemark());
    }
}
