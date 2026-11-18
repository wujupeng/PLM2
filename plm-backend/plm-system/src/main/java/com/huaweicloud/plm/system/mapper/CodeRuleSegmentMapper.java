package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.CodeRuleSegment;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;

public interface CodeRuleSegmentMapper extends BaseMapper<CodeRuleSegment> {

    /**
     * 物理清空指定规则的所有分段定义。
     */
    @Delete("DELETE FROM code_rule_segment WHERE rule_id = #{ruleId}")
    int deleteByRuleId(@Param("ruleId") Long ruleId);
}
