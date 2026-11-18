package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DocFolderItem;
import com.huaweicloud.plm.system.dto.DocFolderSaveRequest;
import com.huaweicloud.plm.system.entity.OaDocFolder;
import com.huaweicloud.plm.system.entity.OaDocument;
import com.huaweicloud.plm.system.mapper.OaDocFolderMapper;
import com.huaweicloud.plm.system.mapper.OaDocumentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 文档目录服务：公共/部门/项目/个人/共享/流程归档/知识库目录的增删改查与层级维护。
 * 目录采用物化路径（folder_path）维护层级，便于按前缀检索子目录与批量更新路径。
 */
@Service
@RequiredArgsConstructor
public class DocFolderService {

    public static final String STATUS_ENABLED = "enabled";
    private static final String DEFAULT_FOLDER_TYPE = "PUBLIC";

    private final OaDocFolderMapper folderMapper;
    private final OaDocumentMapper documentMapper;
    private final DocPermissionService permissionService;
    private final OaDocSupportService supportService;

    /** 目录树：仅返回当前用户可读的目录，父子关系按物化父子关系组装。 */
    public List<DocFolderItem> tree(String folderType) {
        List<OaDocFolder> folders = folderMapper.selectList(Wrappers.<OaDocFolder>lambdaQuery()
                .eq(OaDocFolder::getStatus, STATUS_ENABLED)
                .eq(StringUtils.hasText(folderType), OaDocFolder::getFolderType,
                        folderType == null ? null : folderType.trim().toUpperCase())
                .orderByAsc(OaDocFolder::getFolderLevel)
                .orderByAsc(OaDocFolder::getSortNo)
                .orderByAsc(OaDocFolder::getId));
        Map<Long, DocFolderItem> items = new LinkedHashMap<>();
        for (OaDocFolder folder : folders) {
            if (permissionService.effectiveFolderPermission(folder) == null) {
                continue;
            }
            items.put(folder.getId(), toItem(folder));
        }
        List<DocFolderItem> roots = new ArrayList<>();
        for (DocFolderItem item : items.values()) {
            DocFolderItem parent = item.getParentId() == null ? null : items.get(item.getParentId());
            if (parent == null) {
                roots.add(item);
            } else {
                if (parent.getChildren() == null) {
                    parent.setChildren(new ArrayList<>());
                }
                parent.getChildren().add(item);
            }
        }
        return roots;
    }

    /** 直接子目录列表。 */
    public List<DocFolderItem> list(Long parentId, String folderType) {
        List<OaDocFolder> folders = folderMapper.selectList(Wrappers.<OaDocFolder>lambdaQuery()
                .eq(parentId != null, OaDocFolder::getParentId, parentId)
                .eq(OaDocFolder::getStatus, STATUS_ENABLED)
                .eq(StringUtils.hasText(folderType), OaDocFolder::getFolderType,
                        folderType == null ? null : folderType.trim().toUpperCase())
                .orderByAsc(OaDocFolder::getSortNo)
                .orderByAsc(OaDocFolder::getId));
        return folders.stream()
                .filter(folder -> permissionService.effectiveFolderPermission(folder) != null)
                .map(this::toItem)
                .toList();
    }

    public DocFolderItem detail(Long folderId) {
        OaDocFolder folder = requireFolder(folderId);
        permissionService.requireFolderReadable(folder);
        return toItem(folder);
    }

    /** 目录下的全部子目录ID（含自身），供文档列表按目录范围过滤。 */
    public List<Long> resolveFolderIds(Long folderId, boolean includeSub) {
        if (folderId == null) {
            return List.of();
        }
        if (!includeSub) {
            return List.of(folderId);
        }
        OaDocFolder folder = folderMapper.selectById(folderId);
        if (folder == null || !StringUtils.hasText(folder.getFolderPath())) {
            return List.of(folderId);
        }
        List<Long> ids = new ArrayList<>();
        ids.add(folderId);
        folderMapper.selectList(Wrappers.<OaDocFolder>lambdaQuery()
                        .likeRight(OaDocFolder::getFolderPath, folder.getFolderPath() + "/"))
                .forEach(child -> ids.add(child.getId()));
        return ids;
    }

    @Transactional
    public Long create(DocFolderSaveRequest request) {
        if (!supportService.configBool("oa.doc.folder.custom.enabled", true)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "当前配置不允许创建自定义目录");
        }
        String code = normalizeCode(request.getFolderCode());
        if (folderMapper.countByCode(code, -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "目录编码已存在: " + code);
        }
        Long parentId = request.getParentId() == null ? 0L : request.getParentId();
        OaDocFolder parent = null;
        if (parentId > 0) {
            parent = requireFolder(parentId);
            permissionService.requireFolderManage(parent);
        }
        OaDocFolder folder = new OaDocFolder();
        folder.setFolderCode(code);
        folder.setFolderName(request.getFolderName());
        folder.setFolderType(normalizeType(request.getFolderType()));
        folder.setParentId(parentId);
        folder.setOwnerUserId(permissionService.currentUserId());
        folder.setOwnerDeptId(request.getOwnerDeptId() != null
                ? request.getOwnerDeptId() : permissionService.currentOrgId());
        folder.setCategoryCode(request.getCategoryCode());
        folder.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        folder.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_ENABLED);
        folder.setRemark(request.getRemark());
        folder.setFolderLevel(parent == null ? 1 : parent.getFolderLevel() == null ? 1 : parent.getFolderLevel() + 1);
        // 物化路径依赖自身编码，先插入主键再回写路径
        folder.setFolderPath("/");
        folderMapper.insert(folder);
        folder.setFolderPath((parent == null ? "" : parent.getFolderPath()) + "/" + code);
        folderMapper.updateById(folder);
        return folder.getId();
    }

    @Transactional
    public void update(Long folderId, DocFolderSaveRequest request) {
        OaDocFolder folder = requireFolder(folderId);
        permissionService.requireFolderManage(folder);
        String code = normalizeCode(request.getFolderCode());
        if (folderMapper.countByCode(code, folderId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "目录编码已存在: " + code);
        }
        Long newParentId = request.getParentId() == null ? folder.getParentId() : request.getParentId();
        if (Objects.equals(newParentId, folderId)) {
            throw new BusinessException("上级目录不能是自身");
        }
        OaDocFolder newParent = null;
        if (newParentId != null && newParentId > 0) {
            newParent = requireFolder(newParentId);
            if (isDescendant(newParent, folderId)) {
                throw new BusinessException("上级目录不能是自身的下级目录");
            }
            permissionService.requireFolderManage(newParent);
        }
        String oldPath = folder.getFolderPath();
        String newPath = (newParent == null ? "" : newParent.getFolderPath()) + "/" + code;
        folder.setFolderCode(code);
        folder.setFolderName(request.getFolderName());
        if (StringUtils.hasText(request.getFolderType())) {
            folder.setFolderType(normalizeType(request.getFolderType()));
        }
        folder.setParentId(newParentId == null ? 0L : newParentId);
        folder.setCategoryCode(request.getCategoryCode());
        if (request.getOwnerDeptId() != null) {
            folder.setOwnerDeptId(request.getOwnerDeptId());
        }
        if (request.getSortNo() != null) {
            folder.setSortNo(request.getSortNo());
        }
        if (StringUtils.hasText(request.getStatus())) {
            folder.setStatus(request.getStatus());
        }
        folder.setRemark(request.getRemark());
        folder.setFolderLevel(newParent == null ? 1 : newParent.getFolderLevel() == null ? 1 : newParent.getFolderLevel() + 1);
        folder.setFolderPath(newPath);
        folderMapper.updateById(folder);
        if (StringUtils.hasText(oldPath) && !oldPath.equals(newPath)) {
            cascadePath(oldPath, newPath);
        }
    }

    @Transactional
    public void delete(Long folderId) {
        OaDocFolder folder = requireFolder(folderId);
        permissionService.requireFolderManage(folder);
        if (folderMapper.countChildren(folderId) > 0) {
            throw new BusinessException("目录下存在子目录，无法删除");
        }
        if (documentMapper.countByFolder(folderId) > 0) {
            throw new BusinessException("目录下存在文档，无法删除");
        }
        folderMapper.deleteById(folderId);
    }

    public OaDocFolder requireFolder(Long folderId) {
        OaDocFolder folder = folderMapper.selectById(folderId);
        if (folder == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "目录不存在: " + folderId);
        }
        return folder;
    }

    public DocFolderItem toItem(OaDocFolder folder) {
        DocFolderItem item = new DocFolderItem();
        item.setId(folder.getId());
        item.setFolderCode(folder.getFolderCode());
        item.setFolderName(folder.getFolderName());
        item.setFolderType(folder.getFolderType());
        item.setParentId(folder.getParentId());
        item.setFolderPath(folder.getFolderPath());
        item.setFolderLevel(folder.getFolderLevel());
        item.setOwnerUserId(folder.getOwnerUserId());
        item.setOwnerDeptId(folder.getOwnerDeptId());
        item.setCategoryCode(folder.getCategoryCode());
        item.setSortNo(folder.getSortNo());
        item.setStatus(folder.getStatus());
        item.setRemark(folder.getRemark());
        item.setChildCount(folderMapper.countChildren(folder.getId()));
        item.setDocCount(documentMapper.countByFolder(folder.getId()));
        item.setEffectivePermission(permissionService.effectiveFolderPermission(folder));
        item.setCreatedAt(folder.getCreatedAt());
        return item;
    }

    /** 上级目录变更后同步刷新所有下级目录的物化路径与层级。 */
    private void cascadePath(String oldPath, String newPath) {
        List<OaDocFolder> descendants = folderMapper.selectList(Wrappers.<OaDocFolder>lambdaQuery()
                .likeRight(OaDocFolder::getFolderPath, oldPath + "/"));
        for (OaDocFolder child : descendants) {
            if (child.getFolderPath() == null || !child.getFolderPath().startsWith(oldPath + "/")) {
                continue;
            }
            String path = newPath + child.getFolderPath().substring(oldPath.length());
            child.setFolderPath(path);
            child.setFolderLevel(countLevel(path));
            folderMapper.updateById(child);
        }
    }

    private int countLevel(String path) {
        if (!StringUtils.hasText(path)) {
            return 1;
        }
        return (int) Arrays.stream(path.split("/")).filter(StringUtils::hasText).count();
    }

    /** 判断 candidate 是否为 ancestorId 的下级目录。 */
    private boolean isDescendant(OaDocFolder candidate, Long ancestorId) {
        Long current = candidate.getParentId();
        int guard = 0;
        while (current != null && current > 0 && guard++ < 50) {
            if (Objects.equals(current, ancestorId)) {
                return true;
            }
            OaDocFolder parent = folderMapper.selectById(current);
            if (parent == null) {
                break;
            }
            current = parent.getParentId();
        }
        return false;
    }

    private String normalizeCode(String code) {
        String value = code == null ? null : code.trim();
        if (!StringUtils.hasText(value)) {
            throw new BusinessException("目录编码不能为空");
        }
        return value;
    }

    private String normalizeType(String folderType) {
        return StringUtils.hasText(folderType) ? folderType.trim().toUpperCase() : DEFAULT_FOLDER_TYPE;
    }
}
