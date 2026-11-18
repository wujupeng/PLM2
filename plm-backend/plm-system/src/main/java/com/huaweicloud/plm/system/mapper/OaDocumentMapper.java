package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.OaDocument;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface OaDocumentMapper extends BaseMapper<OaDocument> {

    @Select("SELECT COUNT(1) FROM oa_document WHERE doc_no = #{docNo}")
    long countByDocNo(@Param("docNo") String docNo);

    @Select("SELECT COUNT(1) FROM oa_document WHERE folder_id = #{folderId}")
    long countByFolder(@Param("folderId") Long folderId);

    /**
     * 回收站列表。逻辑删除由 MyBatis-Plus 自动过滤，此处需显式查询 deleted = 1 的记录。
     */
    @Select("SELECT COUNT(1) FROM oa_document WHERE deleted = 1")
    long countRecycled();

    @Select("SELECT * FROM oa_document WHERE deleted = 1 ORDER BY updated_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<OaDocument> selectRecycledPage(@Param("limit") int limit, @Param("offset") int offset);

    /** 从回收站恢复：重置逻辑删除标记。 */
    @Update("UPDATE oa_document SET deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = #{id} AND deleted = 1")
    int restoreRecycled(@Param("id") Long id);

    /** 彻底删除：仅允许删除回收站中的记录。 */
    @Delete("DELETE FROM oa_document WHERE id = #{id} AND deleted = 1")
    int purgeRecycled(@Param("id") Long id);

    /** 浏览量自增：直接累加，避免与乐观锁版本号产生无谓冲突。 */
    @Update("UPDATE oa_document SET view_count = view_count + 1 WHERE id = #{id}")
    int incrementViewCount(@Param("id") Long id);

    /** 下载量自增。 */
    @Update("UPDATE oa_document SET download_count = download_count + 1 WHERE id = #{id}")
    int incrementDownloadCount(@Param("id") Long id);
}
