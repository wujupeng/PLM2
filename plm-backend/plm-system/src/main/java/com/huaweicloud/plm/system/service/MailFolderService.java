package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MailFolderSaveRequest;
import com.huaweicloud.plm.system.entity.OaMailFolder;
import com.huaweicloud.plm.system.entity.OaMailRecipient;
import com.huaweicloud.plm.system.mapper.OaMailFolderMapper;
import com.huaweicloud.plm.system.mapper.OaMailRecipientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

/**
 * 邮件文件夹服务：系统文件夹在首次访问时自动初始化，自定义文件夹由用户自行维护。
 */
@Service
@RequiredArgsConstructor
public class MailFolderService {

    public static final String CODE_INBOX = "INBOX";
    public static final String CODE_SENT = "SENT";
    public static final String CODE_DRAFT = "DRAFT";
    public static final String CODE_TRASH = "TRASH";
    public static final String CODE_STARRED = "STARRED";

    private static final String TYPE_SYSTEM = "SYSTEM";
    private static final String TYPE_CUSTOM = "CUSTOM";

    private final OaMailFolderMapper folderMapper;
    private final OaMailRecipientMapper recipientMapper;
    private final OaMailSupportService supportService;

    /** 当前用户的文件夹清单：不存在时按系统默认集自动初始化。 */
    public List<OaMailFolder> listForCurrentUser() {
        Long userId = currentUserId();
        List<OaMailFolder> folders = listByOwner(userId);
        if (folders.isEmpty()) {
            initSystemFolders(userId);
            folders = listByOwner(userId);
        }
        return folders;
    }

    @Transactional
    public Long create(MailFolderSaveRequest request) {
        Long userId = currentUserId();
        if (!supportService.configBool("oa.mail.folder.custom.enabled", true)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "当前配置不允许创建自定义邮件文件夹");
        }
        String folderCode = request.getFolderCode().trim().toUpperCase();
        if (listByOwner(userId).stream().anyMatch(folder -> folderCode.equals(folder.getFolderCode()))) {
            throw new BusinessException(ResultCode.CONFLICT, "文件夹编码已存在: " + folderCode);
        }
        OaMailFolder folder = new OaMailFolder();
        folder.setFolderCode(folderCode);
        folder.setFolderName(request.getFolderName());
        folder.setFolderType(TYPE_CUSTOM);
        folder.setOwnerUserId(userId);
        folder.setSortNo(request.getSortNo() == null ? 100 : request.getSortNo());
        folder.setStatus("enabled");
        folder.setRemark(request.getRemark());
        folderMapper.insert(folder);
        return folder.getId();
    }

    public void update(Long folderId, MailFolderSaveRequest request) {
        OaMailFolder folder = requireOwned(folderId);
        if (TYPE_SYSTEM.equals(folder.getFolderType())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "系统文件夹不允许修改");
        }
        folder.setFolderName(request.getFolderName());
        if (request.getSortNo() != null) {
            folder.setSortNo(request.getSortNo());
        }
        folder.setRemark(request.getRemark());
        folderMapper.updateById(folder);
    }

    /** 删除自定义文件夹：文件夹内的邮件退回收件箱，避免邮件丢失。 */
    @Transactional
    public void delete(Long folderId) {
        OaMailFolder folder = requireOwned(folderId);
        if (TYPE_SYSTEM.equals(folder.getFolderType())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "系统文件夹不允许删除");
        }
        recipientMapper.update(null, Wrappers.<OaMailRecipient>lambdaUpdate()
                .eq(OaMailRecipient::getFolderCode, folder.getFolderCode())
                .set(OaMailRecipient::getFolderCode, CODE_INBOX));
        folderMapper.deleteById(folderId);
    }

    public OaMailFolder requireOwned(Long folderId) {
        Long userId = currentUserId();
        OaMailFolder folder = folderMapper.selectById(folderId);
        if (folder == null || !Objects.equals(folder.getOwnerUserId(), userId)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "邮件文件夹不存在: " + folderId);
        }
        return folder;
    }

    /** 校验目标文件夹可用：系统文件夹直接通过，自定义文件夹需属于当前用户。 */
    public boolean isUsableFolder(String folderCode, Long userId) {
        if (!StringUtils.hasText(folderCode)) {
            return false;
        }
        String code = folderCode.trim().toUpperCase();
        if (List.of(CODE_INBOX, CODE_TRASH).contains(code)) {
            return true;
        }
        return listByOwner(userId).stream().anyMatch(folder -> code.equals(folder.getFolderCode()));
    }

    private List<OaMailFolder> listByOwner(Long userId) {
        return folderMapper.selectList(Wrappers.<OaMailFolder>lambdaQuery()
                .eq(OaMailFolder::getOwnerUserId, userId)
                .orderByAsc(OaMailFolder::getSortNo)
                .orderByAsc(OaMailFolder::getId));
    }

    private void initSystemFolders(Long userId) {
        insertSystemFolder(userId, CODE_INBOX, "收件箱", 1);
        insertSystemFolder(userId, CODE_SENT, "已发送", 2);
        insertSystemFolder(userId, CODE_DRAFT, "草稿箱", 3);
        insertSystemFolder(userId, CODE_TRASH, "已删除", 4);
        insertSystemFolder(userId, CODE_STARRED, "星标邮件", 5);
    }

    private void insertSystemFolder(Long userId, String code, String name, int sortNo) {
        OaMailFolder folder = new OaMailFolder();
        folder.setFolderCode(code);
        folder.setFolderName(name);
        folder.setFolderType(TYPE_SYSTEM);
        folder.setOwnerUserId(userId);
        folder.setSortNo(sortNo);
        folder.setStatus("enabled");
        folderMapper.insert(folder);
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }
}
