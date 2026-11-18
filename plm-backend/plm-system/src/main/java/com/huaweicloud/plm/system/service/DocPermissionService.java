package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.entity.OaDocFolder;
import com.huaweicloud.plm.system.entity.OaDocFolderPermission;
import com.huaweicloud.plm.system.entity.OaDocShare;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.entity.SysUserRole;
import com.huaweicloud.plm.system.mapper.OaDocFolderMapper;
import com.huaweicloud.plm.system.mapper.OaDocFolderPermissionMapper;
import com.huaweicloud.plm.system.mapper.OaDocShareMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 文档中心权限服务：以「目录 + 授权对象 + 权限级别」为核心，向子目录继承，并叠加分享授权。
 * 统一出口为 effectiveFolderPermission / evaluateDocument，检索过滤、下载控制与操作校验均复用该结果，
 * 保证「无权限内容不出现在结果中」与「分享撤销后访问即失效」。
 */
@Service
@RequiredArgsConstructor
public class DocPermissionService {

    public static final String LEVEL_READ = "READ";
    public static final String LEVEL_WRITE = "WRITE";
    public static final String LEVEL_MANAGE = "MANAGE";

    public static final String SUBJECT_ALL = "ALL";
    public static final String SUBJECT_DEPT = "DEPT";
    public static final String SUBJECT_ROLE = "ROLE";
    public static final String SUBJECT_USER = "USER";

    public static final String SHARE_INTERNAL = "INTERNAL";
    public static final String SHARE_LINK = "LINK";

    /** 目录层级遍历上限，防御历史脏数据形成的环。 */
    private static final int MAX_FOLDER_DEPTH = 50;

    private final OaDocFolderMapper folderMapper;
    private final OaDocFolderPermissionMapper folderPermissionMapper;
    private final OaDocShareMapper shareMapper;
    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final OaDocSupportService supportService;

    /** 文档访问结果：权限级别为 null 表示无权限，downloadAllowed 为下载控制结果。 */
    public record DocAccess(String level, boolean downloadAllowed) {

        public boolean readable() {
            return level != null;
        }

        public boolean writable() {
            return levelValue(level) >= levelValue(LEVEL_WRITE);
        }

        public boolean manageable() {
            return levelValue(level) >= levelValue(LEVEL_MANAGE);
        }
    }

    private record ShareAccess(String level, boolean downloadAllowed) {
    }

    // ---------------- 当前用户上下文 ----------------

    public Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }

    public Long currentOrgId() {
        SysUser user = userMapper.selectById(currentUserId());
        return user == null ? null : user.getOrgId();
    }

    public Set<Long> currentRoleIds() {
        return userRoleMapper.selectList(Wrappers.<SysUserRole>lambdaQuery()
                        .eq(SysUserRole::getUserId, currentUserId()))
                .stream().map(SysUserRole::getRoleId).filter(Objects::nonNull).collect(Collectors.toSet());
    }

    /** 管理员（ADMIN 角色持有的 * 通配权限）对全部目录与文档具备管理权限。 */
    public boolean isAdmin() {
        UserContext.Principal principal = UserContext.get();
        return principal != null && principal.hasPermission("*");
    }

    // ---------------- 目录权限 ----------------

    /**
     * 目录有效权限级别。
     * 判定顺序：管理员 → 目录属主 → 目录链上的授权记录（祖先需开启继承）→ 属主部门 → 默认级别。
     * 目录链上存在授权记录但均不匹配当前用户时返回 null（无权限）。
     */
    public String effectiveFolderPermission(OaDocFolder folder) {
        if (folder == null) {
            return null;
        }
        if (isAdmin()) {
            return LEVEL_MANAGE;
        }
        Long userId = currentUserId();
        if (folder.getOwnerUserId() != null && folder.getOwnerUserId().equals(userId)) {
            return LEVEL_MANAGE;
        }
        List<OaDocFolderPermission> rows = applicableRows(folderChain(folder));
        int best = 0;
        for (OaDocFolderPermission row : rows) {
            if (matchesSubject(row)) {
                best = Math.max(best, levelValue(row.getPermissionLevel()));
            }
        }
        if (best > 0) {
            return levelName(best);
        }
        if (folder.getOwnerDeptId() != null && folder.getOwnerDeptId().equals(currentOrgId())) {
            return LEVEL_WRITE;
        }
        if (rows.isEmpty()) {
            return defaultLevel();
        }
        return null;
    }

    /** 目录链：目标目录 + 各级祖先。 */
    private List<OaDocFolder> folderChain(OaDocFolder folder) {
        List<OaDocFolder> chain = new ArrayList<>();
        chain.add(folder);
        Long parentId = folder.getParentId();
        int guard = 0;
        while (parentId != null && parentId > 0 && guard++ < MAX_FOLDER_DEPTH) {
            OaDocFolder parent = folderMapper.selectById(parentId);
            if (parent == null) {
                break;
            }
            chain.add(parent);
            parentId = parent.getParentId();
        }
        return chain;
    }

    /** 目录链上适用的授权记录：目标目录全部适用，祖先目录仅适用开启继承的记录。 */
    private List<OaDocFolderPermission> applicableRows(List<OaDocFolder> chain) {
        List<Long> ids = chain.stream().map(OaDocFolder::getId).filter(Objects::nonNull).toList();
        if (ids.isEmpty()) {
            return Collections.emptyList();
        }
        Map<Long, Integer> distance = new HashMap<>();
        for (int i = 0; i < chain.size(); i++) {
            distance.put(chain.get(i).getId(), i);
        }
        List<OaDocFolderPermission> all = folderPermissionMapper.selectList(
                Wrappers.<OaDocFolderPermission>lambdaQuery().in(OaDocFolderPermission::getFolderId, ids));
        List<OaDocFolderPermission> result = new ArrayList<>();
        for (OaDocFolderPermission row : all) {
            Integer depth = distance.get(row.getFolderId());
            if (depth == null) {
                continue;
            }
            if (depth > 0 && !(row.getInheritFlag() != null && row.getInheritFlag() == 1)) {
                continue;
            }
            result.add(row);
        }
        return result;
    }

    private boolean matchesSubject(OaDocFolderPermission row) {
        String type = StringUtils.hasText(row.getSubjectType()) ? row.getSubjectType().trim().toUpperCase() : SUBJECT_ALL;
        Long subjectId = row.getSubjectId();
        switch (type) {
            case SUBJECT_ALL:
                return true;
            case SUBJECT_USER:
                return subjectId != null && subjectId.equals(currentUserId());
            case SUBJECT_DEPT:
                return subjectId != null && subjectId.equals(currentOrgId());
            case SUBJECT_ROLE:
                return subjectId != null && currentRoleIds().contains(subjectId);
            default:
                return false;
        }
    }

    // ---------------- 文档权限 ----------------

    /** 文档访问结果：目录权限与分享授权取较高者；下载权限需目录可见或分享明确允许。 */
    public DocAccess evaluateDocument(OaDocument doc) {
        if (doc == null) {
            return new DocAccess(null, false);
        }
        if (isAdmin()) {
            return new DocAccess(LEVEL_MANAGE, true);
        }
        Long userId = currentUserId();
        boolean owner = doc.getOwnerUserId() != null && doc.getOwnerUserId().equals(userId);
        String folderLevel = null;
        if (doc.getFolderId() != null) {
            folderLevel = effectiveFolderPermission(folderMapper.selectById(doc.getFolderId()));
        }
        ShareAccess share = bestShare(doc.getId());
        int best = Math.max(levelValue(folderLevel), levelValue(share.level()));
        if (owner) {
            best = Math.max(best, levelValue(LEVEL_MANAGE));
        }
        if (best <= 0) {
            return new DocAccess(null, false);
        }
        boolean download = owner || folderLevel != null || share.downloadAllowed();
        return new DocAccess(levelName(best), download);
    }

    /** 对当前用户生效的最高分享权限（未撤销且未过期）。 */
    private ShareAccess bestShare(Long docId) {
        if (docId == null) {
            return new ShareAccess(null, false);
        }
        Long userId = currentUserId();
        Long orgId = currentOrgId();
        LocalDateTime now = LocalDateTime.now();
        List<OaDocShare> shares = shareMapper.selectList(Wrappers.<OaDocShare>lambdaQuery()
                .eq(OaDocShare::getDocId, docId)
                .eq(OaDocShare::getRevokedFlag, 0));
        int best = 0;
        boolean download = false;
        for (OaDocShare share : shares) {
            if (share.getExpireAt() != null && share.getExpireAt().isBefore(now)) {
                continue;
            }
            boolean targeted = (share.getTargetUserId() != null && share.getTargetUserId().equals(userId))
                    || (share.getTargetDeptId() != null && orgId != null && share.getTargetDeptId().equals(orgId));
            if (!targeted) {
                continue;
            }
            int value = levelValue(share.getPermissionLevel());
            if (value > best) {
                best = value;
                download = isDownloadAllowed(share);
            } else if (value == best && isDownloadAllowed(share)) {
                download = true;
            }
        }
        return new ShareAccess(levelName(best), download);
    }

    private boolean isDownloadAllowed(OaDocShare share) {
        return share.getDownloadAllowed() == null || share.getDownloadAllowed() == 1;
    }

    /** 链接分享访问：校验撤销与有效期，返回有效分享记录。 */
    public OaDocShare requireValidLink(String shareNo) {
        if (!StringUtils.hasText(shareNo)) {
            throw new BusinessException("分享编号不能为空");
        }
        OaDocShare share = shareMapper.selectOne(Wrappers.<OaDocShare>lambdaQuery()
                .eq(OaDocShare::getShareNo, shareNo.trim())
                .last("LIMIT 1"));
        if (share == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分享不存在或已失效");
        }
        if (share.getRevokedFlag() != null && share.getRevokedFlag() == 1) {
            throw new BusinessException(ResultCode.FORBIDDEN, "分享已撤销");
        }
        if (share.getExpireAt() != null && share.getExpireAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "分享已过期");
        }
        return share;
    }

    // ---------------- 权限断言 ----------------

    public String requireFolderReadable(OaDocFolder folder) {
        String level = effectiveFolderPermission(folder);
        if (level == null) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该目录");
        }
        return level;
    }

    public String requireFolderWritable(OaDocFolder folder) {
        String level = effectiveFolderPermission(folder);
        if (levelValue(level) < levelValue(LEVEL_WRITE)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "需要目录写权限");
        }
        return level;
    }

    public String requireFolderManage(OaDocFolder folder) {
        String level = effectiveFolderPermission(folder);
        if (levelValue(level) < levelValue(LEVEL_MANAGE)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "需要目录管理权限");
        }
        return level;
    }

    public DocAccess requireDocumentReadable(OaDocument doc) {
        DocAccess access = evaluateDocument(doc);
        if (!access.readable()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该文档");
        }
        return access;
    }

    public DocAccess requireDocumentWritable(OaDocument doc) {
        DocAccess access = evaluateDocument(doc);
        if (!access.writable()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "需要文档写权限");
        }
        return access;
    }

    public DocAccess requireDocumentManage(OaDocument doc) {
        DocAccess access = evaluateDocument(doc);
        if (!access.manageable()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "需要文档管理权限");
        }
        return access;
    }

    public DocAccess requireDownloadable(OaDocument doc) {
        DocAccess access = evaluateDocument(doc);
        if (!access.readable()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该文档");
        }
        if (!access.downloadAllowed()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "该分享未授予下载权限");
        }
        return access;
    }

    // ---------------- 级别工具 ----------------

    public static int levelValue(String level) {
        if (!StringUtils.hasText(level)) {
            return 0;
        }
        switch (level.trim().toUpperCase()) {
            case LEVEL_MANAGE:
                return 3;
            case LEVEL_WRITE:
                return 2;
            case LEVEL_READ:
                return 1;
            default:
                return 0;
        }
    }

    public static String levelName(int value) {
        if (value >= 3) {
            return LEVEL_MANAGE;
        }
        if (value == 2) {
            return LEVEL_WRITE;
        }
        if (value == 1) {
            return LEVEL_READ;
        }
        return null;
    }

    private String defaultLevel() {
        String value = supportService.config("oa.doc.default.permission.level", LEVEL_READ);
        return StringUtils.hasText(value) ? value.trim().toUpperCase() : LEVEL_READ;
    }
}
