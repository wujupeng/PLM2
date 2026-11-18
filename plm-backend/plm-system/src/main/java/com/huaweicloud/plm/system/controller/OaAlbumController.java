package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.AlbumPhotoSaveRequest;
import com.huaweicloud.plm.system.dto.AlbumQuery;
import com.huaweicloud.plm.system.dto.AlbumSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaAlbum;
import com.huaweicloud.plm.system.entity.OaOaAlbumPhoto;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaAlbumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 相册接口（OA-DEV-059）：相册维护、发布归档与照片管理，受最大照片数配置约束。
 */
@RestController
@RequestMapping("/oa/albums")
@RequiredArgsConstructor
public class OaAlbumController {

    private final OaAlbumService albumService;

    @GetMapping
    @RequirePermission("oa:collab:list")
    public ApiResponse<PageResult<OaOaAlbum>> page(AlbumQuery query) {
        return ApiResponse.success(albumService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:collab:list")
    public ApiResponse<OaOaAlbum> detail(@PathVariable Long id) {
        return ApiResponse.success(albumService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:collab:album")
    public ApiResponse<Long> create(@Valid @RequestBody AlbumSaveRequest request) {
        return ApiResponse.success(albumService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:collab:album")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody AlbumSaveRequest request) {
        albumService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:collab:album")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        albumService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/publish")
    @RequirePermission("oa:collab:album")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        albumService.publish(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/archive")
    @RequirePermission("oa:collab:album")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        albumService.archive(id);
        return ApiResponse.success();
    }

    /** 相册照片列表。 */
    @GetMapping("/{albumId}/photos")
    @RequirePermission("oa:collab:list")
    public ApiResponse<List<OaOaAlbumPhoto>> photos(@PathVariable Long albumId) {
        return ApiResponse.success(albumService.photos(albumId));
    }

    /** 追加照片。 */
    @PostMapping("/{albumId}/photos")
    @RequirePermission("oa:collab:album")
    public ApiResponse<Long> addPhoto(@PathVariable Long albumId, @Valid @RequestBody AlbumPhotoSaveRequest request) {
        return ApiResponse.success(albumService.addPhoto(albumId, request));
    }

    /** 移除照片。 */
    @DeleteMapping("/photos/{photoId}")
    @RequirePermission("oa:collab:album")
    public ApiResponse<Void> removePhoto(@PathVariable Long photoId) {
        albumService.removePhoto(photoId);
        return ApiResponse.success();
    }
}
