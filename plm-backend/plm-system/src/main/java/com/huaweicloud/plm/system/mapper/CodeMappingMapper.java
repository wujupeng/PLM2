package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.CodeMapping;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

public interface CodeMappingMapper extends BaseMapper<CodeMapping> {

    /**
     * 累加扫描次数并更新最近扫描时间。
     */
    @Update("UPDATE code_mapping SET scan_count = scan_count + 1, last_scan_at = #{lastScanAt} WHERE id = #{id}")
    int increaseScanCount(@Param("id") Long id, @Param("lastScanAt") LocalDateTime lastScanAt);

    /**
     * 统计追溯码占用情况（不含逻辑删除记录），避免与唯一索引冲突。
     */
    @Select("SELECT COUNT(1) FROM code_mapping WHERE target_code = #{targetCode} AND deleted = 0")
    int countByTargetCode(@Param("targetCode") String targetCode);
}
