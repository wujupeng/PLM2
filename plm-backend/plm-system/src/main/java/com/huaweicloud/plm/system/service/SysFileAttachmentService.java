package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileAttachmentSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileAttachment;
import com.huaweicloud.plm.system.mapper.SysFileAttachmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 统一附件（G1-N3 公共平台底座—统一文件服务 WBS T011）：附件统一登记、隔离/放行/归档状态流转与统计。
 * 附件编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFileAttachmentService {

    private static final String DEFAULT_STORAGE_TYPE = "OBJECT";
    private static final String DEFAULT_SECURITY_LEVEL = "INTERNAL";
    private static final String DEFAULT_SCAN_STATUS = "PENDING";
    private static final String DEFAULT_ARCHIVE_STATUS = "NONE";
    private static final String DEFAULT_FILE_STATUS = "NORMAL";
    private static final String STATUS_QUARANTINED = "QUARANTINED";
    private static final String STATUS_ARCHIVED = "ARCHIVED";
    private static final String STATUS_DELETED = "DELETED";
    private static final String SCAN_CLEAN = "CLEAN";
    private static final String SCAN_INFECTED = "INFECTED";

    private final SysFileAttachmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询统一附件：业务模块/类型/存储/密级/状态精确，关键字匹配编号/名称/原始文件名，时间区间作用于创建时间。 */
    public PageResult<SysFileAttachment> pageAttachments(FileQuery query) {
        Page<SysFileAttachment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFileAttachment>lambdaQuery()
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysFileAttachment::getBizModule, query.getBizModule())
                .eq(StringUtils.hasText(query.getBizType()),
                        SysFileAttachment::getBizType, query.getBizType())
                .eq(StringUtils.hasText(query.getStorageType()),
                        SysFileAttachment::getStorageType, query.getStorageType())
                .eq(StringUtils.hasText(query.getSecurityLevel()),
                        SysFileAttachment::getSecurityLevel, query.getSecurityLevel())
                .eq(StringUtils.hasText(query.getScanStatus()),
                        SysFileAttachment::getScanStatus, query.getScanStatus())
                .eq(StringUtils.hasText(query.getFileStatus()),
                        SysFileAttachment::getFileStatus, query.getFileStatus())
                .eq(StringUtils.hasText(query.getArchiveStatus()),
                        SysFileAttachment::getArchiveStatus, query.getArchiveStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysFileAttachment::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFileAttachment::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFileAttachment::getFileNo, query.getKeyword()).or()
                        .like(SysFileAttachment::getFileName, query.getKeyword()).or()
                        .like(SysFileAttachment::getOriginalName, query.getKeyword()))
                .orderByDesc(SysFileAttachment::getId));
        return PageResult.of(page);
    }

    public SysFileAttachment detail(Long id) {
        return require(id);
    }

    /** 新增或更新统一附件：新增时回填默认存储类型、密级、扫描状态与各项状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFileAttachmentSaveRequest request) {
        SysFileAttachment entity;
        if (id == null) {
            entity = new SysFileAttachment();
            entity.setFileNo(StringUtils.hasText(request.getFileNo())
                    ? request.getFileNo() : flowSupport.nextBizNo("FILE"));
            entity.setStorageType(DEFAULT_STORAGE_TYPE);
            entity.setSecurityLevel(DEFAULT_SECURITY_LEVEL);
            entity.setScanStatus(DEFAULT_SCAN_STATUS);
            entity.setPreviewSupported(0);
            entity.setArchiveStatus(DEFAULT_ARCHIVE_STATUS);
            entity.setFileStatus(DEFAULT_FILE_STATUS);
            entity.setFileSize(0L);
            entity.setRetentionYears(0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getFileNo())) {
                entity.setFileNo(request.getFileNo());
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

    /** 隔离文件：文件状态置为 QUARANTINED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileAttachment quarantine(Long id) {
        return changeFileStatus(id, STATUS_QUARANTINED);
    }

    /** 解除隔离：文件状态恢复为 NORMAL。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileAttachment release(Long id) {
        return changeFileStatus(id, DEFAULT_FILE_STATUS);
    }

    /** 标记归档：文件状态置为 ARCHIVED，归档状态同步置为 ARCHIVED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileAttachment markArchived(Long id) {
        SysFileAttachment entity = require(id);
        entity.setFileStatus(STATUS_ARCHIVED);
        entity.setArchiveStatus(STATUS_ARCHIVED);
        mapper.updateById(entity);
        return entity;
    }

    /** 删除附件：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 统一附件统计：按文件状态与扫描状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("normal", countBy(SysFileAttachment::getFileStatus, DEFAULT_FILE_STATUS));
        result.put("quarantined", countBy(SysFileAttachment::getFileStatus, STATUS_QUARANTINED));
        result.put("archived", countBy(SysFileAttachment::getFileStatus, STATUS_ARCHIVED));
        result.put("deleted", countBy(SysFileAttachment::getFileStatus, STATUS_DELETED));
        result.put("pendingScan", countBy(SysFileAttachment::getScanStatus, DEFAULT_SCAN_STATUS));
        result.put("infected", countBy(SysFileAttachment::getScanStatus, SCAN_INFECTED));
        return result;
    }

    public SysFileAttachment require(Long id) {
        SysFileAttachment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "统一附件不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFileAttachment entity, SysFileAttachmentSaveRequest request) {
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (StringUtils.hasText(request.getOriginalName())) {
            entity.setOriginalName(request.getOriginalName());
        }
        if (StringUtils.hasText(request.getFileExt())) {
            entity.setFileExt(request.getFileExt());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (StringUtils.hasText(request.getBizType())) {
            entity.setBizType(request.getBizType());
        }
        if (StringUtils.hasText(request.getBizId())) {
            entity.setBizId(request.getBizId());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
        }
        if (StringUtils.hasText(request.getStorageType())) {
            entity.setStorageType(request.getStorageType());
        }
        if (StringUtils.hasText(request.getStorageBucket())) {
            entity.setStorageBucket(request.getStorageBucket());
        }
        if (StringUtils.hasText(request.getObjectKey())) {
            entity.setObjectKey(request.getObjectKey());
        }
        if (request.getFileSize() != null) {
            entity.setFileSize(request.getFileSize());
        }
        if (StringUtils.hasText(request.getContentType())) {
            entity.setContentType(request.getContentType());
        }
        if (StringUtils.hasText(request.getChecksum())) {
            entity.setChecksum(request.getChecksum());
        }
        if (StringUtils.hasText(request.getSecurityLevel())) {
            entity.setSecurityLevel(request.getSecurityLevel());
        }
        if (StringUtils.hasText(request.getScanStatus())) {
            entity.setScanStatus(request.getScanStatus());
        }
        if (request.getPreviewSupported() != null) {
            entity.setPreviewSupported(request.getPreviewSupported());
        }
        if (StringUtils.hasText(request.getLatestVersionNo())) {
            entity.setLatestVersionNo(request.getLatestVersionNo());
        }
        if (StringUtils.hasText(request.getUploadBy())) {
            entity.setUploadBy(request.getUploadBy());
        }
        if (request.getUploadTime() != null) {
            entity.setUploadTime(request.getUploadTime());
        }
        if (request.getRetentionYears() != null) {
            entity.setRetentionYears(request.getRetentionYears());
        }
        if (StringUtils.hasText(request.getArchiveStatus())) {
            entity.setArchiveStatus(request.getArchiveStatus());
        }
        if (StringUtils.hasText(request.getFileStatus())) {
            entity.setFileStatus(request.getFileStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysFileAttachment changeFileStatus(Long id, String fileStatus) {
        SysFileAttachment entity = require(id);
        entity.setFileStatus(fileStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysFileAttachment, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFileAttachment>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
