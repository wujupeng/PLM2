package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.QualityDefectCode;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface QualityDefectCodeMapper extends BaseMapper<QualityDefectCode> {

    /**
     * 统计缺陷代码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM quality_defect_code WHERE defect_code = #{defectCode} AND id <> #{excludeId}")
    int countByCode(@Param("defectCode") String defectCode, @Param("excludeId") Long excludeId);
}
