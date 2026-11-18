package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.OaDocFolder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OaDocFolderMapper extends BaseMapper<OaDocFolder> {

    /** 目录编码唯一性校验：逻辑删除后编码可重建，故唯一性在服务层保证。 */
    @Select("SELECT COUNT(1) FROM oa_doc_folder WHERE folder_code = #{folderCode} AND id <> #{excludeId}")
    long countByCode(@Param("folderCode") String folderCode, @Param("excludeId") Long excludeId);

    @Select("SELECT COUNT(1) FROM oa_doc_folder WHERE parent_id = #{parentId}")
    long countChildren(@Param("parentId") Long parentId);
}
