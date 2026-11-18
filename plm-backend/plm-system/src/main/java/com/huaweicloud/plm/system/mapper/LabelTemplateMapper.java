package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.LabelTemplate;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface LabelTemplateMapper extends BaseMapper<LabelTemplate> {

    /**
     * 统计标签模板编码+版本占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM label_template WHERE template_code = #{templateCode} AND template_version = #{templateVersion} AND id <> #{excludeId}")
    int countByCode(@Param("templateCode") String templateCode, @Param("templateVersion") String templateVersion, @Param("excludeId") Long excludeId);
}
