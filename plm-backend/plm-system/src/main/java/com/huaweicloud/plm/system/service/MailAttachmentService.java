package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MailAttachmentItem;
import com.huaweicloud.plm.system.entity.OaMailAttachment;
import com.huaweicloud.plm.system.entity.OaMailMessage;
import com.huaweicloud.plm.system.entity.OaMailRecipient;
import com.huaweicloud.plm.system.mapper.OaMailAttachmentMapper;
import com.huaweicloud.plm.system.mapper.OaMailMessageMapper;
import com.huaweicloud.plm.system.mapper.OaMailRecipientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;

/**
 * 邮件附件服务：本地目录存储 + SHA-256 去重 + 下载授权校验，病毒扫描通过可插拔开关接入（IF-OA-08）。
 * 生产环境可将存储目录替换为对象存储，不影响上层接口。
 */
@Service
@RequiredArgsConstructor
public class MailAttachmentService {

    public static final String SCAN_PENDING = "PENDING";
    public static final String SCAN_CLEAN = "CLEAN";
    public static final String SCAN_INFECTED = "INFECTED";

    private static final DateTimeFormatter DIR_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

    private final OaMailAttachmentMapper attachmentMapper;
    private final OaMailMessageMapper messageMapper;
    private final OaMailRecipientMapper recipientMapper;
    private final OaMailSupportService supportService;

    /** 上传附件：校验大小、计算摘要、按摘要落盘去重，返回附件元数据。 */
    @Transactional
    public MailAttachmentItem store(MultipartFile file) {
        Long userId = currentUserId();
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        long maxBytes = (long) supportService.configInt("oa.mail.attachment.max.size.mb", 20) * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new BusinessException("附件超过大小上限，最大允许 "
                    + supportService.configInt("oa.mail.attachment.max.size.mb", 20) + " MB");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BusinessException(ResultCode.ERROR, "读取上传文件失败: " + e.getMessage());
        }
        String hash = sha256(bytes);
        String originalName = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename() : "attachment";
        String relativePath = storeFile(bytes, hash, originalName);

        // 同一用户重复上传同一文件且尚未关联邮件时复用已有记录，避免重复占位。
        OaMailAttachment existing = attachmentMapper.selectOne(Wrappers.<OaMailAttachment>lambdaQuery()
                .eq(OaMailAttachment::getFileHash, hash)
                .eq(OaMailAttachment::getUploadedByUserId, userId)
                .isNull(OaMailAttachment::getMessageId)
                .last("LIMIT 1"));
        if (existing != null && relativePath.equals(existing.getStoragePath())) {
            return toItem(existing);
        }

        boolean scanEnabled = supportService.configBool("oa.mail.attachment.scan.enabled", false);
        OaMailAttachment attachment = new OaMailAttachment();
        attachment.setFileName(originalName);
        attachment.setFileSize(file.getSize());
        attachment.setContentType(file.getContentType());
        attachment.setFileHash(hash);
        attachment.setStoragePath(relativePath);
        attachment.setScanStatus(scanEnabled ? SCAN_PENDING : SCAN_CLEAN);
        attachment.setScanAt(scanEnabled ? null : LocalDateTime.now());
        attachment.setUploadedByUserId(userId);
        attachment.setRemark(scanEnabled ? "待病毒扫描组件回写结果" : "未启用病毒扫描，直接标记为安全");
        attachmentMapper.insert(attachment);
        return toItem(attachment);
    }

    /** 关联附件到邮件：仅允许关联当前用户上传且尚未关联的附件。 */
    @Transactional
    public int bindToMessage(List<Long> attachmentIds, Long messageId, Long senderUserId) {
        if (CollectionUtils.isEmpty(attachmentIds)) {
            return 0;
        }
        int count = 0;
        for (Long attachmentId : attachmentIds) {
            OaMailAttachment attachment = attachmentMapper.selectById(attachmentId);
            if (attachment == null) {
                throw new BusinessException(ResultCode.NOT_FOUND, "附件不存在: " + attachmentId);
            }
            if (!Objects.equals(attachment.getUploadedByUserId(), senderUserId)) {
                throw new BusinessException(ResultCode.FORBIDDEN, "只能关联本人上传的附件");
            }
            attachment.setMessageId(messageId);
            attachmentMapper.updateById(attachment);
            count++;
        }
        return count;
    }

    /** 邮件附件数量，用于回写邮件是否含附件的标记。 */
    public long countByMessage(Long messageId) {
        if (messageId == null) {
            return 0L;
        }
        return attachmentMapper.selectCount(Wrappers.<OaMailAttachment>lambdaQuery()
                .eq(OaMailAttachment::getMessageId, messageId));
    }

    public List<MailAttachmentItem> listByMessage(Long messageId) {
        if (messageId == null) {
            return Collections.emptyList();
        }
        return attachmentMapper.selectList(Wrappers.<OaMailAttachment>lambdaQuery()
                        .eq(OaMailAttachment::getMessageId, messageId)
                        .orderByAsc(OaMailAttachment::getId))
                .stream().map(this::toItem).toList();
    }

    /** 下载授权校验：附件未关联邮件时仅上传人可访问；已关联邮件时发件人与收件人均可访问。 */
    public OaMailAttachment requireDownloadable(Long attachmentId) {
        Long userId = currentUserId();
        OaMailAttachment attachment = attachmentMapper.selectById(attachmentId);
        if (attachment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "附件不存在: " + attachmentId);
        }
        if (SCAN_INFECTED.equals(attachment.getScanStatus())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "附件存在安全风险，禁止下载");
        }
        if (attachment.getMessageId() == null) {
            if (!Objects.equals(attachment.getUploadedByUserId(), userId)) {
                throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该附件");
            }
            return attachment;
        }
        if (!canAccessMessage(attachment.getMessageId(), userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该附件");
        }
        return attachment;
    }

    /** 读取附件文件为可下载资源，文件缺失时抛出业务异常。 */
    public Resource loadResource(OaMailAttachment attachment) {
        String baseDir = supportService.config("oa.mail.attachment.dir", "./data/oa-mail-attachments");
        Path path = Paths.get(baseDir).resolve(attachment.getStoragePath()).normalize();
        if (!Files.exists(path)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "附件文件不存在: " + attachment.getFileName());
        }
        try {
            return new UrlResource(path.toUri());
        } catch (MalformedURLException e) {
            throw new BusinessException(ResultCode.ERROR, "读取附件文件失败: " + e.getMessage());
        }
    }

    @Transactional
    public void delete(Long attachmentId) {
        Long userId = currentUserId();
        OaMailAttachment attachment = attachmentMapper.selectById(attachmentId);
        if (attachment == null || !Objects.equals(attachment.getUploadedByUserId(), userId)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "附件不存在: " + attachmentId);
        }
        attachmentMapper.deleteById(attachmentId);
    }

    public boolean canAccessMessage(Long messageId, Long userId) {
        OaMailMessage message = messageMapper.selectById(messageId);
        if (message == null) {
            return false;
        }
        if (Objects.equals(message.getSenderUserId(), userId)) {
            return true;
        }
        return recipientMapper.selectCount(Wrappers.<OaMailRecipient>lambdaQuery()
                .eq(OaMailRecipient::getMessageId, messageId)
                .eq(OaMailRecipient::getRecipientUserId, userId)) > 0;
    }

    private String storeFile(byte[] bytes, String hash, String originalName) {
        String baseDir = supportService.config("oa.mail.attachment.dir", "./data/oa-mail-attachments");
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex > -1 && dotIndex < originalName.length() - 1) {
            extension = originalName.substring(dotIndex).replaceAll("[^A-Za-z0-9.]", "");
        }
        String monthDir = LocalDateTime.now().format(DIR_FORMATTER);
        Path target = Paths.get(baseDir, monthDir, hash + extension);
        try {
            Files.createDirectories(target.getParent());
            if (!Files.exists(target)) {
                Files.copy(new java.io.ByteArrayInputStream(bytes), target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BusinessException(ResultCode.ERROR, "附件存储失败: " + e.getMessage());
        }
        return Paths.get(monthDir, hash + extension).toString();
    }

    private String sha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException(ResultCode.ERROR, "计算附件摘要失败: " + e.getMessage());
        }
    }

    private MailAttachmentItem toItem(OaMailAttachment attachment) {
        MailAttachmentItem item = new MailAttachmentItem();
        item.setAttachmentId(attachment.getId());
        item.setFileName(attachment.getFileName());
        item.setFileSize(attachment.getFileSize());
        item.setContentType(attachment.getContentType());
        item.setFileHash(attachment.getFileHash());
        item.setScanStatus(attachment.getScanStatus());
        item.setScanAt(attachment.getScanAt());
        item.setCreatedAt(attachment.getCreatedAt());
        return item;
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }
}
