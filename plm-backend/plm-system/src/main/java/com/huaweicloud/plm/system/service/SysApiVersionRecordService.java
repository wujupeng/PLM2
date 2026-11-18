package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysApiVersionRecordSaveRequest;
import com.huaweicloud.plm.system.entity.SysApiVersionRecord;
import com.huaweicloud.plm.system.mapper.SysApiVersionRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 接口版本记录（G1-N1 集成平台 T009）：版本变更留痕、兼容性标注与发布/生效状态流转。
 * 发布日期解析为 LocalDateTime，兼容性与变更类型默认值便于快速登记。
 */
@Service
@RequiredArgsConstructor
public class SysApiVersionRecordService {

    private static final String CHANGE_TYPE_MINOR = "MINOR";
    private static final String COMPATIBILITY_COMPATIBLE = "COMPATIBLE";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String STATUS_RELEASED = "RELEASED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysApiVersionRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<SysApiVersionRecord> pageRecords(IntegrationQuery query) {
        Page<SysApiVersionRecord> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getChangeType()), SysApiVersionRecord::getChangeType, query.getChangeType())
                .eq(StringUtils.hasText(query.getVersionStatus()), SysApiVersionRecord::getVersionStatus, query.getVersionStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApiVersionRecord::getRecordNo, query.getKeyword()).or()
                        .like(SysApiVersionRecord::getApiCode, query.getKeyword()).or()
                        .like(SysApiVersionRecord::getApiName, query.getKeyword()).or()
                        .like(SysApiVersionRecord::getVersionNo, query.getKeyword()))
                .orderByDesc(SysApiVersionRecord::getId));
        return PageResult.of(page);
    }

    public SysApiVersionRecord detail(Long id) {
        return requireRecord(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApiVersionRecordSaveRequest request) {
        SysApiVersionRecord entity;
        if (id == null) {
            entity = new SysApiVersionRecord();
            entity.setRecordNo(StringUtils.hasText(request.getRecordNo())
                    ? request.getRecordNo() : flowSupport.nextBizNo("AVR"));
            entity.setChangeType(StringUtils.hasText(request.getChangeType())
                    ? request.getChangeType() : CHANGE_TYPE_MINOR);
            entity.setCompatibility(StringUtils.hasText(request.getCompatibility())
                    ? request.getCompatibility() : COMPATIBILITY_COMPATIBLE);
            entity.setVersionStatus(StringUtils.hasText(request.getVersionStatus())
                    ? request.getVersionStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireRecord(id);
            if (StringUtils.hasText(request.getRecordNo())) {
                entity.setRecordNo(request.getRecordNo());
            }
            if (StringUtils.hasText(request.getChangeType())) {
                entity.setChangeType(request.getChangeType());
            }
            if (StringUtils.hasText(request.getCompatibility())) {
                entity.setCompatibility(request.getCompatibility());
            }
            if (StringUtils.hasText(request.getVersionStatus())) {
                entity.setVersionStatus(request.getVersionStatus());
            }
        }
        entity.setApiCode(request.getApiCode());
        entity.setApiName(request.getApiName());
        entity.setVersionNo(request.getVersionNo());
        entity.setChangeLog(request.getChangeLog());
        entity.setReleaseDate(parseTimestamp(request.getReleaseDate()));
        entity.setOperatorName(request.getOperatorName());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 发布版本：状态置为 PUBLISHED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApiVersionRecord publish(Long id) {
        SysApiVersionRecord entity = requireRecord(id);
        entity.setVersionStatus(STATUS_PUBLISHED);
        mapper.updateById(entity);
        return entity;
    }

    /** 生效版本：状态置为 RELEASED，发布日期为空时取当前时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApiVersionRecord release(Long id) {
        SysApiVersionRecord entity = requireRecord(id);
        entity.setVersionStatus(STATUS_RELEASED);
        if (entity.getReleaseDate() == null) {
            entity.setReleaseDate(LocalDateTime.now());
        }
        mapper.updateById(entity);
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireRecord(id);
        mapper.deleteById(id);
    }

    /** 接口版本记录统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getVersionStatus, STATUS_DRAFT)));
        result.put("published", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getVersionStatus, STATUS_PUBLISHED)));
        result.put("released", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getVersionStatus, STATUS_RELEASED)));
        result.put("breakingCount", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getCompatibility, "BREAKING")));
        result.put("compatibleCount", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getCompatibility, COMPATIBILITY_COMPATIBLE)));
        result.put("majorCount", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getChangeType, "MAJOR")));
        result.put("minorCount", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getChangeType, CHANGE_TYPE_MINOR)));
        result.put("patchCount", mapper.selectCount(Wrappers.<SysApiVersionRecord>lambdaQuery()
                .eq(SysApiVersionRecord::getChangeType, "PATCH")));
        return result;
    }

    public SysApiVersionRecord requireRecord(Long id) {
        SysApiVersionRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "接口版本记录不存在: " + id);
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
