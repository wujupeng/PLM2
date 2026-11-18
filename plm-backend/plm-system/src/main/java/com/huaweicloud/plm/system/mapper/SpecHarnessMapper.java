package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SpecHarness;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface SpecHarnessMapper extends BaseMapper<SpecHarness> {

    /**
     * 统计线束编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM spec_harness WHERE harness_code = #{harnessCode} AND id <> #{excludeId}")
    int countByCode(@Param("harnessCode") String harnessCode, @Param("excludeId") Long excludeId);
}
