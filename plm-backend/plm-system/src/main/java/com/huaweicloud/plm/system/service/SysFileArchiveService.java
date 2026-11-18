package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileArchiveSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileArchive;
import com.huaweicloud.plm.system.mapper.SysFileArchiveMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 文件归档（G1-N3 公共平台底座—统一文件服务 WBS T011）：归档登记、归档/恢复/过期状态流转与统计。
 * 归档编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFileArchiveService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ARCHIVED = "ARCHIVED";
    private static final String STATUS_RESTORING = "RESTORING";
    private static final String STATUS_RESTORED = "RESTORED";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String RESTORE_NONE = "NONE";
    private static final String RESTORE_REQUESTED = "REQUESTED";

    private final SysFileArchiveMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询文件归档：归档类型/状态与恢复状态精确，关键字匹配归档编号/附件编号/文件名称，时间区间作用于创建时间。 */
    public PageResult<SysFileArchive> pageArchives(FileQuery query) {
        Page<SysFileArchive> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFileArchive>lambdaQuery()
                .eq(StringUtils.hasText(query.getArchiveType()),
                        SysFileArchive::getArchiveType, query.getArchiveType())
                .eq(StringUtils.hasText(query.getArchiveStatus()),
                        SysFileArchive::getArchiveStatus, query.getArchiveStatus())
                .eq(StringUtils.hasText(query.getRestoreStatus()),
                        SysFileArchive::getRestoreStatus, query.getRestoreStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysFileArchive::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFileArchive::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFileArchive::getArchiveNo, query.getKeyword()).or()
                        .like(SysFileArchive::getFileNo, query.getKeyword()).or()
                        .like(SysFileArchive::getFileName, query.getKeyword()))
                .orderByDesc(SysFileArchive::getId));
        return PageResult.of(page);
    }

    public SysFileArchive detail(Long id) {
        return require(id);
    }

    /** 新增或更新文件归档：新增时回填默认归档类型、存储级别与状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFileArchiveSaveRequest request) {
        SysFileArchive entity;
        if (id == null) {
            entity = new SysFileArchive();
            entity.setArchiveNo(StringUtils.hasText(request.getArchiveNo())
                    ? request.getArchiveNo() : flowSupport.nextBizNo("ARC"));
            entity.setArchiveType("HOT");
            entity.setStorageClass("STANDARD");
            entity.setArchiveStatus(STATUS_PENDING);
            entity.setRestoreStatus(RESTORE_NONE);
            entity.setRetentionYears(0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getArchiveNo())) {
                entity.setArchiveNo(request.getArchiveNo());
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

    /** 归档：状态置为 ARCHIVED，回填归档时间并按保留年限计算过期时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileArchive archive(Long id) {
        SysFileArchive entity = require(id);
        LocalDateTime now = LocalDateTime.now();
        int retentionYears = entity.getRetentionYears() == null ? 0 : entity.getRetentionYears();
        entity.setArchiveStatus(STATUS_ARCHIVED);
        entity.setArchiveTime(now);
        entity.setExpireTime(now.plusYears(retentionYears));
        mapper.updateById(entity);
        return entity;
    }

    /** 申请恢复：恢复状态置为 REQUESTED，归档状态置为 RESTORING。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileArchive restore(Long id) {
        SysFileArchive entity = require(id);
        entity.setRestoreStatus(RESTORE_REQUESTED);
        entity.setArchiveStatus(STATUS_RESTORING);
        mapper.updateById(entity);
        return entity;
    }

    /** 标记过期：归档状态置为 EXPIRED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileArchive expire(Long id) {
        SysFileArchive entity = require(id);
        entity.setArchiveStatus(STATUS_EXPIRED);
        mapper.updateById(entity);
        return entity;
    }

    /** 删除归档：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 文件归档统计：按归档状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", countByStatus(STATUS_PENDING));
        result.put("archived", countByStatus(STATUS_ARCHIVED));
        result.put("restoring", countByStatus(STATUS_RESTORING));
        result.put("restored", countByStatus(STATUS_RESTORED));
        result.put("expired", countByStatus(STATUS_EXPIRED));
        return result;
    }

    public SysFileArchive require(Long id) {
        SysFileArchive entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件归档不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFileArchive entity, SysFileArchiveSaveRequest request) {
        if (StringUtils.hasText(request.getFileNo())) {
            entity.setFileNo(request.getFileNo());
        }
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (StringUtils.hasText(request.getArchiveType())) {
            entity.setArchiveType(request.getArchiveType());
        }
        if (StringUtils.hasText(request.getStorageClass())) {
            entity.setStorageClass(request.getStorageClass());
        }
        if (request.getRetentionYears() != null) {
            entity.setRetentionYears(request.getRetentionYears());
        }
        if (StringUtils.hasText(request.getStoragePath())) {
            entity.setStoragePath(request.getStoragePath());
        }
        if (request.getArchiveTime() != null) {
            entity.setArchiveTime(request.getArchiveTime());
        }
        if (request.getExpireTime() != null) {
            entity.setExpireTime(request.getExpireTime());
        }
        if (StringUtils.hasText(request.getArchiveStatus())) {
            entity.setArchiveStatus(request.getArchiveStatus());
        }
        if (StringUtils.hasText(request.getRestoreStatus())) {
            entity.setRestoreStatus(request.getRestoreStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countByStatus(String archiveStatus) {
        return countBy(SysFileArchive::getArchiveStatus, archiveStatus);
    }

    private Long countBy(SFunction<SysFileArchive, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFileArchive>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
