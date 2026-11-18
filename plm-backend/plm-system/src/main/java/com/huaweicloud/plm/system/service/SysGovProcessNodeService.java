package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovProcessNodeQuery;
import com.huaweicloud.plm.system.dto.SysGovProcessNodeSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovProcessNode;
import com.huaweicloud.plm.system.mapper.SysGovProcessNodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 流程节点（G1-N7 治理中心 T003 流程建模）：
 * 节点登记、分页查询与删除。节点编号支持人工指定，删除语义为「释放编号」，采用物理删除。
 */
@Service
@RequiredArgsConstructor
public class SysGovProcessNodeService {

    private static final String DEFAULT_NODE_TYPE = "ACTIVITY";
    private static final String DEFAULT_NODE_STATUS = "ACTIVE";
    private static final Integer DEFAULT_SEQ_NO = 1;

    private final SysGovProcessNodeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询：流程编码/类型/状态精确，编号/编码/名称模糊，按 seqNo 升序再按 id 升序。 */
    public PageResult<SysGovProcessNode> pageNodes(SysGovProcessNodeQuery query) {
        Page<SysGovProcessNode> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovProcessNode>lambdaQuery()
                .eq(StringUtils.hasText(query.getProcessCode()),
                        SysGovProcessNode::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getNodeType()),
                        SysGovProcessNode::getNodeType, query.getNodeType())
                .eq(StringUtils.hasText(query.getNodeStatus()),
                        SysGovProcessNode::getNodeStatus, query.getNodeStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovProcessNode::getNodeNo, query.getKeyword()).or()
                        .like(SysGovProcessNode::getNodeCode, query.getKeyword()).or()
                        .like(SysGovProcessNode::getNodeName, query.getKeyword()))
                .orderByAsc(SysGovProcessNode::getSeqNo)
                .orderByAsc(SysGovProcessNode::getId));
        return PageResult.of(page);
    }

    public SysGovProcessNode detail(Long id) {
        return require(id);
    }

    /** 新增或更新：新增时回填默认类型/顺序号/状态与组织，节点编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovProcessNodeSaveRequest request) {
        SysGovProcessNode entity;
        if (id == null) {
            entity = new SysGovProcessNode();
            entity.setNodeNo(StringUtils.hasText(request.getNodeNo())
                    ? request.getNodeNo() : flowSupport.nextBizNo("GPN"));
            entity.setNodeType(StringUtils.hasText(request.getNodeType())
                    ? request.getNodeType() : DEFAULT_NODE_TYPE);
            entity.setSeqNo(request.getSeqNo() != null ? request.getSeqNo() : DEFAULT_SEQ_NO);
            entity.setNodeStatus(StringUtils.hasText(request.getNodeStatus())
                    ? request.getNodeStatus() : DEFAULT_NODE_STATUS);
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

    /** 删除：物理删除以释放节点编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovProcessNode require(Long id) {
        SysGovProcessNode entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流程节点不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysGovProcessNode entity, SysGovProcessNodeSaveRequest request) {
        if (StringUtils.hasText(request.getNodeNo())) {
            entity.setNodeNo(request.getNodeNo());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getNodeCode())) {
            entity.setNodeCode(request.getNodeCode());
        }
        if (StringUtils.hasText(request.getNodeName())) {
            entity.setNodeName(request.getNodeName());
        }
        if (StringUtils.hasText(request.getNodeType())) {
            entity.setNodeType(request.getNodeType());
        }
        if (request.getSeqNo() != null) {
            entity.setSeqNo(request.getSeqNo());
        }
        if (StringUtils.hasText(request.getRoleName())) {
            entity.setRoleName(request.getRoleName());
        }
        if (StringUtils.hasText(request.getSystemDomain())) {
            entity.setSystemDomain(request.getSystemDomain());
        }
        if (StringUtils.hasText(request.getInputArtifact())) {
            entity.setInputArtifact(request.getInputArtifact());
        }
        if (StringUtils.hasText(request.getOutputArtifact())) {
            entity.setOutputArtifact(request.getOutputArtifact());
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

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
