package com.huaweicloud.plm.system.service;

import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
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
import java.util.HexFormat;

/**
 * 文档存储服务：本地目录存储 + SHA-256 去重，保留原文件下载。
 * 生产环境可将存储目录替换为对象存储，替换不改变上层接口（oa.doc.storage.dir 可配置，避免绑定专有云服务）。
 */
@Service
@RequiredArgsConstructor
public class DocStorageService {

    private static final DateTimeFormatter DIR_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

    private final OaDocSupportService supportService;

    /** 落盘结果：文件名、大小、类型、摘要与相对存储路径。 */
    public record StoredFile(String fileName, long fileSize, String contentType, String fileHash, String storagePath) {
    }

    /** 上传落盘：校验大小上限（oa.doc.upload.max.size.mb），按摘要落盘去重。 */
    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        int maxMb = supportService.configInt("oa.doc.upload.max.size.mb", 50);
        long maxBytes = (long) maxMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new BusinessException("文档超过大小上限，最大允许 " + maxMb + " MB");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BusinessException(ResultCode.ERROR, "读取上传文件失败: " + e.getMessage());
        }
        String hash = sha256(bytes);
        String originalName = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename() : "document";
        String relativePath = storeFile(bytes, hash, originalName);
        return new StoredFile(originalName, file.getSize(), file.getContentType(), hash, relativePath);
    }

    /** 读取存储文件为可下载资源，文件缺失时抛出业务异常。 */
    public Resource load(String storagePath, String fileName) {
        if (!StringUtils.hasText(storagePath)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档文件不存在: " + fileName);
        }
        String baseDir = supportService.config("oa.doc.storage.dir", "./data/oa-documents");
        Path path = Paths.get(baseDir).resolve(storagePath).normalize();
        if (!Files.exists(path)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档文件不存在: " + fileName);
        }
        try {
            return new UrlResource(path.toUri());
        } catch (MalformedURLException e) {
            throw new BusinessException(ResultCode.ERROR, "读取文档文件失败: " + e.getMessage());
        }
    }

    public String sha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException(ResultCode.ERROR, "计算文档摘要失败: " + e.getMessage());
        }
    }

    private String storeFile(byte[] bytes, String hash, String originalName) {
        String baseDir = supportService.config("oa.doc.storage.dir", "./data/oa-documents");
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
                Files.copy(new ByteArrayInputStream(bytes), target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BusinessException(ResultCode.ERROR, "文档存储失败: " + e.getMessage());
        }
        return Paths.get(monthDir, hash + extension).toString();
    }
}
