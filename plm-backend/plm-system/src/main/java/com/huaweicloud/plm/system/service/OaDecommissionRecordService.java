package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaDecommissionRecordSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaDecommissionRecord;
import com.huaweicloud.plm.system.mapper.OaDecommissionRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 完成授权和资源回收（OA-DEV-120）：原有 OA 账号授权撤销与资源回收审批、执行维护。
 */
@Service
@RequiredArgsConstructor
public class OaDecommissionRecordService {

    private static final String TYPE_ACCESS = "ACCESS";
    private static final String TYPE_LICENSE = "LICENSE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_EXECUTED = "EXECUTED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaDecommissionRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaDecommissionRecord> pageRecords(OaGoliveQuery query) {
        Page<OaDecommissionRecord> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getResourceType()),
                        OaDecommissionRecord::getResourceType, query.getResourceType())
                .eq(StringUtils.hasText(query.getDecommissionStatus()),
                        OaDecommissionRecord::getDecommissionStatus, query.getDecommissionStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaDecommissionRecord::getDecommissionNo, query.getKeyword()).or()
                        .like(OaDecommissionRecord::getDecommissionName, query.getKeyword()).or()
                        .like(OaDecommissionRecord::getResourceDesc, query.getKeyword()))
                .orderByDesc(OaDecommissionRecord::getId));
        return PageResult.of(page);
    }

    public OaDecommissionRecord detail(Long id) {
        return requireRecord(id);
    }

    @Transactional
    public Long save(Long id, OaDecommissionRecordSaveRequest request) {
        OaDecommissionRecord entity;
        if (id == null) {
            entity = new OaDecommissionRecord();
            entity.setDecommissionNo(StringUtils.hasText(request.getDecommissionNo())
                    ? request.getDecommissionNo() : flowSupport.nextBizNo("DC"));
            entity.setResourceType(StringUtils.hasText(request.getResourceType())
                    ? request.getResourceType() : TYPE_ACCESS);
            entity.setApproved(request.getApproved() == null ? 0 : request.getApproved());
            entity.setDecommissionStatus(StringUtils.hasText(request.getDecommissionStatus())
                    ? request.getDecommissionStatus() : STATUS_PENDING);
            entity.setBackupKept(request.getBackupKept() == null ? 1 : request.getBackupKept());
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireRecord(id);
            if (StringUtils.hasText(request.getDecommissionNo())) {
                entity.setDecommissionNo(request.getDecommissionNo());
            }
            if (StringUtils.hasText(request.getResourceType())) {
                entity.setResourceType(request.getResourceType());
            }
            if (request.getApproved() != null) {
                entity.setApproved(request.getApproved());
            }
            if (StringUtils.hasText(request.getDecommissionStatus())) {
                entity.setDecommissionStatus(request.getDecommissionStatus());
            }
            if (request.getBackupKept() != null) {
                entity.setBackupKept(request.getBackupKept());
            }
        }
        entity.setDecommissionName(request.getDecommissionName());
        entity.setResourceDesc(request.getResourceDesc());
        entity.setRevokeScope(request.getRevokeScope());
        entity.setApprover(request.getApprover());
        entity.setExecuteTime(parseTimestamp(request.getExecuteTime()));
        entity.setRiskNote(request.getRiskNote());
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

    @Transactional
    public void delete(Long id) {
        requireRecord(id);
        mapper.deleteById(id);
    }

    /** 批准资源回收：已批准时不可重复审批。 */
    @Transactional
    public OaDecommissionRecord approve(Long id, String approver) {
        OaDecommissionRecord entity = requireRecord(id);
        if (entity.getApproved() != null && entity.getApproved() == 1) {
            throw new BusinessException(ResultCode.CONFLICT, "资源回收已批准，无需重复审批");
        }
        entity.setApproved(1);
        if (StringUtils.hasText(approver)) {
            entity.setApprover(approver);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 执行资源回收：未批准时不可执行，执行后回写状态、执行时间与操作人。 */
    @Transactional
    public OaDecommissionRecord execute(Long id) {
        OaDecommissionRecord entity = requireRecord(id);
        if (entity.getApproved() == null || entity.getApproved() != 1) {
            throw new BusinessException(ResultCode.CONFLICT, "资源回收未批准，不可执行");
        }
        entity.setDecommissionStatus(STATUS_EXECUTED);
        entity.setExecuteTime(LocalDateTime.now());
        if (!StringUtils.hasText(entity.getOperatorName())) {
            UserContext.Principal principal = UserContext.get();
            if (principal != null) {
                entity.setOperatorName(principal.displayName());
            }
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 资源回收统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(OaDecommissionRecord::getDecommissionStatus, STATUS_PENDING)));
        result.put("executed", mapper.selectCount(Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(OaDecommissionRecord::getDecommissionStatus, STATUS_EXECUTED)));
        result.put("approvedCount", mapper.selectCount(Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(OaDecommissionRecord::getApproved, 1)));
        result.put("accessCount", mapper.selectCount(Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(OaDecommissionRecord::getResourceType, TYPE_ACCESS)));
        result.put("licenseCount", mapper.selectCount(Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(OaDecommissionRecord::getResourceType, TYPE_LICENSE)));
        result.put("backupKeptCount", mapper.selectCount(Wrappers.<OaDecommissionRecord>lambdaQuery()
                .eq(OaDecommissionRecord::getBackupKept, 1)));
        return result;
    }

    public OaDecommissionRecord requireRecord(Long id) {
        OaDecommissionRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "资源回收记录不存在: " + id);
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
