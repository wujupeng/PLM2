package com.huaweicloud.plm.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.huaweicloud.plm.system.entity.MigPlmDocumentCompensation;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * PLM文档迁移异常补偿 Mapper。
 */
@Mapper
public interface MigPlmDocumentCompensationMapper extends BaseMapper<MigPlmDocumentCompensation> {

    /**
     * 物理删除 PLM文档迁移异常补偿记录。
     * <p>
     * 补偿编号支持人工指定且表上存在硬唯一索引；逻辑删除会让被删行继续占用该编号，
     * 导致同一编号再次登记时触发唯一约束冲突。因此删除语义为「释放编码」，
     * 这里执行物理删除以保持与硬唯一索引一致。
     */
    @Delete("DELETE FROM mig_plm_document_compensation WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
}
