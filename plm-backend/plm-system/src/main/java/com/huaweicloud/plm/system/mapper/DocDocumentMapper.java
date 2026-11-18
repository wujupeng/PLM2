package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.DocDocument;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface DocDocumentMapper extends BaseMapper<DocDocument> {

    /**
     * 统计图文档编号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM doc_document WHERE doc_no = #{docNo} AND id <> #{excludeId}")
    int countByNo(@Param("docNo") String docNo, @Param("excludeId") Long excludeId);
}
