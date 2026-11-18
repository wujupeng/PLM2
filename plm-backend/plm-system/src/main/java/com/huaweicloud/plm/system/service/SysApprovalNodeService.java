package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ApprovalNodeQuery;
import com.huaweicloud.plm.system.dto.SysApprovalNodeSaveRequest;
import com.huaweicloud.plm.system.entity.SysApprovalNode;
import com.huaweicloud.plm.system.mapper.SysApprovalNodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 审批节点（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 节点登记、启停状态流转与统计。
 * 节点编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysApprovalNodeService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private static final String DEFAULT_APPROVER_TYPE = "ROLE";
    private static final String DEFAULT_APPROVE_MODE = "ANY";

    private final SysApprovalNodeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询审批节点：流程编码/审批人类型/审批方式/节点状态精确，节点名称模糊，时间区间作用于创建时间。 */
    public PageResult<SysApprovalNode> pageNodes(ApprovalNodeQuery query) {
        Page<SysApprovalNode> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysApprovalNode>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowCode()),
                        SysApprovalNode::getFlowCode, query.getFlowCode())
                .like(StringUtils.hasText(query.getNodeName()),
                        SysApprovalNode::getNodeName, query.getNodeName())
                .eq(StringUtils.hasText(query.getApproverType()),
                        SysApprovalNode::getApproverType, query.getApproverType())
                .eq(StringUtils.hasText(query.getApproveMode()),
                        SysApprovalNode::getApproveMode, query.getApproveMode())
                .eq(StringUtils.hasText(query.getNodeStatus()),
                        SysApprovalNode::getNodeStatus, query.getNodeStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysApprovalNode::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysApprovalNode::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysApprovalNode::getNodeNo, query.getKeyword()).or()
                        .like(SysApprovalNode::getFlowCode, query.getKeyword()).or()
                        .like(SysApprovalNode::getNodeName, query.getKeyword()))
                .orderByDesc(SysApprovalNode::getId));
        return PageResult.of(page);
    }

    public SysApprovalNode detail(Long id) {
        return require(id);
    }

    /** 新增或更新审批节点：新增时回填默认顺序/审批人类型/审批方式/转办/节点状态与组织，节点编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysApprovalNodeSaveRequest request) {
        SysApprovalNode entity;
        if (id == null) {
            entity = new SysApprovalNode();
            entity.setNodeNo(StringUtils.hasText(request.getNodeNo())
                    ? request.getNodeNo() : flowSupport.nextBizNo("APN"));
            entity.setNodeOrder(request.getNodeOrder() == null ? 1 : request.getNodeOrder());
            entity.setApproverType(StringUtils.hasText(request.getApproverType())
                    ? request.getApproverType() : DEFAULT_APPROVER_TYPE);
            entity.setApproveMode(StringUtils.hasText(request.getApproveMode())
                    ? request.getApproveMode() : DEFAULT_APPROVE_MODE);
            entity.setAllowTransfer(defaultInt(request.getAllowTransfer()));
            entity.setNodeStatus(StringUtils.hasText(request.getNodeStatus())
                    ? request.getNodeStatus() : STATUS_ACTIVE);
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

    /** 启用：节点状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalNode enable(Long id) {
        return changeNodeStatus(id, STATUS_ACTIVE);
    }

    /** 停用：节点状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysApprovalNode disable(Long id) {
        return changeNodeStatus(id, STATUS_DISABLED);
    }

    /** 删除审批节点：物理删除以释放节点编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 审批节点统计：按节点状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysApprovalNode::getNodeStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysApprovalNode::getNodeStatus, STATUS_DISABLED));
        return result;
    }

    public SysApprovalNode require(Long id) {
        SysApprovalNode entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "审批节点不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysApprovalNode entity, SysApprovalNodeSaveRequest request) {
        if (StringUtils.hasText(request.getNodeNo())) {
            entity.setNodeNo(request.getNodeNo());
        }
        if (StringUtils.hasText(request.getFlowCode())) {
            entity.setFlowCode(request.getFlowCode());
        }
        if (request.getNodeOrder() != null) {
            entity.setNodeOrder(request.getNodeOrder());
        }
        if (StringUtils.hasText(request.getNodeName())) {
            entity.setNodeName(request.getNodeName());
        }
        if (StringUtils.hasText(request.getApproverType())) {
            entity.setApproverType(request.getApproverType());
        }
        if (StringUtils.hasText(request.getApproverValue())) {
            entity.setApproverValue(request.getApproverValue());
        }
        if (StringUtils.hasText(request.getApproveMode())) {
            entity.setApproveMode(request.getApproveMode());
        }
        if (request.getAllowTransfer() != null) {
            entity.setAllowTransfer(request.getAllowTransfer());
        }
        if (StringUtils.hasText(request.getNodeStatus())) {
            entity.setNodeStatus(request.getNodeStatus());
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

    private SysApprovalNode changeNodeStatus(Long id, String nodeStatus) {
        SysApprovalNode entity = require(id);
        entity.setNodeStatus(nodeStatus);
        mapper.updateById(entity);
        return entity;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Long countBy(SFunction<SysApprovalNode, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysApprovalNode>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
