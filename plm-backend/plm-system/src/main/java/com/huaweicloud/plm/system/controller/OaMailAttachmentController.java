package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.MailAttachmentItem;
import com.huaweicloud.plm.system.entity.OaMailAttachment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MailAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/oa/mail-attachments")
@RequiredArgsConstructor
public class OaMailAttachmentController {

    private final MailAttachmentService mailAttachmentService;

    /** 上传附件：先上传取得附件标识，写信时再关联到邮件。 */
    @PostMapping
    @RequirePermission("oa:mail:attachment")
    public ApiResponse<MailAttachmentItem> upload(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(mailAttachmentService.store(file));
    }

    /** 下载附件：仅邮件发件人与收件人可下载，带安全风险的附件禁止下载。 */
    @GetMapping("/{attachmentId}/download")
    @RequirePermission("oa:mail:attachment")
    public ResponseEntity<Resource> download(@PathVariable Long attachmentId) {
        OaMailAttachment attachment = mailAttachmentService.requireDownloadable(attachmentId);
        Resource resource = mailAttachmentService.loadResource(attachment);
        MediaType mediaType = MediaTypeFactory.getMediaType(attachment.getFileName())
                .orElse(MediaType.APPLICATION_OCTET_STREAM);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(attachment.getFileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    @RequirePermission("oa:mail:attachment")
    public ApiResponse<Void> delete(@PathVariable Long attachmentId) {
        mailAttachmentService.delete(attachmentId);
        return ApiResponse.success();
    }
}
