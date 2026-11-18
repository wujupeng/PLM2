package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileVersionSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileVersion;
import com.huaweicloud.plm.system.mapper.SysFileVersionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 文件版本（G1-N3 公共平台底座—统一文件服务 WBS T011）：版本登记、当前版本切换与统计。
 * 版本编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFileVersionService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_HISTORY = "HISTORY";

    private final SysFileVersionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询文件版本：附件编号与版本状态精确，关键字匹配版本编号/附件编号/文件名称，时间区间作用于创建时间。 */
    public PageResult<SysFileVersion> pageVersions(FileQuery query) {
        Page<SysFileVersion> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFileVersion>lambdaQuery()
                .eq(StringUtils.hasText(query.getVersionStatus()),
                        SysFileVersion::getVersionStatus, query.getVersionStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysFileVersion::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFileVersion::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFileVersion::getVersionNo, query.getKeyword()).or()
                        .like(SysFileVersion::getFileNo, query.getKeyword()).or()
                        .like(SysFileVersion::getFileName, query.getKeyword()))
                .orderByDesc(SysFileVersion::getId));
        return PageResult.of(page);
    }

    public SysFileVersion detail(Long id) {
        return require(id);
    }

    /** 新增或更新文件版本：新增时回填默认序号、当前标记与版本状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFileVersionSaveRequest request) {
        SysFileVersion entity;
        if (id == null) {
            entity = new SysFileVersion();
            entity.setVersionNo(StringUtils.hasText(request.getVersionNo())
                    ? request.getVersionNo() : flowSupport.nextBizNo("FV"));
            entity.setSeqNo(1);
            entity.setCurrentFlag(0);
            entity.setVersionStatus(STATUS_ACTIVE);
            entity.setFileSize(0L);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getVersionNo())) {
                entity.setVersionNo(request.getVersionNo());
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

    /** 置为当前版本：本版本 currentFlag=1、状态 ACTIVE，同一附件下其它版本置为历史。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFileVersion setCurrent(Long id) {
        SysFileVersion entity = require(id);
        mapper.update(null, Wrappers.<SysFileVersion>lambdaUpdate()
                .eq(SysFileVersion::getFileNo, entity.getFileNo())
                .ne(SysFileVersion::getId, id)
                .set(SysFileVersion::getCurrentFlag, 0)
                .set(SysFileVersion::getVersionStatus, STATUS_HISTORY));
        entity.setCurrentFlag(1);
        entity.setVersionStatus(STATUS_ACTIVE);
        mapper.updateById(entity);
        return entity;
    }

    /** 删除版本：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 文件版本统计：按版本状态汇总并统计各版本文件大小之和。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("current", countByStatus(STATUS_ACTIVE));
        result.put("history", countByStatus(STATUS_HISTORY));
        long totalSize = 0L;
        List<SysFileVersion> versions = mapper.selectList(null);
        if (versions != null) {
            for (SysFileVersion version : versions) {
                if (version.getFileSize() != null) {
                    totalSize += version.getFileSize();
                }
            }
        }
        result.put("totalSize", totalSize);
        return result;
    }

    public SysFileVersion require(Long id) {
        SysFileVersion entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件版本不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFileVersion entity, SysFileVersionSaveRequest request) {
        if (StringUtils.hasText(request.getFileNo())) {
            entity.setFileNo(request.getFileNo());
        }
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (request.getSeqNo() != null) {
            entity.setSeqNo(request.getSeqNo());
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
        if (StringUtils.hasText(request.getChecksum())) {
            entity.setChecksum(request.getChecksum());
        }
        if (StringUtils.hasText(request.getChangeNote())) {
            entity.setChangeNote(request.getChangeNote());
        }
        if (request.getCurrentFlag() != null) {
            entity.setCurrentFlag(request.getCurrentFlag());
        }
        if (StringUtils.hasText(request.getUploadBy())) {
            entity.setUploadBy(request.getUploadBy());
        }
        if (request.getUploadTime() != null) {
            entity.setUploadTime(request.getUploadTime());
        }
        if (StringUtils.hasText(request.getVersionStatus())) {
            entity.setVersionStatus(request.getVersionStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countByStatus(String versionStatus) {
        return countBy(SysFileVersion::getVersionStatus, versionStatus);
    }

    private Long countBy(SFunction<SysFileVersion, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFileVersion>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
