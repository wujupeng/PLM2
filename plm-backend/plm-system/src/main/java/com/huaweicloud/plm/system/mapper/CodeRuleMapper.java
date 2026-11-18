package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.CodeRule;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface CodeRuleMapper extends BaseMapper<CodeRule> {

    /**
     * 统计编码规则编码 + 版本号占用情况（含逻辑删除记录），避免与数据库唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM code_rule WHERE rule_code = #{ruleCode} AND rule_version = #{ruleVersion} AND id <> #{excludeId}")
    int countByCode(@Param("ruleCode") String ruleCode, @Param("ruleVersion") String ruleVersion, @Param("excludeId") Long excludeId);
}
