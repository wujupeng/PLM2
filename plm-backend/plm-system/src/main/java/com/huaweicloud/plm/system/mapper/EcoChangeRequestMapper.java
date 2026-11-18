package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.EcoChangeRequest;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface EcoChangeRequestMapper extends BaseMapper<EcoChangeRequest> {

    /**
     * 统计变更申请编号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突，用于编号流水去重。
     */
    @Select("SELECT COUNT(1) FROM eco_change_request WHERE ecr_no = #{ecrNo} AND id <> #{excludeId}")
    long countByNo(@Param("ecrNo") String ecrNo, @Param("excludeId") Long excludeId);
}
