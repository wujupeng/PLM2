package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.PermissionTreeNode;
import com.huaweicloud.plm.system.entity.SysPermission;
import com.huaweicloud.plm.system.entity.SysRolePermission;
import com.huaweicloud.plm.system.entity.SysUserRole;
import com.huaweicloud.plm.system.mapper.SysPermissionMapper;
import com.huaweicloud.plm.system.mapper.SysRolePermissionMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private static final Long ROOT_PARENT_ID = 0L;

    private final SysPermissionMapper permissionMapper;
    private final SysRolePermissionMapper rolePermissionMapper;
    private final SysUserRoleMapper userRoleMapper;

    /**
     * 查询用户拥有的全部权限编码（菜单、按钮、接口）。
     */
    public List<String> listPermissionCodesByUserId(Long userId) {
        List<Long> roleIds = userRoleMapper.selectList(
                        Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId))
                .stream().map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return Collections.emptyList();
        }
        return listPermissionCodesByRoleIds(roleIds);
    }

    public List<Long> listPermissionIdsByRoleId(Long roleId) {
        return rolePermissionMapper.selectList(
                        Wrappers.<SysRolePermission>lambdaQuery().eq(SysRolePermission::getRoleId, roleId))
                .stream().map(SysRolePermission::getPermissionId).toList();
    }

    public List<SysPermission> listAll() {
        return permissionMapper.selectList(Wrappers.<SysPermission>lambdaQuery()
                .eq(SysPermission::getStatus, 1)
                .orderByAsc(SysPermission::getSortNo));
    }

    public List<PermissionTreeNode> tree() {
        List<SysPermission> permissions = listAll();
        Map<Long, PermissionTreeNode> nodeMap = new LinkedHashMap<>();
        for (SysPermission permission : permissions) {
            nodeMap.put(permission.getId(), toNode(permission));
        }
        List<PermissionTreeNode> roots = new ArrayList<>();
        for (SysPermission permission : permissions) {
            PermissionTreeNode node = nodeMap.get(permission.getId());
            Long parentId = permission.getParentId();
            PermissionTreeNode parent = parentId == null ? null : nodeMap.get(parentId);
            if (parent == null) {
                roots.add(node);
            } else {
                parent.getChildren().add(node);
            }
        }
        sort(roots);
        return roots;
    }

    public Long create(SysPermission permission) {
        permission.setId(null);
        permissionMapper.insert(permission);
        return permission.getId();
    }

    public void update(Long permissionId, SysPermission permission) {
        if (permissionMapper.selectById(permissionId) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "权限不存在: " + permissionId);
        }
        permission.setId(permissionId);
        permissionMapper.updateById(permission);
    }

    public void delete(Long permissionId) {
        Long childCount = permissionMapper.selectCount(
                Wrappers.<SysPermission>lambdaQuery().eq(SysPermission::getParentId, permissionId));
        if (childCount != null && childCount > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "存在下级权限，无法删除");
        }
        permissionMapper.deleteById(permissionId);
        rolePermissionMapper.delete(Wrappers.<SysRolePermission>lambdaQuery()
                .eq(SysRolePermission::getPermissionId, permissionId));
    }

    private List<String> listPermissionCodesByRoleIds(List<Long> roleIds) {
        List<Long> permissionIds = rolePermissionMapper.selectList(
                        Wrappers.<SysRolePermission>lambdaQuery().in(SysRolePermission::getRoleId, roleIds))
                .stream().map(SysRolePermission::getPermissionId).distinct().toList();
        if (CollectionUtils.isEmpty(permissionIds)) {
            return Collections.emptyList();
        }
        return permissionMapper.selectBatchIds(permissionIds).stream()
                .filter(permission -> permission.getStatus() != null && permission.getStatus() == 1)
                .map(SysPermission::getPermissionCode)
                .distinct()
                .collect(Collectors.toList());
    }

    private PermissionTreeNode toNode(SysPermission permission) {
        PermissionTreeNode node = new PermissionTreeNode();
        node.setPermissionId(permission.getId());
        node.setPermissionCode(permission.getPermissionCode());
        node.setPermissionName(permission.getPermissionName());
        node.setPermissionType(permission.getPermissionType());
        node.setParentId(permission.getParentId() == null ? ROOT_PARENT_ID : permission.getParentId());
        node.setPath(permission.getPath());
        node.setIcon(permission.getIcon());
        node.setSortNo(permission.getSortNo());
        node.setStatus(permission.getStatus());
        return node;
    }

    private void sort(List<PermissionTreeNode> nodes) {
        nodes.sort(Comparator.comparing(PermissionTreeNode::getSortNo,
                Comparator.nullsLast(Comparator.naturalOrder())));
        nodes.forEach(node -> sort(node.getChildren()));
    }
}
