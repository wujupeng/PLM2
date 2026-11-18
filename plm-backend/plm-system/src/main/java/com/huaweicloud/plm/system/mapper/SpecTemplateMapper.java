package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SpecTemplate;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface SpecTemplateMapper extends BaseMapper<SpecTemplate> {

    /**
     * 统计模板编码 + 版本号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM spec_template WHERE template_code = #{templateCode} AND version_no = #{versionNo} AND id <> #{excludeId}")
    int countByCode(@Param("templateCode") String templateCode,
                    @Param("versionNo") String versionNo,
                    @Param("excludeId") Long excludeId);
}
