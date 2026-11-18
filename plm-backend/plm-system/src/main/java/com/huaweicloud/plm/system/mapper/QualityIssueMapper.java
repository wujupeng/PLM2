package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.QualityIssue;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface QualityIssueMapper extends BaseMapper<QualityIssue> {

    /**
     * 统计问题单号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突，用于编号流水去重。
     */
    @Select("SELECT COUNT(1) FROM quality_issue WHERE issue_no = #{issueNo} AND id <> #{excludeId}")
    int countByNo(@Param("issueNo") String issueNo, @Param("excludeId") Long excludeId);
}
