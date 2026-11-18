package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SpecCompliance;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface SpecComplianceMapper extends BaseMapper<SpecCompliance> {

    /**
     * 统计合规记录编码占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM spec_compliance WHERE compliance_code = #{complianceCode} AND id <> #{excludeId}")
    int countByCode(@Param("complianceCode") String complianceCode, @Param("excludeId") Long excludeId);
}
