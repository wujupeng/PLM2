package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.SysMobileScene;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysMobileSceneMapper extends BaseMapper<SysMobileScene> {

    /**
     * 物理删除移动场景。
     * <p>
     * 场景编号/场景编码支持人工指定，且表上存在硬唯一索引 uk_sys_mobile_scene_no、
     * uk_sys_mobile_scene_code；若采用逻辑删除，被删除行仍占用唯一键，导致同一编号再次
     * 登记时触发唯一约束冲突。因此删除语义为「释放编号」，这里执行物理删除以保持与唯一索引一致。
     */
    @Delete("DELETE FROM sys_mobile_scene WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
