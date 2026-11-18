package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ProcessRoute;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface ProcessRouteMapper extends BaseMapper<ProcessRoute> {

    /**
     * 统计路线编码 + 版本号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM process_route WHERE route_code = #{routeCode} AND version_no = #{versionNo} "
            + "AND id <> #{excludeId}")
    int countByCode(@Param("routeCode") String routeCode,
                    @Param("versionNo") String versionNo,
                    @Param("excludeId") Long excludeId);
}
