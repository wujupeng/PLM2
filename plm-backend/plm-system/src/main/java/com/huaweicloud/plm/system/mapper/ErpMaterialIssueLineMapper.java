package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.ErpMaterialIssueLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 材料领用单行 Mapper（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Mapper
public interface ErpMaterialIssueLineMapper extends BaseMapper<ErpMaterialIssueLine> {

    /**
     * 查询指定领料单下当前最大行号，用于新增行时自动取号。
     */
    @Select("SELECT MAX(line_no) FROM erp_material_issue_line WHERE issue_id = #{fk} AND deleted = 0")
    Integer selectMaxLineNo(@Param("fk") Long fk);
}
