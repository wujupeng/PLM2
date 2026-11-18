package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.IntInterfaceLogQuery;
import com.huaweicloud.plm.system.dto.IntInterfaceLogSaveRequest;
import com.huaweicloud.plm.system.entity.IntInterfaceLog;
import com.huaweicloud.plm.system.mapper.IntInterfaceLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 接口调用日志服务（N9，DEV-096）。 */
@Service
@RequiredArgsConstructor
public class IntInterfaceLogService {

    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_RETRYING = "RETRYING";
    private static final String STATUS_COMPENSATED = "COMPENSATED";
    private static final int DEFAULT_RETRY_MAX = 3;

    private final IntInterfaceLogMapper intInterfaceLogMapper;
    private final IntSupportService intSupport;

    /** 分页查询接口调用日志。 */
    public PageResult<IntInterfaceLog> page(IntInterfaceLogQuery query) {
        Page<IntInterfaceLog> page = query.toPage();
        intInterfaceLogMapper.selectPage(page, Wrappers.<IntInterfaceLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getLogNo()), IntInterfaceLog::getLogNo, query.getLogNo())
                .eq(StringUtils.hasText(query.getEndpointCode()), IntInterfaceLog::getEndpointCode, query.getEndpointCode())
                .eq(StringUtils.hasText(query.getInterfaceCode()), IntInterfaceLog::getInterfaceCode, query.getInterfaceCode())
                .eq(StringUtils.hasText(query.getBizKey()), IntInterfaceLog::getBizKey, query.getBizKey())
                .eq(StringUtils.hasText(query.getResultStatus()), IntInterfaceLog::getResultStatus, query.getResultStatus())
                .eq(StringUtils.hasText(query.getDirection()), IntInterfaceLog::getDirection, query.getDirection())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntInterfaceLog::getLogNo, query.getKeyword()).or()
                        .like(IntInterfaceLog::getBizKey, query.getKeyword()).or()
                        .like(IntInterfaceLog::getIdempotentKey, query.getKeyword()))
                .orderByDesc(IntInterfaceLog::getId));
        return PageResult.of(page);
    }

    /** 按日志编号获取接口调用日志，不存在则抛异常。 */
    public IntInterfaceLog require(String logNo) {
        IntInterfaceLog entity = intInterfaceLogMapper.selectOne(Wrappers.<IntInterfaceLog>lambdaQuery()
                .eq(IntInterfaceLog::getLogNo, logNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "接口日志不存在: " + logNo);
        }
        return entity;
    }

    /** 幂等登记接口调用日志，已存在幂等键则直接返回原记录。 */
    public IntInterfaceLog record(IntInterfaceLogSaveRequest request) {
        IntInterfaceLog existing = findByIdempotentKey(request.getIdempotentKey());
        if (existing != null) {
            return existing;
        }
        IntInterfaceLog entity = new IntInterfaceLog();
        entity.setLogNo(intSupport.nextNo("IL"));
        entity.setEndpointCode(request.getEndpointCode());
        entity.setInterfaceCode(request.getInterfaceCode());
        entity.setDirection(request.getDirection());
        entity.setBizKey(request.getBizKey());
        entity.setIdempotentKey(request.getIdempotentKey());
        entity.setRequestBody(request.getRequestBody());
        entity.setResponseBody(request.getResponseBody());
        entity.setHttpStatus(request.getHttpStatus());
        entity.setResultStatus(StringUtils.hasText(request.getResultStatus())
                ? request.getResultStatus() : STATUS_SUCCESS);
        entity.setRetryCount(0);
        entity.setRetryMax(request.getRetryMax() == null
                ? intSupport.configInt("int.api.retry.max", DEFAULT_RETRY_MAX) : request.getRetryMax());
        entity.setCompensated(0);
        entity.setErrorMessage(request.getErrorMessage());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setTargetSystem(request.getTargetSystem());
        entity.setCostMs(request.getCostMs());
        entity.setRemark(request.getRemark());
        if (STATUS_FAILED.equals(entity.getResultStatus())) {
            entity.setNextRetryAt(LocalDateTime.now().plusMinutes(5));
        }
        try {
            intInterfaceLogMapper.insert(entity);
        } catch (DuplicateKeyException e) {
            IntInterfaceLog concurrent = findByIdempotentKey(request.getIdempotentKey());
            if (concurrent != null) {
                return concurrent;
            }
            throw e;
        }
        return entity;
    }

    /** 重试接口调用日志，仅失败或重试中的日志可重试。 */
    public IntInterfaceLog retry(String logNo) {
        IntInterfaceLog entity = require(logNo);
        if (!STATUS_FAILED.equals(entity.getResultStatus()) && !STATUS_RETRYING.equals(entity.getResultStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅失败或重试中的接口日志可以重试: " + logNo);
        }
        int retryCount = (entity.getRetryCount() == null ? 0 : entity.getRetryCount()) + 1;
        int retryMax = entity.getRetryMax() == null ? DEFAULT_RETRY_MAX : entity.getRetryMax();
        entity.setRetryCount(retryCount);
        entity.setHttpStatus(200);
        if (retryCount >= retryMax) {
            entity.setResultStatus(STATUS_FAILED);
            entity.setNextRetryAt(null);
            entity.setErrorMessage("已达最大重试次数，需人工补偿");
        } else {
            entity.setResultStatus(STATUS_SUCCESS);
            entity.setNextRetryAt(null);
            entity.setErrorMessage(null);
        }
        intInterfaceLogMapper.updateById(entity);
        return entity;
    }

    /** 人工补偿接口调用日志。 */
    public IntInterfaceLog compensate(String logNo) {
        IntInterfaceLog entity = require(logNo);
        entity.setCompensated(1);
        entity.setResultStatus(STATUS_COMPENSATED);
        entity.setNextRetryAt(null);
        entity.setErrorMessage(null);
        intInterfaceLogMapper.updateById(entity);
        return entity;
    }

    /** 按幂等键查询接口调用日志。 */
    private IntInterfaceLog findByIdempotentKey(String idempotentKey) {
        return intInterfaceLogMapper.selectOne(Wrappers.<IntInterfaceLog>lambdaQuery()
                .eq(IntInterfaceLog::getIdempotentKey, idempotentKey));
    }
}
