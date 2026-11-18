package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMigrationHistoryFlowSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationHistoryFlow;
import com.huaweicloud.plm.system.mapper.OaMigrationHistoryFlowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 历史流程档案（OA-DEV-102）：已完结/已终止流程的表单快照、审批意见、处理人与时间线只读留存，
 * 支持按原单号与人员查询，不参与新的审批流转。
 */
@Service
@RequiredArgsConstructor
public class OaMigrationHistoryFlowService {

    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_RUNNING = "RUNNING";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaMigrationHistoryFlowMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaMigrationHistoryFlow> page(OaMigrationQuery query) {
        Page<OaMigrationHistoryFlow> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaMigrationHistoryFlow>lambdaQuery()
                .eq(StringUtils.hasText(query.getInstanceStatus()), OaMigrationHistoryFlow::getInstanceStatus, query.getInstanceStatus())
                .ge(query.getStartDate() != null, OaMigrationHistoryFlow::getStartTime, OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(query.getEndDate() != null, OaMigrationHistoryFlow::getStartTime, OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationHistoryFlow::getSourceInstanceNo, query.getKeyword()).or()
                        .like(OaMigrationHistoryFlow::getTitle, query.getKeyword()).or()
                        .like(OaMigrationHistoryFlow::getApplicantName, query.getKeyword()))
                .orderByDesc(OaMigrationHistoryFlow::getStartTime));
        return PageResult.of(page);
    }

    public OaMigrationHistoryFlow detail(Long id) {
        return requireEntity(id);
    }

    /** 按原单号查询历史流程档案（供迁移后按原单号检索）。 */
    public List<OaMigrationHistoryFlow> queryBySourceNo(String sourceInstanceNo) {
        return mapper.selectList(Wrappers.<OaMigrationHistoryFlow>lambdaQuery()
                .eq(OaMigrationHistoryFlow::getSourceInstanceNo, sourceInstanceNo)
                .orderByDesc(OaMigrationHistoryFlow::getStartTime));
    }

    @Transactional
    public Long save(Long id, BizMigrationHistoryFlowSaveRequest request) {
        OaMigrationHistoryFlow entity;
        if (id == null) {
            entity = new OaMigrationHistoryFlow();
            entity.setArchiveNo(StringUtils.hasText(request.getArchiveNo())
                    ? request.getArchiveNo() : flowSupport.nextBizNo("MHF"));
            entity.setMigratedFlag(Boolean.FALSE.equals(request.getMigratedFlag()) ? 0 : 1);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireEntity(id);
            if (StringUtils.hasText(request.getArchiveNo())) {
                entity.setArchiveNo(request.getArchiveNo());
            }
            if (request.getMigratedFlag() != null) {
                entity.setMigratedFlag(Boolean.TRUE.equals(request.getMigratedFlag()) ? 1 : 0);
            }
        }
        entity.setSourceInstanceNo(request.getSourceInstanceNo());
        entity.setProcessCode(request.getProcessCode());
        entity.setProcessName(request.getProcessName());
        entity.setTitle(request.getTitle());
        entity.setFormSnapshot(request.getFormSnapshot());
        entity.setApplicantName(request.getApplicantName());
        entity.setApplicantOrg(request.getApplicantOrg());
        entity.setStartTime(parseTimestamp(request.getStartTime()));
        entity.setEndTime(parseTimestamp(request.getEndTime()));
        entity.setInstanceStatus(StringUtils.hasText(request.getInstanceStatus())
                ? request.getInstanceStatus() : STATUS_APPROVED);
        entity.setApprovalJson(request.getApprovalJson());
        entity.setTimelineJson(request.getTimelineJson());
        entity.setAttachmentCount(request.getAttachmentCount() == null ? 0 : request.getAttachmentCount());
        entity.setQueryUserName(request.getQueryUserName());
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

    /** 历史流程档案统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("running", mapper.selectCount(Wrappers.<OaMigrationHistoryFlow>lambdaQuery()
                .eq(OaMigrationHistoryFlow::getInstanceStatus, STATUS_RUNNING)));
        result.put("approved", mapper.selectCount(Wrappers.<OaMigrationHistoryFlow>lambdaQuery()
                .eq(OaMigrationHistoryFlow::getInstanceStatus, STATUS_APPROVED)));
        result.put("rejected", mapper.selectCount(Wrappers.<OaMigrationHistoryFlow>lambdaQuery()
                .eq(OaMigrationHistoryFlow::getInstanceStatus, STATUS_REJECTED)));
        result.put("cancelled", mapper.selectCount(Wrappers.<OaMigrationHistoryFlow>lambdaQuery()
                .eq(OaMigrationHistoryFlow::getInstanceStatus, STATUS_CANCELLED)));
        result.put("retentionYears", flowSupport.configInt("oa.migration.history.flow.retention.years", 5));
        return result;
    }

    public OaMigrationHistoryFlow requireEntity(Long id) {
        OaMigrationHistoryFlow entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "历史流程档案不存在: " + id);
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
