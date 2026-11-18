package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.OaTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OaTaskMapper extends BaseMapper<OaTask> {

    @Select("SELECT COUNT(1) FROM oa_task WHERE task_no = #{taskNo}")
    long countByNo(@Param("taskNo") String taskNo);
}
