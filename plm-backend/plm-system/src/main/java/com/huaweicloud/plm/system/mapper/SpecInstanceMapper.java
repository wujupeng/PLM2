package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SpecInstance;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface SpecInstanceMapper extends BaseMapper<SpecInstance> {

    /**
     * 统计实例编码 + 版本号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM spec_instance WHERE instance_code = #{instanceCode} AND version_no = #{versionNo} AND id <> #{excludeId}")
    int countByCode(@Param("instanceCode") String instanceCode,
                    @Param("versionNo") String versionNo,
                    @Param("excludeId") Long excludeId);
}
