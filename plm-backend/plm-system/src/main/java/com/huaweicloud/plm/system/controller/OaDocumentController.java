package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocDetailResponse;
import com.huaweicloud.plm.system.dto.DocItem;
import com.huaweicloud.plm.system.dto.DocQuery;
import com.huaweicloud.plm.system.dto.DocSaveRequest;
import com.huaweicloud.plm.system.dto.DocVersionItem;
import com.huaweicloud.plm.system.entity.OaDocVersion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DocStorageService;
import com.huaweicloud.plm.system.service.OaDocVersionService;
import com.huaweicloud.plm.system.service.OaDocumentService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 文档接口（OA-DEV-047 ~ OA-DEV-051）：元数据列表与详情、上传、版本、发布/作废/归档、
 * 下载与回收站。访问行为写入审计，检索结果按权限过滤。
 */
@RestController
@RequestMapping("/oa/documents")
@RequiredArgsConstructor
public class OaDocumentController {

    private final OaDocumentService documentService;
    private final OaDocVersionService versionService;
    private final DocStorageService storageService;

    @GetMapping
    @RequirePermission("oa:doc:list")
    public ApiResponse<PageResult<DocItem>> page(DocQuery query) {
        return ApiResponse.success(documentService.page(query));
    }

    /** 回收站列表：仅具备回收站管理权限的角色可访问。 */
    @GetMapping("/recycle")
    @RequirePermission("oa:doc:recycle")
    public ApiResponse<PageResult<DocItem>> recyclePage(@RequestParam(required = false) Integer pageNum,
                                                        @RequestParam(required = false) Integer pageSize) {
        return ApiResponse.success(documentService.recyclePage(pageNum, pageSize));
    }

    @GetMapping("/{docId}")
    @RequirePermission("oa:doc:list")
    public ApiResponse<DocDetailResponse> detail(@PathVariable Long docId) {
        return ApiResponse.success(documentService.detail(docId));
    }

    /** 新建文档并上传首个版本（multipart：file + 表单字段）。 */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission("oa:doc:upload")
    public ApiResponse<Long> create(@Valid DocSaveRequest request, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(documentService.create(request, file));
    }

    @PutMapping("/{docId}")
    @RequirePermission("oa:doc:edit")
    public ApiResponse<Void> update(@PathVariable Long docId, @Valid @RequestBody DocSaveRequest request) {
        documentService.update(docId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{docId}")
    @RequirePermission("oa:doc:delete")
    public ApiResponse<Void> delete(@PathVariable Long docId) {
        documentService.delete(docId);
        return ApiResponse.success();
    }

    /** 上传新版本。 */
    @PostMapping(value = "/{docId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission("oa:doc:version")
    public ApiResponse<Void> uploadVersion(@PathVariable Long docId,
                                           @RequestParam(value = "revisionNote", required = false) String revisionNote,
                                           @RequestParam("file") MultipartFile file) {
        documentService.uploadVersion(docId, revisionNote, file);
        return ApiResponse.success();
    }

    /** 历史版本列表。 */
    @GetMapping("/{docId}/versions")
    @RequirePermission("oa:doc:list")
    public ApiResponse<List<DocVersionItem>> versions(@PathVariable Long docId) {
        return ApiResponse.success(versionService.list(docId));
    }

    /** 恢复到指定历史版本：以该版本内容生成新版本，保留完整版本链。 */
    @PutMapping("/{docId}/versions/{versionId}/restore")
    @RequirePermission("oa:doc:version")
    public ApiResponse<Void> restoreVersion(@PathVariable Long docId, @PathVariable Long versionId) {
        versionService.restoreVersion(docId, versionId);
        return ApiResponse.success();
    }

    /** 锁定/解锁版本。 */
    @PutMapping("/versions/{versionId}/lock")
    @RequirePermission("oa:doc:version")
    public ApiResponse<Void> lockVersion(@PathVariable Long versionId,
                                         @RequestParam(required = false) Integer lockFlag) {
        versionService.lockVersion(versionId, lockFlag);
        return ApiResponse.success();
    }

    /** 下载文档原文件：可指定历史版本，默认下载当前版本。 */
    @GetMapping("/{docId}/download")
    @RequirePermission("oa:doc:list")
    public ResponseEntity<Resource> download(@PathVariable Long docId,
                                             @RequestParam(required = false) Long versionId) {
        OaDocumentService.DocumentDownload result = documentService.download(docId, versionId);
        OaDocVersion version = result.version();
        Resource resource = storageService.load(version.getStoragePath(), version.getFileName());
        MediaType mediaType = MediaTypeFactory.getMediaType(version.getFileName())
                .orElse(MediaType.APPLICATION_OCTET_STREAM);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(version.getFileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(resource);
    }

    @PutMapping("/{docId}/publish")
    @RequirePermission("oa:doc:edit")
    public ApiResponse<Void> publish(@PathVariable Long docId) {
        documentService.publish(docId);
        return ApiResponse.success();
    }

    @PutMapping("/{docId}/void")
    @RequirePermission("oa:doc:edit")
    public ApiResponse<Void> voidDocument(@PathVariable Long docId) {
        documentService.voidDocument(docId);
        return ApiResponse.success();
    }

    @PutMapping("/{docId}/archive")
    @RequirePermission("oa:doc:edit")
    public ApiResponse<Void> archive(@PathVariable Long docId) {
        documentService.archive(docId);
        return ApiResponse.success();
    }

    /** 从回收站恢复。 */
    @PutMapping("/recycle/{docId}/restore")
    @RequirePermission("oa:doc:recycle")
    public ApiResponse<Void> restore(@PathVariable Long docId) {
        documentService.restore(docId);
        return ApiResponse.success();
    }

    /** 彻底删除（仅限回收站中的文档，不可恢复）。 */
    @DeleteMapping("/recycle/{docId}")
    @RequirePermission("oa:doc:recycle")
    public ApiResponse<Void> purge(@PathVariable Long docId) {
        documentService.purge(docId);
        return ApiResponse.success();
    }
}
