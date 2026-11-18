package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.InspectionSpec;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface InspectionSpecMapper extends BaseMapper<InspectionSpec> {

    /**
     * 统计规范编码 + 版本号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM inspection_spec WHERE spec_code = #{specCode} AND version_no = #{versionNo} "
            + "AND id <> #{excludeId}")
    int countByCode(@Param("specCode") String specCode,
                    @Param("versionNo") String versionNo,
                    @Param("excludeId") Long excludeId);
}
