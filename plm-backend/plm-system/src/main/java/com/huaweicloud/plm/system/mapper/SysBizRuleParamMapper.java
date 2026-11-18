package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysBizRuleParam;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysBizRuleParamMapper extends BaseMapper<SysBizRuleParam> {

    /**
     * 物理删除规则参数。
     * <p>
     * 参数编号支持人工指定，且表上存在硬唯一索引 uk_sys_biz_rule_param_no；
     * 若采用逻辑删除，被删除行仍占用该编号，导致同一编号再次登记时触发唯一约束冲突。
     * 因此删除语义为「释放编号」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_biz_rule_param WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
