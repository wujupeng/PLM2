package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MigInventoryMappingQuery;
import com.huaweicloud.plm.system.dto.MigInventoryMappingSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryMapping;
import com.huaweicloud.plm.system.mapper.MigInventoryMappingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 库存迁移字段映射服务：集成字段映射的登记、分页查询与删除。
 * 映射编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class MigInventoryMappingService {

    private static final String DEFAULT_NO_PREFIX = "IMM";
    private static final String DEFAULT_OBJECT_TYPE = "STOCK";
    private static final Integer DEFAULT_REQUIRED_FLAG = 0;
    private static final String DEFAULT_MAPPING_STATUS = "DRAFT";

    private final MigInventoryMappingMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询字段映射：对象类型/状态/接口编号精确，映射编号/名称/源字段/目标字段模糊，按主键倒序。 */
    public PageResult<MigInventoryMapping> page(MigInventoryMappingQuery query) {
        String keyword = query.getKeyword();
        Page<MigInventoryMapping> page = mapper.selectPage(query.toPage(), Wrappers.<MigInventoryMapping>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), MigInventoryMapping::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getMappingStatus()), MigInventoryMapping::getMappingStatus, query.getMappingStatus())
                .eq(StringUtils.hasText(query.getInterfaceNo()), MigInventoryMapping::getInterfaceNo, query.getInterfaceNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MigInventoryMapping::getMappingNo, keyword).or()
                        .like(MigInventoryMapping::getMappingName, keyword).or()
                        .like(MigInventoryMapping::getSourceField, keyword).or()
                        .like(MigInventoryMapping::getTargetField, keyword))
                .orderByDesc(MigInventoryMapping::getId));
        return PageResult.of(page);
    }

    public MigInventoryMapping detail(Long id) {
        return require(id);
    }

    /** 新增或更新字段映射：新增时回填默认对象类型、必填标记、状态与组织，编号为空时自动生成。 */
    public Long save(Long id, MigInventoryMappingSaveRequest request) {
        MigInventoryMapping entity;
        if (id == null) {
            entity = new MigInventoryMapping();
            entity.setMappingNo(StringUtils.hasText(request.getMappingNo())
                    ? request.getMappingNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setRequiredFlag(request.getRequiredFlag() == null
                    ? DEFAULT_REQUIRED_FLAG : request.getRequiredFlag());
            entity.setMappingStatus(StringUtils.hasText(request.getMappingStatus())
                    ? request.getMappingStatus() : DEFAULT_MAPPING_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除字段映射：物理删除以释放映射编号。 */
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MigInventoryMapping require(Long id) {
        MigInventoryMapping entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "字段映射不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值时覆盖实体对应字段：字符串非空，数值非 null。 */
    private void applyRequest(MigInventoryMapping entity, MigInventoryMappingSaveRequest request) {
        if (StringUtils.hasText(request.getMappingNo())) {
            entity.setMappingNo(request.getMappingNo());
        }
        if (StringUtils.hasText(request.getMappingName())) {
            entity.setMappingName(request.getMappingName());
        }
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getSourceField())) {
            entity.setSourceField(request.getSourceField());
        }
        if (StringUtils.hasText(request.getTargetField())) {
            entity.setTargetField(request.getTargetField());
        }
        if (StringUtils.hasText(request.getTransformRule())) {
            entity.setTransformRule(request.getTransformRule());
        }
        if (StringUtils.hasText(request.getDefaultValue())) {
            entity.setDefaultValue(request.getDefaultValue());
        }
        if (request.getRequiredFlag() != null) {
            entity.setRequiredFlag(request.getRequiredFlag());
        }
        if (StringUtils.hasText(request.getMappingStatus())) {
            entity.setMappingStatus(request.getMappingStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
