package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.PasswordHasher;
import com.huaweicloud.plm.system.dto.UserInfoResponse;
import com.huaweicloud.plm.system.dto.UserQuery;
import com.huaweicloud.plm.system.dto.UserResponse;
import com.huaweicloud.plm.system.dto.UserSaveRequest;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysRole;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.entity.SysUserRole;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysRoleMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    public static final String ADMIN_ROLE_CODE = "ADMIN";
    public static final String WILDCARD_PERMISSION = "*";

    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMapper roleMapper;
    private final SysOrganizationMapper organizationMapper;
    private final PermissionService permissionService;

    public PageResult<UserResponse> page(UserQuery query) {
        Page<SysUser> page = query.toPage();
        var wrapper = Wrappers.<SysUser>lambdaQuery()
                .eq(query.getStatus() != null, SysUser::getStatus, query.getStatus())
                .eq(query.getOrgId() != null, SysUser::getOrgId, query.getOrgId())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysUser::getUsername, query.getKeyword()).or()
                        .like(SysUser::getDisplayName, query.getKeyword()))
                .orderByDesc(SysUser::getCreatedAt);
        userMapper.selectPage(page, wrapper);

        Map<Long, List<Long>> roleIdsByUser = loadRoleIds(page.getRecords().stream().map(SysUser::getId).toList());
        Map<Long, String> orgNames = loadOrgNames(page.getRecords().stream()
                .map(SysUser::getOrgId).filter(java.util.Objects::nonNull).distinct().toList());
        return PageResult.of(page, user -> toResponse(user, roleIdsByUser, orgNames));
    }

    public UserResponse getById(Long userId) {
        SysUser user = requireUser(userId);
        return toResponse(user,
                loadRoleIds(List.of(userId)),
                loadOrgNames(user.getOrgId() == null ? List.of() : List.of(user.getOrgId())));
    }

    @Transactional
    public Long create(UserSaveRequest request) {
        if (!StringUtils.hasText(request.getPassword())) {
            throw new BusinessException("新建用户必须设置初始密码");
        }
        if (userMapper.countByUsername(request.getUsername()) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "用户名已存在: " + request.getUsername());
        }
        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(PasswordHasher.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setOrgId(request.getOrgId());
        user.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        user.setRemark(request.getRemark());
        userMapper.insert(user);
        saveUserRoles(user.getId(), request.getRoleIds());
        return user.getId();
    }

    @Transactional
    public void update(Long userId, UserSaveRequest request) {
        SysUser user = requireUser(userId);
        if (!user.getUsername().equals(request.getUsername())
                && userMapper.countByUsername(request.getUsername()) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "用户名已存在: " + request.getUsername());
        }
        user.setUsername(request.getUsername());
        user.setDisplayName(request.getDisplayName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setOrgId(request.getOrgId());
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        user.setRemark(request.getRemark());
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(PasswordHasher.encode(request.getPassword()));
        }
        userMapper.updateById(user);
        if (request.getRoleIds() != null) {
            userRoleMapper.delete(Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId));
            saveUserRoles(userId, request.getRoleIds());
        }
    }

    @Transactional
    public void delete(Long userId) {
        requireUser(userId);
        userMapper.deleteById(userId);
        userRoleMapper.delete(Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId));
    }

    public void changeStatus(Long userId, Integer status) {
        SysUser user = requireUser(userId);
        user.setStatus(status);
        userMapper.updateById(user);
    }

    public void resetPassword(Long userId, String rawPassword) {
        if (!StringUtils.hasText(rawPassword)) {
            throw new BusinessException("新密码不能为空");
        }
        SysUser user = requireUser(userId);
        user.setPassword(PasswordHasher.encode(rawPassword));
        userMapper.updateById(user);
    }

    public SysUser findByUsername(String username) {
        return userMapper.selectOne(Wrappers.<SysUser>lambdaQuery().eq(SysUser::getUsername, username));
    }

    public void recordLoginSuccess(Long userId) {
        SysUser user = new SysUser();
        user.setId(userId);
        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);
    }

    /**
     * 组装登录用户信息：角色编码、权限编码与所属组织。
     */
    public UserInfoResponse buildUserInfo(Long userId) {
        SysUser user = requireUser(userId);
        List<SysRole> roles = listRolesByUserId(userId);
        List<String> roleCodes = roles.stream().map(SysRole::getRoleCode).toList();
        List<String> permissions = roleCodes.contains(ADMIN_ROLE_CODE)
                ? List.of(WILDCARD_PERMISSION)
                : permissionService.listPermissionCodesByUserId(userId);

        UserInfoResponse info = new UserInfoResponse();
        info.setUserId(user.getId());
        info.setUsername(user.getUsername());
        info.setDisplayName(user.getDisplayName());
        info.setRoles(roleCodes);
        info.setPermissions(permissions);
        info.setOrgId(user.getOrgId());
        info.setOrganization(user.getOrgId() == null ? null : loadOrgNames(List.of(user.getOrgId()))
                .get(user.getOrgId()));
        return info;
    }

    public List<SysRole> listRolesByUserId(Long userId) {
        List<Long> roleIds = userRoleMapper.selectList(
                        Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId))
                .stream().map(SysUserRole::getRoleId).toList();
        if (roleIds.isEmpty()) {
            return Collections.emptyList();
        }
        return roleMapper.selectBatchIds(roleIds);
    }

    private void saveUserRoles(Long userId, List<Long> roleIds) {
        if (CollectionUtils.isEmpty(roleIds)) {
            return;
        }
        roleIds.stream().distinct().forEach(roleId -> {
            SysUserRole userRole = new SysUserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            userRoleMapper.insert(userRole);
        });
    }

    private SysUser requireUser(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在: " + userId);
        }
        return user;
    }

    private Map<Long, List<Long>> loadRoleIds(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyMap();
        }
        return userRoleMapper.selectList(Wrappers.<SysUserRole>lambdaQuery().in(SysUserRole::getUserId, userIds))
                .stream()
                .collect(Collectors.groupingBy(SysUserRole::getUserId,
                        Collectors.mapping(SysUserRole::getRoleId, Collectors.toList())));
    }

    private Map<Long, String> loadOrgNames(List<Long> orgIds) {
        if (CollectionUtils.isEmpty(orgIds)) {
            return Collections.emptyMap();
        }
        return organizationMapper.selectBatchIds(orgIds).stream()
                .collect(Collectors.toMap(SysOrganization::getId, SysOrganization::getOrgName, (a, b) -> a));
    }

    private UserResponse toResponse(SysUser user, Map<Long, List<Long>> roleIdsByUser, Map<Long, String> orgNames) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setDisplayName(user.getDisplayName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setOrgId(user.getOrgId());
        response.setOrgName(user.getOrgId() == null ? null : orgNames.get(user.getOrgId()));
        response.setStatus(user.getStatus());
        response.setRoleIds(roleIdsByUser.getOrDefault(user.getId(), Collections.emptyList()));
        response.setRemark(user.getRemark());
        response.setLastLoginAt(user.getLastLoginAt());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
