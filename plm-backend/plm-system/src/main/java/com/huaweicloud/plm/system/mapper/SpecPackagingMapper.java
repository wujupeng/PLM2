package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SpecPackaging;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface SpecPackagingMapper extends BaseMapper<SpecPackaging> {

    /**
     * 统计包装规格编码 + 版本号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM spec_packaging WHERE packaging_code = #{packagingCode} "
            + "AND version_no = #{versionNo} AND id <> #{excludeId}")
    int countByCode(@Param("packagingCode") String packagingCode,
                    @Param("versionNo") String versionNo,
                    @Param("excludeId") Long excludeId);
}
