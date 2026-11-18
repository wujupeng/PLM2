package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.CodeSequence;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface CodeSequenceMapper extends BaseMapper<CodeSequence> {

    /**
     * 按 seqKey 加行级排他锁读取流水号，用于并发下取号互斥。
     */
    @Select("SELECT * FROM code_sequence WHERE seq_key = #{seqKey} AND deleted = 0 FOR UPDATE")
    CodeSequence selectByKeyForUpdate(@Param("seqKey") String seqKey);
}
