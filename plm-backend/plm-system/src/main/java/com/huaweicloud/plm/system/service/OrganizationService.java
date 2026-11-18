package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.OrgSaveRequest;
import com.huaweicloud.plm.system.dto.OrgTreeNode;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    public static final Long ROOT_PARENT_ID = 0L;

    private final SysOrganizationMapper organizationMapper;
    private final SysUserMapper userMapper;

    public List<OrgTreeNode> tree() {
        List<SysOrganization> organizations = organizationMapper.selectList(
                Wrappers.<SysOrganization>lambdaQuery().orderByAsc(SysOrganization::getSortNo));
        Map<Long, OrgTreeNode> nodeMap = new LinkedHashMap<>();
        for (SysOrganization organization : organizations) {
            nodeMap.put(organization.getId(), toNode(organization));
        }
        List<OrgTreeNode> roots = new ArrayList<>();
        for (SysOrganization organization : organizations) {
            OrgTreeNode node = nodeMap.get(organization.getId());
            OrgTreeNode parent = organization.getParentId() == null ? null : nodeMap.get(organization.getParentId());
            if (parent == null) {
                roots.add(node);
            } else {
                parent.getChildren().add(node);
            }
        }
        sort(roots);
        return roots;
    }

    public Long create(OrgSaveRequest request) {
        if (organizationMapper.countByOrgCode(request.getOrgCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "组织编码已存在: " + request.getOrgCode());
        }
        SysOrganization organization = new SysOrganization();
        applyRequest(organization, request);
        organizationMapper.insert(organization);
        return organization.getId();
    }

    public void update(Long orgId, OrgSaveRequest request) {
        SysOrganization organization = requireOrg(orgId);
        if (organizationMapper.countByOrgCode(request.getOrgCode(), orgId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "组织编码已存在: " + request.getOrgCode());
        }
        if (normalizeParentId(request.getParentId()).equals(orgId)) {
            throw new BusinessException("上级组织不能是自己");
        }
        applyRequest(organization, request);
        organizationMapper.updateById(organization);
    }

    public void delete(Long orgId) {
        requireOrg(orgId);
        Long childCount = organizationMapper.selectCount(
                Wrappers.<SysOrganization>lambdaQuery().eq(SysOrganization::getParentId, orgId));
        if (childCount != null && childCount > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "存在下级组织，无法删除");
        }
        Long userCount = userMapper.selectCount(Wrappers.<SysUser>lambdaQuery().eq(SysUser::getOrgId, orgId));
        if (userCount != null && userCount > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "组织下存在用户，无法删除");
        }
        organizationMapper.deleteById(orgId);
    }

    public String getOrgName(Long orgId) {
        if (orgId == null) {
            return null;
        }
        SysOrganization organization = organizationMapper.selectById(orgId);
        return organization == null ? null : organization.getOrgName();
    }

    private void applyRequest(SysOrganization organization, OrgSaveRequest request) {
        organization.setOrgCode(request.getOrgCode());
        organization.setOrgName(request.getOrgName());
        organization.setParentId(normalizeParentId(request.getParentId()));
        organization.setOrgType(StringUtils.hasText(request.getOrgType()) ? request.getOrgType() : "department");
        organization.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        organization.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        organization.setRemark(request.getRemark());
    }

    private Long normalizeParentId(Long parentId) {
        return parentId == null ? ROOT_PARENT_ID : parentId;
    }

    private SysOrganization requireOrg(Long orgId) {
        SysOrganization organization = organizationMapper.selectById(orgId);
        if (organization == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "组织不存在: " + orgId);
        }
        return organization;
    }

    private OrgTreeNode toNode(SysOrganization organization) {
        OrgTreeNode node = new OrgTreeNode();
        node.setOrgId(organization.getId());
        node.setOrgCode(organization.getOrgCode());
        node.setOrgName(organization.getOrgName());
        node.setParentId(normalizeParentId(organization.getParentId()));
        node.setOrgType(organization.getOrgType());
        node.setSortNo(organization.getSortNo());
        node.setStatus(organization.getStatus());
        return node;
    }

    private void sort(List<OrgTreeNode> nodes) {
        nodes.sort(Comparator.comparing(OrgTreeNode::getSortNo, Comparator.nullsLast(Comparator.naturalOrder())));
        nodes.forEach(node -> sort(node.getChildren()));
    }
}
