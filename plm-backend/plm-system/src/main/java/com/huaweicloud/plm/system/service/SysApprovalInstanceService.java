package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ApprovalInstanceQuery;
import com.huaweicloud.plm.system.dto.SysApprovalInstanceSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalInstance;
import com.huaweicloud.plm.system.mapper.SysApprovalInstanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 审批实例（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 实例登记、按状态统计与取消。
 * 实例编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysApprovalInstanceService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CANCELED = "CANCELED";

    private final SysApprovalInstanceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询审批实例：流程编码/单据类型/单据编号/实例状态/提交人精确，时间区间作用于创建时间。 */
    public PageResult<SysApprovalInstance> pageInstances(ApprovalInstanceQuery query) {
        Page<SysApprovalInstance> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApprovalInstance>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowCode()),
                        SysApprovalInstance::getFlowCode, query.getFlowCode())
                .eq(StringUtils.hasText(query.getDocType()),
                        SysApprovalInstance::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getDocNo()),
                        SysApprovalInstance::getDocNo, query.getDocNo())
                .eq(StringUtils.hasText(query.getInstanceStatus()),
                        SysApprovalInstance::getInstanceStatus, query.getInstanceStatus())
                .like(StringUtils.hasText(query.getSubmitterName()),
                        SysApprovalInstance::getSubmitterName, query.getSubmitterName())
                .ge(StringUtils.hasText(query.getStartDate()), SysApprovalInstance::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysApprovalInstance::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApprovalInstance::getInstanceNo, query.getKeyword()).or()
                        .like(SysApprovalInstance::getDocNo, query.getKeyword()).or()
                        .like(SysApprovalInstance::getBizTitle, query.getKeyword()))
                .orderByDesc(SysApprovalInstance::getId));
        return PageResult.of(page);
    }

    public SysApprovalInstance detail(Long id) {
        return require(id);
    }

    /**
     * 新增或更新审批实例：新增时回填默认实例状态、提交时间与当前登录提交人、组织，实例编号为空时自动生成。
     */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApprovalInstanceSaveRequest request) {
        SysApprovalInstance entity;
        if (id == null) {
            entity = new SysApprovalInstance();
            entity.setInstanceNo(StringUtils.hasText(request.getInstanceNo())
                    ? request.getInstanceNo() : flowSupport.nextBizNo("API"));
            entity.setInstanceStatus(StringUtils.hasText(request.getInstanceStatus())
                    ? request.getInstanceStatus() : STATUS_PENDING);
            entity.setSubmitTime(request.getSubmitTime() == null
                    ? LocalDateTime.now() : request.getSubmitTime());
            UserContext.Principal principal = UserContext.get();
            if (principal != null) {
                entity.setSubmitterId(principal.userId());
                entity.setSubmitterName(principal.displayName());
            }
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 取消审批实例：实例状态置为 CANCELED，完成时间置为当前时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalInstance cancel(Long id) {
        SysApprovalInstance entity = require(id);
        entity.setInstanceStatus(STATUS_CANCELED);
        entity.setFinishedTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 删除审批实例：物理删除以释放实例编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 审批实例统计：按实例状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", countBy(SysApprovalInstance::getInstanceStatus, STATUS_PENDING));
        result.put("approved", countBy(SysApprovalInstance::getInstanceStatus, STATUS_APPROVED));
        result.put("rejected", countBy(SysApprovalInstance::getInstanceStatus, STATUS_REJECTED));
        result.put("canceled", countBy(SysApprovalInstance::getInstanceStatus, STATUS_CANCELED));
        return result;
    }

    public SysApprovalInstance require(Long id) {
        SysApprovalInstance entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "审批实例不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysApprovalInstance entity, SysApprovalInstanceSaveRequest request) {
        if (StringUtils.hasText(request.getInstanceNo())) {
            entity.setInstanceNo(request.getInstanceNo());
        }
        if (StringUtils.hasText(request.getFlowCode())) {
            entity.setFlowCode(request.getFlowCode());
        }
        if (StringUtils.hasText(request.getDocType())) {
            entity.setDocType(request.getDocType());
        }
        if (StringUtils.hasText(request.getDocNo())) {
            entity.setDocNo(request.getDocNo());
        }
        if (StringUtils.hasText(request.getBizTitle())) {
            entity.setBizTitle(request.getBizTitle());
        }
        if (request.getSubmitterId() != null) {
            entity.setSubmitterId(request.getSubmitterId());
        }
        if (StringUtils.hasText(request.getSubmitterName())) {
            entity.setSubmitterName(request.getSubmitterName());
        }
        if (request.getSubmitTime() != null) {
            entity.setSubmitTime(request.getSubmitTime());
        }
        if (StringUtils.hasText(request.getCurrentNode())) {
            entity.setCurrentNode(request.getCurrentNode());
        }
        if (StringUtils.hasText(request.getInstanceStatus())) {
            entity.setInstanceStatus(request.getInstanceStatus());
        }
        if (request.getFinishedTime() != null) {
            entity.setFinishedTime(request.getFinishedTime());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countBy(SFunction<SysApprovalInstance, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysApprovalInstance>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
