package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntMasterDataDiffQuery;
import com.huaweicloud.plm.system.dto.IntMasterDataDiffResolveRequest;
import com.huaweicloud.plm.system.dto.IntMasterDataSyncQuery;
import com.huaweicloud.plm.system.dto.IntMasterDataSyncSaveRequest;
import com.huaweicloud.plm.system.entity.IntMasterDataDiff;
import com.huaweicloud.plm.system.entity.IntMasterDataSync;
import com.huaweicloud.plm.system.mapper.IntMasterDataDiffMapper;
import com.huaweicloud.plm.system.mapper.IntMasterDataSyncMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 主数据同步服务（N9，DEV-095）。 */
@Service
@RequiredArgsConstructor
public class IntMasterDataSyncService {

    private static final String DEFAULT_SYNC_DIRECTION = "PLM_TO_ERP";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SYNCED = "SYNCED";
    private static final String STATUS_DIFF = "DIFF";
    private static final String DEFAULT_HANDLE_STATUS = "RESOLVED";

    private final IntMasterDataSyncMapper intMasterDataSyncMapper;
    private final IntMasterDataDiffMapper intMasterDataDiffMapper;
    private final IntSupportService intSupport;

    /** 分页查询主数据同步记录。 */
    public PageResult<IntMasterDataSync> page(IntMasterDataSyncQuery query) {
        Page<IntMasterDataSync> page = query.toPage();
        intMasterDataSyncMapper.selectPage(page, Wrappers.<IntMasterDataSync>lambdaQuery()
                .eq(StringUtils.hasText(query.getSyncNo()), IntMasterDataSync::getSyncNo, query.getSyncNo())
                .eq(StringUtils.hasText(query.getMasterType()), IntMasterDataSync::getMasterType, query.getMasterType())
                .eq(StringUtils.hasText(query.getMasterCode()), IntMasterDataSync::getMasterCode, query.getMasterCode())
                .eq(StringUtils.hasText(query.getSyncStatus()), IntMasterDataSync::getSyncStatus, query.getSyncStatus())
                .eq(StringUtils.hasText(query.getSyncDirection()), IntMasterDataSync::getSyncDirection, query.getSyncDirection())
                .eq(StringUtils.hasText(query.getTargetSystem()), IntMasterDataSync::getTargetSystem, query.getTargetSystem())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntMasterDataSync::getSyncNo, query.getKeyword()).or()
                        .like(IntMasterDataSync::getMasterCode, query.getKeyword()).or()
                        .like(IntMasterDataSync::getMasterName, query.getKeyword()))
                .orderByDesc(IntMasterDataSync::getId));
        return PageResult.of(page);
    }

    /** 按同步编号获取主数据同步记录，不存在则抛异常。 */
    public IntMasterDataSync require(String syncNo) {
        IntMasterDataSync entity = intMasterDataSyncMapper.selectOne(Wrappers.<IntMasterDataSync>lambdaQuery()
                .eq(IntMasterDataSync::getSyncNo, syncNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据同步记录不存在: " + syncNo);
        }
        return entity;
    }

    /** 新增主数据同步记录，返回同步编号。 */
    public String create(IntMasterDataSyncSaveRequest request) {
        IntMasterDataSync entity = new IntMasterDataSync();
        entity.setSyncNo(StringUtils.hasText(request.getSyncNo())
                ? request.getSyncNo() : intSupport.nextNo("MDS"));
        entity.setMasterType(request.getMasterType());
        entity.setMasterCode(request.getMasterCode());
        entity.setMasterName(request.getMasterName());
        entity.setMasterVersion(request.getMasterVersion());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setTargetSystem(request.getTargetSystem());
        entity.setSyncDirection(StringUtils.hasText(request.getSyncDirection())
                ? request.getSyncDirection() : DEFAULT_SYNC_DIRECTION);
        entity.setSyncStatus(STATUS_PENDING);
        entity.setSourceVersion(request.getSourceVersion());
        entity.setSourceHash(request.getSourceHash());
        entity.setDiffFlag(0);
        entity.setRetryCount(0);
        entity.setRemark(request.getRemark());
        intMasterDataSyncMapper.insert(entity);
        return entity.getSyncNo();
    }

    /** 更新主数据同步记录。 */
    public void update(String syncNo, IntMasterDataSyncSaveRequest request) {
        IntMasterDataSync entity = require(syncNo);
        entity.setMasterType(request.getMasterType());
        entity.setMasterCode(request.getMasterCode());
        entity.setMasterName(request.getMasterName());
        entity.setMasterVersion(request.getMasterVersion());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setTargetSystem(request.getTargetSystem());
        entity.setSyncDirection(StringUtils.hasText(request.getSyncDirection())
                ? request.getSyncDirection() : DEFAULT_SYNC_DIRECTION);
        entity.setSourceVersion(request.getSourceVersion());
        entity.setSourceHash(request.getSourceHash());
        entity.setRemark(request.getRemark());
        intMasterDataSyncMapper.updateById(entity);
    }

    /** 删除主数据同步记录。 */
    public void delete(String syncNo) {
        IntMasterDataSync entity = require(syncNo);
        intMasterDataSyncMapper.deleteById(entity.getId());
    }

    /** 执行主数据同步并回写同步结果。 */
    public IntMasterDataSync sync(String syncNo) {
        IntMasterDataSync entity = require(syncNo);
        entity.setLastSyncAt(LocalDateTime.now());
        if (StringUtils.hasText(entity.getSourceHash()) && entity.getSourceHash().equals(entity.getTargetHash())) {
            entity.setSyncStatus(STATUS_SYNCED);
            entity.setDiffFlag(0);
            entity.setTargetVersion(entity.getSourceVersion());
            entity.setTargetHash(entity.getSourceHash());
        } else {
            entity.setSyncStatus(STATUS_DIFF);
            entity.setDiffFlag(1);
            entity.setRetryCount((entity.getRetryCount() == null ? 0 : entity.getRetryCount()) + 1);
        }
        intMasterDataSyncMapper.updateById(entity);
        return entity;
    }

    /** 分页查询主数据差异。 */
    public PageResult<IntMasterDataDiff> diffPage(IntMasterDataDiffQuery query) {
        Page<IntMasterDataDiff> page = query.toPage();
        intMasterDataDiffMapper.selectPage(page, Wrappers.<IntMasterDataDiff>lambdaQuery()
                .eq(StringUtils.hasText(query.getSyncNo()), IntMasterDataDiff::getSyncNo, query.getSyncNo())
                .eq(StringUtils.hasText(query.getMasterType()), IntMasterDataDiff::getMasterType, query.getMasterType())
                .eq(StringUtils.hasText(query.getMasterCode()), IntMasterDataDiff::getMasterCode, query.getMasterCode())
                .eq(StringUtils.hasText(query.getDiffType()), IntMasterDataDiff::getDiffType, query.getDiffType())
                .eq(StringUtils.hasText(query.getHandleStatus()), IntMasterDataDiff::getHandleStatus, query.getHandleStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntMasterDataDiff::getSyncNo, query.getKeyword()).or()
                        .like(IntMasterDataDiff::getMasterCode, query.getKeyword()).or()
                        .like(IntMasterDataDiff::getFieldName, query.getKeyword()))
                .orderByDesc(IntMasterDataDiff::getId));
        return PageResult.of(page);
    }

    /** 处理主数据差异。 */
    public IntMasterDataDiff diffResolve(Long id, IntMasterDataDiffResolveRequest request) {
        IntMasterDataDiff entity = intMasterDataDiffMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据差异不存在: " + id);
        }
        entity.setHandleStatus(StringUtils.hasText(request.getHandleStatus())
                ? request.getHandleStatus() : DEFAULT_HANDLE_STATUS);
        entity.setResolution(request.getResolution());
        entity.setResolvedBy(UserContext.getUsername());
        entity.setResolvedAt(LocalDateTime.now());
        intMasterDataDiffMapper.updateById(entity);
        return entity;
    }
}
