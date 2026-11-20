package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.RoleQuery;
import com.huaweicloud.plm.system.dto.RoleResponse;
import com.huaweicloud.plm.system.dto.RoleSaveRequest;
import com.huaweicloud.plm.system.entity.SysRole;
import com.huaweicloud.plm.system.entity.SysRolePermission;
import com.huaweicloud.plm.system.entity.SysUserRole;
import com.huaweicloud.plm.system.mapper.SysRoleMapper;
import com.huaweicloud.plm.system.mapper.SysRolePermissionMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private static final String DEFAULT_DATA_SCOPE = "org";

    private final SysRoleMapper roleMapper;
    private final SysRolePermissionMapper rolePermissionMapper;
    private final SysUserRoleMapper userRoleMapper;

    public PageResult<RoleResponse> page(RoleQuery query) {
        Page<SysRole> page = query.toPage();
        roleMapper.selectPage(page, Wrappers.<SysRole>lambdaQuery()
                .eq(query.getStatus() != null, SysRole::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysRole::getRoleCode, query.getKeyword()).or()
                        .like(SysRole::getRoleName, query.getKeyword()))
                .orderByAsc(SysRole::getRoleCode));
        return PageResult.of(page, this::toResponse);
    }

    public List<SysRole> listAll() {
        return roleMapper.selectList(Wrappers.<SysRole>lambdaQuery()
                .eq(SysRole::getStatus, 1)
                .orderByAsc(SysRole::getRoleCode));
    }

    @Transactional
    public Long create(RoleSaveRequest request) {
        if (roleMapper.countByRoleCode(request.getRoleCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "角色编码已存在: " + request.getRoleCode());
        }
        SysRole role = new SysRole();
        applyRequest(role, request);
        roleMapper.insert(role);
        return role.getId();
    }

    @Transactional
    public void update(Long roleId, RoleSaveRequest request) {
        SysRole role = requireRole(roleId);
        if (roleMapper.countByRoleCode(request.getRoleCode(), roleId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "角色编码已存在: " + request.getRoleCode());
        }
        applyRequest(role, request);
        roleMapper.updateById(role);
    }

    @Transactional
    public void delete(Long roleId) {
        requireRole(roleId);
        Long userCount = userRoleMapper.selectCount(
                Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getRoleId, roleId));
        if (userCount != null && userCount > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该角色已分配给用户，无法删除");
        }
        roleMapper.deleteById(roleId);
        rolePermissionMapper.delete(Wrappers.<SysRolePermission>lambdaQuery()
                .eq(SysRolePermission::getRoleId, roleId));
    }

    public List<Long> listPermissionIds(Long roleId) {
        requireRole(roleId);
        return rolePermissionMapper.selectList(Wrappers.<SysRolePermission>lambdaQuery()
                        .eq(SysRolePermission::getRoleId, roleId))
                .stream().map(SysRolePermission::getPermissionId).toList();
    }

    @Transactional
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        requireRole(roleId);
        rolePermissionMapper.physicalDeleteByRoleId(roleId);
        if (CollectionUtils.isEmpty(permissionIds)) {
            return;
        }
        permissionIds.stream().distinct().forEach(permissionId -> {
            SysRolePermission mapping = new SysRolePermission();
            mapping.setRoleId(roleId);
            mapping.setPermissionId(permissionId);
            rolePermissionMapper.insert(mapping);
        });
    }

    private void applyRequest(SysRole role, RoleSaveRequest request) {
        role.setRoleCode(request.getRoleCode());
        role.setRoleName(request.getRoleName());
        role.setDataScope(StringUtils.hasText(request.getDataScope()) ? request.getDataScope() : DEFAULT_DATA_SCOPE);
        role.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        role.setRemark(request.getRemark());
    }

    private SysRole requireRole(Long roleId) {
        SysRole role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "角色不存在: " + roleId);
        }
        return role;
    }

    private RoleResponse toResponse(SysRole role) {
        RoleResponse response = new RoleResponse();
        response.setRoleId(role.getId());
        response.setRoleCode(role.getRoleCode());
        response.setRoleName(role.getRoleName());
        response.setDataScope(role.getDataScope());
        response.setStatus(role.getStatus());
        response.setRemark(role.getRemark());
        response.setCreatedAt(role.getCreatedAt());
        return response;
    }
}
