package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaLegacyArchiveSaveRequest;
import com.huaweicloud.plm.system.entity.OaLegacyArchive;
import com.huaweicloud.plm.system.mapper.OaLegacyArchiveMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 现有OA只读封存（OA-DEV-119）：封存类型、封存范围、快照、保留策略与查询入口维护。
 * 保留年限为可配置项，便于按合规要求调整。
 */
@Service
@RequiredArgsConstructor
public class OaLegacyArchiveService {

    private static final String TYPE_READONLY = "READONLY";
    private static final String TYPE_OFFLINE = "OFFLINE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ARCHIVED = "ARCHIVED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaLegacyArchiveMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaLegacyArchive> pageArchives(OaGoliveQuery query) {
        Page<OaLegacyArchive> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaLegacyArchive>lambdaQuery()
                .eq(StringUtils.hasText(query.getArchiveType()), OaLegacyArchive::getArchiveType, query.getArchiveType())
                .eq(StringUtils.hasText(query.getArchiveStatus()), OaLegacyArchive::getArchiveStatus, query.getArchiveStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaLegacyArchive::getArchiveNo, query.getKeyword()).or()
                        .like(OaLegacyArchive::getArchiveName, query.getKeyword()).or()
                        .like(OaLegacyArchive::getQueryEntry, query.getKeyword()))
                .orderByDesc(OaLegacyArchive::getId));
        return PageResult.of(page);
    }

    public OaLegacyArchive detail(Long id) {
        return requireArchive(id);
    }

    @Transactional
    public Long save(Long id, OaLegacyArchiveSaveRequest request) {
        OaLegacyArchive entity;
        if (id == null) {
            entity = new OaLegacyArchive();
            entity.setArchiveNo(StringUtils.hasText(request.getArchiveNo())
                    ? request.getArchiveNo() : flowSupport.nextBizNo("LA"));
            entity.setArchiveType(StringUtils.hasText(request.getArchiveType())
                    ? request.getArchiveType() : TYPE_READONLY);
            entity.setRetentionYears(flowSupport.configInt("oa.legacy.retention.years", 5));
            entity.setBackupVerified(0);
            entity.setArchiveStatus(StringUtils.hasText(request.getArchiveStatus())
                    ? request.getArchiveStatus() : STATUS_PENDING);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireArchive(id);
            if (StringUtils.hasText(request.getArchiveNo())) {
                entity.setArchiveNo(request.getArchiveNo());
            }
            if (StringUtils.hasText(request.getArchiveType())) {
                entity.setArchiveType(request.getArchiveType());
            }
            if (StringUtils.hasText(request.getArchiveStatus())) {
                entity.setArchiveStatus(request.getArchiveStatus());
            }
        }
        entity.setArchiveName(request.getArchiveName());
        entity.setArchiveScope(request.getArchiveScope());
        entity.setSnapshotPath(request.getSnapshotPath());
        entity.setSnapshotChecksum(request.getSnapshotChecksum());
        if (request.getRetentionYears() != null) {
            entity.setRetentionYears(request.getRetentionYears());
        }
        entity.setRetentionPolicy(request.getRetentionPolicy());
        if (request.getBackupVerified() != null) {
            entity.setBackupVerified(request.getBackupVerified());
        }
        entity.setQueryEntry(request.getQueryEntry());
        entity.setArchiveTime(parseTimestamp(request.getArchiveTime()));
        entity.setApprover(request.getApprover());
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
        requireArchive(id);
        mapper.deleteById(id);
    }

    /** 执行封存：状态置为 ARCHIVED，回写封存时间。 */
    @Transactional
    public OaLegacyArchive archive(Long id) {
        OaLegacyArchive entity = requireArchive(id);
        entity.setArchiveStatus(STATUS_ARCHIVED);
        entity.setArchiveTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 校验备份：置为已校验。 */
    @Transactional
    public OaLegacyArchive verify(Long id) {
        OaLegacyArchive entity = requireArchive(id);
        entity.setBackupVerified(1);
        mapper.updateById(entity);
        return entity;
    }

    /** 现有OA只读封存统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaLegacyArchive>lambdaQuery()
                .eq(OaLegacyArchive::getArchiveStatus, STATUS_PENDING)));
        result.put("archived", mapper.selectCount(Wrappers.<OaLegacyArchive>lambdaQuery()
                .eq(OaLegacyArchive::getArchiveStatus, STATUS_ARCHIVED)));
        result.put("readonlyCount", mapper.selectCount(Wrappers.<OaLegacyArchive>lambdaQuery()
                .eq(OaLegacyArchive::getArchiveType, TYPE_READONLY)));
        result.put("offlineCount", mapper.selectCount(Wrappers.<OaLegacyArchive>lambdaQuery()
                .eq(OaLegacyArchive::getArchiveType, TYPE_OFFLINE)));
        result.put("backupVerifiedCount", mapper.selectCount(Wrappers.<OaLegacyArchive>lambdaQuery()
                .eq(OaLegacyArchive::getBackupVerified, 1)));
        result.put("retentionYears", flowSupport.configInt("oa.legacy.retention.years", 5));
        return result;
    }

    public OaLegacyArchive requireArchive(Long id) {
        OaLegacyArchive entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "封存记录不存在: " + id);
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
