package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OaProcessInstanceMapper extends BaseMapper<OaProcessInstance> {

    @Select("SELECT COUNT(1) FROM oa_process_instance WHERE instance_no = #{instanceNo}")
    long countByNo(@Param("instanceNo") String instanceNo);
}
