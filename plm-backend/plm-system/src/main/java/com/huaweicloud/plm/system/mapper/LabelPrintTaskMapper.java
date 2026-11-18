package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.LabelPrintTask;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface LabelPrintTaskMapper extends BaseMapper<LabelPrintTask> {

    /**
     * 查询指定前缀下已使用的最大任务编号，用于生成当日流水号。
     */
    @Select("SELECT MAX(task_no) FROM label_print_task WHERE task_no LIKE #{prefix}")
    String selectMaxTaskNo(@Param("prefix") String prefix);
}
