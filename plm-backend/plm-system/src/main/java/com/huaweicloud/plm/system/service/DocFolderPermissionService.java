package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocFolderPermissionItem;
import com.huaweicloud.plm.system.dto.DocFolderPermissionSaveRequest;
import com.huaweicloud.plm.system.entity.OaDocFolder;
import com.huaweicloud.plm.system.entity.OaDocFolderPermission;
import com.huaweicloud.plm.system.entity.SysOrganization;
import com.huaweicloud.plm.system.entity.SysRole;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaDocFolderPermissionMapper;
import com.huaweicloud.plm.system.mapper.SysOrganizationMapper;
import com.huaweicloud.plm.system.mapper.SysRoleMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 目录权限映射服务：维护「目录 + 授权对象（所有人/部门/角色/用户）+ 权限级别」，
 * 与 DocPermissionService 的判定逻辑一一对应，支持向子目录继承。
 */
@Service
@RequiredArgsConstructor
public class DocFolderPermissionService {

    private static final String SUBJECT_ALL = DocPermissionService.SUBJECT_ALL;
    private static final String SUBJECT_DEPT = DocPermissionService.SUBJECT_DEPT;
    private static final String SUBJECT_ROLE = DocPermissionService.SUBJECT_ROLE;
    private static final String SUBJECT_USER = DocPermissionService.SUBJECT_USER;
    private static final String ALL_SUBJECT_NAME = "所有人";

    private final OaDocFolderPermissionMapper permissionMapper;
    private final DocFolderService folderService;
    private final DocPermissionService permissionService;
    private final SysRoleMapper roleMapper;
    private final SysOrganizationMapper organizationMapper;
    private final SysUserMapper userMapper;

    public List<DocFolderPermissionItem> list(Long folderId) {
        OaDocFolder folder = folderService.requireFolder(folderId);
        permissionService.requireFolderReadable(folder);
        return permissionMapper.selectList(Wrappers.<OaDocFolderPermission>lambdaQuery()
                        .eq(OaDocFolderPermission::getFolderId, folderId)
                        .orderByAsc(OaDocFolderPermission::getSubjectType)
                        .orderByAsc(OaDocFolderPermission::getId))
                .stream().map(this::toItem).toList();
    }

    @Transactional
    public Long create(Long folderId, DocFolderPermissionSaveRequest request) {
        OaDocFolder folder = folderService.requireFolder(folderId);
        permissionService.requireFolderManage(folder);
        String subjectType = normalizeSubjectType(request.getSubjectType());
        Long subjectId = SUBJECT_ALL.equals(subjectType) ? null : request.getSubjectId();
        if (!SUBJECT_ALL.equals(subjectType) && subjectId == null) {
            throw new BusinessException("授权对象不能为空");
        }
        ensureNotDuplicated(folderId, subjectType, subjectId, -1L);
        OaDocFolderPermission entity = new OaDocFolderPermission();
        entity.setFolderId(folderId);
        entity.setSubjectType(subjectType);
        entity.setSubjectId(subjectId);
        entity.setPermissionLevel(normalizeLevel(request.getPermissionLevel()));
        entity.setInheritFlag(request.getInheritFlag() == null ? 1 : request.getInheritFlag());
        entity.setRemark(request.getRemark());
        permissionMapper.insert(entity);
        return entity.getId();
    }

    @Transactional
    public void update(Long permissionId, DocFolderPermissionSaveRequest request) {
        OaDocFolderPermission entity = requirePermission(permissionId);
        OaDocFolder folder = folderService.requireFolder(entity.getFolderId());
        permissionService.requireFolderManage(folder);
        String subjectType = normalizeSubjectType(request.getSubjectType());
        Long subjectId = SUBJECT_ALL.equals(subjectType) ? null : request.getSubjectId();
        if (!SUBJECT_ALL.equals(subjectType) && subjectId == null) {
            throw new BusinessException("授权对象不能为空");
        }
        ensureNotDuplicated(entity.getFolderId(), subjectType, subjectId, permissionId);
        entity.setSubjectType(subjectType);
        entity.setSubjectId(subjectId);
        entity.setPermissionLevel(normalizeLevel(request.getPermissionLevel()));
        entity.setInheritFlag(request.getInheritFlag() == null ? entity.getInheritFlag() : request.getInheritFlag());
        entity.setRemark(request.getRemark());
        permissionMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long permissionId) {
        OaDocFolderPermission entity = requirePermission(permissionId);
        OaDocFolder folder = folderService.requireFolder(entity.getFolderId());
        permissionService.requireFolderManage(folder);
        permissionMapper.deleteById(permissionId);
    }

    public DocFolderPermissionItem toItem(OaDocFolderPermission entity) {
        DocFolderPermissionItem item = new DocFolderPermissionItem();
        item.setId(entity.getId());
        item.setFolderId(entity.getFolderId());
        item.setSubjectType(entity.getSubjectType());
        item.setSubjectId(entity.getSubjectId());
        item.setSubjectName(resolveSubjectName(entity.getSubjectType(), entity.getSubjectId()));
        item.setPermissionLevel(entity.getPermissionLevel());
        item.setInheritFlag(entity.getInheritFlag());
        item.setRemark(entity.getRemark());
        item.setCreatedAt(entity.getCreatedAt());
        return item;
    }

    private OaDocFolderPermission requirePermission(Long permissionId) {
        OaDocFolderPermission entity = permissionMapper.selectById(permissionId);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "目录授权记录不存在: " + permissionId);
        }
        return entity;
    }

    private void ensureNotDuplicated(Long folderId, String subjectType, Long subjectId, Long excludeId) {
        long count = permissionMapper.selectCount(Wrappers.<OaDocFolderPermission>lambdaQuery()
                .eq(OaDocFolderPermission::getFolderId, folderId)
                .eq(OaDocFolderPermission::getSubjectType, subjectType)
                .eq(subjectId != null, OaDocFolderPermission::getSubjectId, subjectId)
                .isNull(subjectId == null, OaDocFolderPermission::getSubjectId)
                .ne(excludeId != null && excludeId > 0, OaDocFolderPermission::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该目录已存在相同授权对象的权限配置");
        }
    }

    private String resolveSubjectName(String subjectType, Long subjectId) {
        if (!StringUtils.hasText(subjectType) || SUBJECT_ALL.equalsIgnoreCase(subjectType)) {
            return ALL_SUBJECT_NAME;
        }
        if (subjectId == null) {
            return null;
        }
        String type = subjectType.trim().toUpperCase();
        if (SUBJECT_ROLE.equals(type)) {
            SysRole role = roleMapper.selectById(subjectId);
            return role == null ? null : role.getRoleName();
        }
        if (SUBJECT_DEPT.equals(type)) {
            SysOrganization org = organizationMapper.selectById(subjectId);
            return org == null ? null : org.getOrgName();
        }
        if (SUBJECT_USER.equals(type)) {
            SysUser user = userMapper.selectById(subjectId);
            if (user == null) {
                return null;
            }
            return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
        }
        return null;
    }

    private String normalizeSubjectType(String subjectType) {
        String value = StringUtils.hasText(subjectType) ? subjectType.trim().toUpperCase() : null;
        if (value == null) {
            throw new BusinessException("授权对象类型不能为空");
        }
        if (!SUBJECT_ALL.equals(value) && !SUBJECT_DEPT.equals(value)
                && !SUBJECT_ROLE.equals(value) && !SUBJECT_USER.equals(value)) {
            throw new BusinessException("不支持的授权对象类型: " + subjectType);
        }
        return value;
    }

    private String normalizeLevel(String level) {
        String value = StringUtils.hasText(level) ? level.trim().toUpperCase() : null;
        if (value == null || DocPermissionService.levelValue(value) == 0) {
            throw new BusinessException("不支持的权限级别: " + level);
        }
        return value;
    }
}
