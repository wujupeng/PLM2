package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.AlbumPhotoSaveRequest;
import com.huaweicloud.plm.system.dto.AlbumQuery;
import com.huaweicloud.plm.system.dto.AlbumSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaAlbum;
import com.huaweicloud.plm.system.entity.OaOaAlbumPhoto;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaOaAlbumMapper;
import com.huaweicloud.plm.system.mapper.OaOaAlbumPhotoMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 协同办公相册服务：相册维护、发布归档与相册照片管理。
 */
@Service
@RequiredArgsConstructor
public class OaAlbumService {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";
    public static final String STATUS_ARCHIVED = "ARCHIVED";

    private static final String NO_PREFIX = "ALB";
    private static final String CONFIG_MAX_PHOTOS = "oa.collab.album.max.photos";
    private static final int DEFAULT_MAX_PHOTOS = 200;

    private final OaOaAlbumMapper albumMapper;
    private final OaOaAlbumPhotoMapper albumPhotoMapper;
    private final HrFlowSupport flowSupport;
    private final SysUserMapper userMapper;

    /** 相册分页：按状态与关键词过滤，按主键倒序。 */
    public PageResult<OaOaAlbum> page(AlbumQuery query) {
        Page<OaOaAlbum> page = query.toPage();
        albumMapper.selectPage(page, Wrappers.<OaOaAlbum>lambdaQuery()
                .eq(StringUtils.hasText(query.getAlbumStatus()), OaOaAlbum::getAlbumStatus, query.getAlbumStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOaAlbum::getAlbumName, query.getKeyword()).or()
                        .like(OaOaAlbum::getDescription, query.getKeyword()))
                .orderByDesc(OaOaAlbum::getId));
        return PageResult.of(page);
    }

    public OaOaAlbum requireAlbum(Long id) {
        OaOaAlbum album = albumMapper.selectById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "相册不存在: " + id);
        }
        return album;
    }

    public OaOaAlbum detail(Long id) {
        return requireAlbum(id);
    }

    /** 新建相册：默认草稿状态并生成编号。 */
    @Transactional
    public Long create(AlbumSaveRequest request) {
        OaOaAlbum album = new OaOaAlbum();
        applyRequest(album, request);
        album.setAlbumNo(flowSupport.nextNo(NO_PREFIX));
        album.setAlbumStatus(STATUS_DRAFT);
        album.setPhotoCount(0);
        Long userId = UserContext.getUserId();
        album.setCreatorUserId(userId);
        album.setCreatorName(resolveDisplayName(userId));
        albumMapper.insert(album);
        return album.getId();
    }

    @Transactional
    public void update(Long id, AlbumSaveRequest request) {
        OaOaAlbum album = requireAlbum(id);
        applyRequest(album, request);
        albumMapper.updateById(album);
    }

    /** 发布相册：草稿 → 已发布。 */
    @Transactional
    public void publish(Long id) {
        OaOaAlbum album = requireAlbum(id);
        album.setAlbumStatus(STATUS_PUBLISHED);
        albumMapper.updateById(album);
    }

    /** 归档相册：置为已归档。 */
    @Transactional
    public void archive(Long id) {
        OaOaAlbum album = requireAlbum(id);
        album.setAlbumStatus(STATUS_ARCHIVED);
        albumMapper.updateById(album);
    }

    @Transactional
    public void delete(Long id) {
        requireAlbum(id);
        albumPhotoMapper.delete(Wrappers.<OaOaAlbumPhoto>lambdaQuery().eq(OaOaAlbumPhoto::getAlbumId, id));
        albumMapper.deleteById(id);
    }

    /** 相册照片列表：按排序号与主键升序。 */
    public List<OaOaAlbumPhoto> photos(Long albumId) {
        requireAlbum(albumId);
        return albumPhotoMapper.selectList(Wrappers.<OaOaAlbumPhoto>lambdaQuery()
                .eq(OaOaAlbumPhoto::getAlbumId, albumId)
                .orderByAsc(OaOaAlbumPhoto::getSortNo)
                .orderByAsc(OaOaAlbumPhoto::getId));
    }

    /** 新增照片：超出配置上限抛冲突，插入后回写相册照片数量。 */
    @Transactional
    public Long addPhoto(Long albumId, AlbumPhotoSaveRequest request) {
        OaOaAlbum album = requireAlbum(albumId);
        int maxPhotos = flowSupport.configInt(CONFIG_MAX_PHOTOS, DEFAULT_MAX_PHOTOS);
        long current = albumPhotoMapper.selectCount(Wrappers.<OaOaAlbumPhoto>lambdaQuery()
                .eq(OaOaAlbumPhoto::getAlbumId, albumId));
        if (current >= maxPhotos) {
            throw new BusinessException(ResultCode.CONFLICT, "相册照片数量已达上限: " + maxPhotos);
        }
        Long userId = UserContext.getUserId();
        OaOaAlbumPhoto photo = new OaOaAlbumPhoto();
        photo.setAlbumId(albumId);
        photo.setFileId(request.getFileId());
        photo.setFileName(request.getFileName());
        photo.setFileSize(request.getFileSize());
        photo.setContentType(request.getContentType());
        photo.setFilePath(request.getFilePath());
        photo.setDescription(request.getDescription());
        photo.setSortNo(request.getSortNo());
        photo.setUploaderUserId(userId);
        photo.setUploaderName(resolveDisplayName(userId));
        albumPhotoMapper.insert(photo);
        syncPhotoCount(album);
        return photo.getId();
    }

    /** 删除照片：删除后回写相册照片数量。 */
    @Transactional
    public void removePhoto(Long photoId) {
        OaOaAlbumPhoto photo = albumPhotoMapper.selectById(photoId);
        if (photo == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "照片不存在: " + photoId);
        }
        albumPhotoMapper.deleteById(photoId);
        syncPhotoCount(requireAlbum(photo.getAlbumId()));
    }

    private void syncPhotoCount(OaOaAlbum album) {
        long count = albumPhotoMapper.selectCount(Wrappers.<OaOaAlbumPhoto>lambdaQuery()
                .eq(OaOaAlbumPhoto::getAlbumId, album.getId()));
        album.setPhotoCount((int) count);
        albumMapper.updateById(album);
    }

    private void applyRequest(OaOaAlbum album, AlbumSaveRequest request) {
        album.setAlbumName(request.getAlbumName());
        album.setCategory(request.getCategory());
        album.setDescription(request.getDescription());
        album.setPublishScope(request.getPublishScope());
        album.setScopeValue(request.getScopeValue());
        album.setRemark(request.getRemark());
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }
}
