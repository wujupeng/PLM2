package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMigrationAttachmentSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationAttachmentTask;
import com.huaweicloud.plm.system.mapper.OaMigrationAttachmentTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 附件迁移任务（OA-DEV-099）：大文件分片、断点续传、哈希校验与失败重试。
 * 分片大小、最大重试次数与哈希算法均为可配置项；哈希不一致的任务标记失败待重试。
 */
@Service
@RequiredArgsConstructor
public class OaMigrationAttachmentService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_RUNNING = "RUNNING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_RETRYING = "RETRYING";

    private final OaMigrationAttachmentTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaMigrationAttachmentTask> page(OaMigrationQuery query) {
        Page<OaMigrationAttachmentTask> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(query.getBatchId() != null, OaMigrationAttachmentTask::getBatchId, query.getBatchId())
                .eq(StringUtils.hasText(query.getObjectCode()), OaMigrationAttachmentTask::getObjectCode, query.getObjectCode())
                .eq(StringUtils.hasText(query.getTransferStatus()), OaMigrationAttachmentTask::getTransferStatus, query.getTransferStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationAttachmentTask::getTaskNo, query.getKeyword()).or()
                        .like(OaMigrationAttachmentTask::getFileName, query.getKeyword()).or()
                        .like(OaMigrationAttachmentTask::getSourcePath, query.getKeyword()))
                .orderByDesc(OaMigrationAttachmentTask::getId));
        return PageResult.of(page);
    }

    public OaMigrationAttachmentTask detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizMigrationAttachmentSaveRequest request) {
        OaMigrationAttachmentTask entity;
        if (id == null) {
            entity = new OaMigrationAttachmentTask();
            entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                    ? request.getTaskNo() : flowSupport.nextBizNo("MAT"));
            entity.setTransferStatus(StringUtils.hasText(request.getTransferStatus())
                    ? request.getTransferStatus() : STATUS_PENDING);
            entity.setChunkDone(0);
            entity.setRetryCount(0);
            entity.setHashMatched(0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireEntity(id);
            if (StringUtils.hasText(request.getTaskNo())) {
                entity.setTaskNo(request.getTaskNo());
            }
        }
        entity.setBatchId(request.getBatchId());
        entity.setObjectCode(request.getObjectCode());
        entity.setSourcePath(request.getSourcePath());
        entity.setTargetPath(request.getTargetPath());
        entity.setFileName(StringUtils.hasText(request.getFileName())
                ? request.getFileName() : extractFileName(request.getSourcePath()));
        entity.setFileSize(request.getFileSize() == null ? 0L : request.getFileSize());
        entity.setFileType(StringUtils.hasText(request.getFileType())
                ? request.getFileType() : extractFileType(request.getFileName(), request.getSourcePath()));
        entity.setChunkTotal(request.getChunkTotal() == null || request.getChunkTotal() < 1 ? 1 : request.getChunkTotal());
        if (request.getChunkDone() != null) {
            entity.setChunkDone(request.getChunkDone());
        }
        entity.setFileHash(request.getFileHash());
        entity.setTargetHash(request.getTargetHash());
        entity.setRetryCount(request.getRetryCount() == null ? entity.getRetryCount() : request.getRetryCount());
        entity.setErrorMsg(request.getErrorMsg());
        if (StringUtils.hasText(request.getTransferStatus())) {
            entity.setTransferStatus(request.getTransferStatus());
        }
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireEntity(id);
        mapper.deleteById(id);
    }

    /** 断点续传：推进已完成分片，全部分片完成则置为运行完成（成功由哈希校验确认）。 */
    @Transactional
    public OaMigrationAttachmentTask advanceChunk(Long id) {
        OaMigrationAttachmentTask entity = requireEntity(id);
        if (STATUS_SUCCESS.equals(entity.getTransferStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "附件已迁移成功，无需继续续传");
        }
        int total = entity.getChunkTotal() == null || entity.getChunkTotal() < 1 ? 1 : entity.getChunkTotal();
        int done = (entity.getChunkDone() == null ? 0 : entity.getChunkDone()) + 1;
        if (done > total) {
            done = total;
        }
        entity.setChunkDone(done);
        entity.setTransferStatus(STATUS_RUNNING);
        entity.setTransferTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 哈希校验：源/目标哈希一致置成功，否则置失败待重试。 */
    @Transactional
    public OaMigrationAttachmentTask verify(Long id, String targetHash) {
        OaMigrationAttachmentTask entity = requireEntity(id);
        if (StringUtils.hasText(targetHash)) {
            entity.setTargetHash(targetHash);
        }
        boolean matched = StringUtils.hasText(entity.getFileHash())
                && entity.getFileHash().equalsIgnoreCase(entity.getTargetHash());
        entity.setHashMatched(matched ? 1 : 0);
        entity.setTransferStatus(matched ? STATUS_SUCCESS : STATUS_FAILED);
        if (!matched) {
            entity.setErrorMsg("哈希校验不一致，需重试");
        } else {
            entity.setErrorMsg(null);
            entity.setChunkDone(entity.getChunkTotal());
        }
        entity.setTransferTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 失败重试：超过最大重试次数抛 409。 */
    @Transactional
    public OaMigrationAttachmentTask retry(Long id) {
        OaMigrationAttachmentTask entity = requireEntity(id);
        if (STATUS_SUCCESS.equals(entity.getTransferStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "附件已迁移成功，无需重试");
        }
        int maxRetry = flowSupport.configInt("oa.migration.attachment.max.retry", 3);
        int retryCount = (entity.getRetryCount() == null ? 0 : entity.getRetryCount()) + 1;
        if (retryCount > maxRetry) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "附件迁移重试次数已达上限(" + maxRetry + ")，请人工介入处理: " + entity.getTaskNo());
        }
        entity.setRetryCount(retryCount);
        entity.setTransferStatus(STATUS_RETRYING);
        entity.setErrorMsg(null);
        mapper.updateById(entity);
        return entity;
    }

    /** 附件迁移统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(OaMigrationAttachmentTask::getTransferStatus, STATUS_PENDING)));
        result.put("running", mapper.selectCount(Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(OaMigrationAttachmentTask::getTransferStatus, STATUS_RUNNING)));
        result.put("success", mapper.selectCount(Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(OaMigrationAttachmentTask::getTransferStatus, STATUS_SUCCESS)));
        result.put("failed", mapper.selectCount(Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(OaMigrationAttachmentTask::getTransferStatus, STATUS_FAILED)));
        result.put("retrying", mapper.selectCount(Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(OaMigrationAttachmentTask::getTransferStatus, STATUS_RETRYING)));
        result.put("hashMismatch", mapper.selectCount(Wrappers.<OaMigrationAttachmentTask>lambdaQuery()
                .eq(OaMigrationAttachmentTask::getTransferStatus, STATUS_FAILED)
                .eq(OaMigrationAttachmentTask::getHashMatched, 0)));
        result.put("maxRetry", flowSupport.configInt("oa.migration.attachment.max.retry", 3));
        result.put("chunkSizeMb", flowSupport.configInt("oa.migration.attachment.chunk.size.mb", 10));
        result.put("hashAlgorithm", flowSupport.configString("oa.migration.attachment.hash.algorithm", "SHA-256"));
        return result;
    }

    public OaMigrationAttachmentTask requireEntity(Long id) {
        OaMigrationAttachmentTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "附件迁移任务不存在: " + id);
        }
        return entity;
    }

    private String extractFileName(String path) {
        if (!StringUtils.hasText(path)) {
            return null;
        }
        String normalized = path.replace('\\', '/');
        int idx = normalized.lastIndexOf('/');
        return idx >= 0 ? normalized.substring(idx + 1) : normalized;
    }

    private String extractFileType(String fileName, String path) {
        String name = StringUtils.hasText(fileName) ? fileName : path;
        if (!StringUtils.hasText(name)) {
            return null;
        }
        int idx = name.lastIndexOf('.');
        return idx >= 0 ? name.substring(idx + 1).toUpperCase() : null;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
