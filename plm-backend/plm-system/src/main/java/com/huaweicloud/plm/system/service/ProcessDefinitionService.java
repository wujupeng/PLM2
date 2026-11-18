package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ProcessDefinitionQuery;
import com.huaweicloud.plm.system.dto.ProcessDefinitionSaveRequest;
import com.huaweicloud.plm.system.dto.ProcessDetailResponse;
import com.huaweicloud.plm.system.dto.ProcessNodeSaveRequest;
import com.huaweicloud.plm.system.entity.OaProcessDefinition;
import com.huaweicloud.plm.system.entity.OaProcessNode;
import com.huaweicloud.plm.system.mapper.OaProcessDefinitionMapper;
import com.huaweicloud.plm.system.mapper.OaProcessNodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 低代码流程定义服务：流程与节点均为可配置数据，管理员可通过流程设计器维护。
 */
@Service
@RequiredArgsConstructor
public class ProcessDefinitionService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";

    private final OaProcessDefinitionMapper processMapper;
    private final OaProcessNodeMapper processNodeMapper;

    public PageResult<OaProcessDefinition> page(ProcessDefinitionQuery query) {
        Page<OaProcessDefinition> page = query.toPage();
        processMapper.selectPage(page, Wrappers.<OaProcessDefinition>lambdaQuery()
                .eq(query.getFormId() != null, OaProcessDefinition::getFormId, query.getFormId())
                .eq(StringUtils.hasText(query.getCategory()), OaProcessDefinition::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getStatus()), OaProcessDefinition::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaProcessDefinition::getProcessCode, query.getKeyword()).or()
                        .like(OaProcessDefinition::getProcessName, query.getKeyword()))
                .orderByDesc(OaProcessDefinition::getUpdatedAt));
        return PageResult.of(page);
    }

    /** 供发起页选择流程，仅返回已发布流程。 */
    public List<OaProcessDefinition> listPublished() {
        return processMapper.selectList(Wrappers.<OaProcessDefinition>lambdaQuery()
                .eq(OaProcessDefinition::getStatus, STATUS_PUBLISHED)
                .orderByAsc(OaProcessDefinition::getProcessName));
    }

    public ProcessDetailResponse getDetail(Long processId) {
        OaProcessDefinition process = requireProcess(processId);
        ProcessDetailResponse response = new ProcessDetailResponse();
        response.setProcess(process);
        response.setNodes(listNodes(processId));
        return response;
    }

    public List<OaProcessNode> listNodes(Long processId) {
        return processNodeMapper.selectList(Wrappers.<OaProcessNode>lambdaQuery()
                .eq(OaProcessNode::getProcessId, processId)
                .orderByAsc(OaProcessNode::getSortNo));
    }

    @Transactional
    public Long create(ProcessDefinitionSaveRequest request) {
        if (processMapper.countByCode(request.getProcessCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "流程编码已存在: " + request.getProcessCode());
        }
        OaProcessDefinition process = new OaProcessDefinition();
        applyRequest(process, request, true);
        processMapper.insert(process);
        saveNodes(process.getId(), request.getNodes());
        return process.getId();
    }

    @Transactional
    public void update(Long processId, ProcessDefinitionSaveRequest request) {
        OaProcessDefinition process = requireProcess(processId);
        if (processMapper.countByCode(request.getProcessCode(), processId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "流程编码已存在: " + request.getProcessCode());
        }
        applyRequest(process, request, false);
        processMapper.updateById(process);
        if (request.getNodes() != null) {
            processNodeMapper.delete(Wrappers.<OaProcessNode>lambdaQuery().eq(OaProcessNode::getProcessId, processId));
            saveNodes(processId, request.getNodes());
        }
    }

    @Transactional
    public void delete(Long processId) {
        requireProcess(processId);
        processMapper.deleteById(processId);
        processNodeMapper.delete(Wrappers.<OaProcessNode>lambdaQuery().eq(OaProcessNode::getProcessId, processId));
    }

    /** 发布流程：发布后方可发起实例，需至少配置一个审批节点。 */
    public void publish(Long processId) {
        OaProcessDefinition process = requireProcess(processId);
        List<OaProcessNode> nodes = listNodes(processId);
        boolean hasApprovalNode = nodes.stream().anyMatch(node -> !"START".equals(node.getNodeType())
                && !"END".equals(node.getNodeType()));
        if (!hasApprovalNode) {
            throw new BusinessException("流程至少需要配置一个审批或抄送节点后才能发布");
        }
        if (!STATUS_PUBLISHED.equals(process.getStatus())) {
            process.setVersionNo((process.getVersionNo() == null ? 1 : process.getVersionNo()) + 1);
        }
        process.setStatus(STATUS_PUBLISHED);
        processMapper.updateById(process);
    }

    public OaProcessDefinition requireProcess(Long processId) {
        OaProcessDefinition process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流程不存在: " + processId);
        }
        return process;
    }

    private void saveNodes(Long processId, List<ProcessNodeSaveRequest> nodes) {
        if (CollectionUtils.isEmpty(nodes)) {
            return;
        }
        int index = 0;
        for (ProcessNodeSaveRequest nodeRequest : nodes) {
            index++;
            OaProcessNode node = new OaProcessNode();
            node.setProcessId(processId);
            node.setNodeCode(nodeRequest.getNodeCode());
            node.setNodeName(nodeRequest.getNodeName());
            node.setNodeType(StringUtils.hasText(nodeRequest.getNodeType())
                    ? nodeRequest.getNodeType() : "APPROVAL");
            node.setApproverType(StringUtils.hasText(nodeRequest.getApproverType())
                    ? nodeRequest.getApproverType() : "ROLE");
            node.setApproverValue(nodeRequest.getApproverValue());
            node.setAllowDelegate(nodeRequest.getAllowDelegate() == null ? 1 : nodeRequest.getAllowDelegate());
            node.setSortNo(nodeRequest.getSortNo() == null ? index : nodeRequest.getSortNo());
            node.setRemark(nodeRequest.getRemark());
            processNodeMapper.insert(node);
        }
    }

    private void applyRequest(OaProcessDefinition process, ProcessDefinitionSaveRequest request, boolean creating) {
        process.setProcessCode(request.getProcessCode());
        process.setProcessName(request.getProcessName());
        process.setFormId(request.getFormId());
        process.setCategory(request.getCategory());
        process.setDefinitionJson(request.getDefinitionJson());
        process.setDescription(request.getDescription());
        process.setRemark(request.getRemark());
        if (creating) {
            process.setVersionNo(1);
            process.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
        } else if (StringUtils.hasText(request.getStatus())) {
            process.setStatus(request.getStatus());
        }
    }
}
