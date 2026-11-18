package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMigrationFieldMappingSaveRequest;
import com.huaweicloud.plm.system.dto.BizMigrationObjectSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationFieldMapping;
import com.huaweicloud.plm.system.entity.OaMigrationObject;
import com.huaweicloud.plm.system.mapper.OaMigrationFieldMappingMapper;
import com.huaweicloud.plm.system.mapper.OaMigrationObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 迁移对象目录与字段映射字典（OA-DEV-095/096）：迁移范围、源位置、目标对象与字段转换规则维护。
 * 迁移对象状态、字段映射启用状态均为可配置数据，便于按业务方确认结果调整。
 */
@Service
@RequiredArgsConstructor
public class OaMigrationObjectService {

    private static final String STATUS_PENDING = "PENDING";

    private final OaMigrationObjectMapper objectMapper;
    private final OaMigrationFieldMappingMapper mappingMapper;
    private final OaBizFlowSupport flowSupport;

    // ================= 迁移对象目录 =================

    public PageResult<OaMigrationObject> pageObjects(OaMigrationQuery query) {
        Page<OaMigrationObject> page = query.toPage();
        objectMapper.selectPage(page, Wrappers.<OaMigrationObject>lambdaQuery()
                .eq(StringUtils.hasText(query.getSourceType()), OaMigrationObject::getSourceType, query.getSourceType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationObject::getObjectCode, query.getKeyword()).or()
                        .like(OaMigrationObject::getObjectName, query.getKeyword()).or()
                        .like(OaMigrationObject::getTargetObject, query.getKeyword()))
                .orderByAsc(OaMigrationObject::getObjectCode));
        return PageResult.of(page);
    }

    public OaMigrationObject detailObject(Long id) {
        return requireObject(id);
    }

    public List<OaMigrationObject> listAllObjects() {
        return objectMapper.selectList(Wrappers.<OaMigrationObject>lambdaQuery()
                .orderByAsc(OaMigrationObject::getObjectCode));
    }

    @Transactional
    public Long saveObject(Long id, BizMigrationObjectSaveRequest request) {
        OaMigrationObject entity;
        if (id == null) {
            String objectCode = request.getObjectCode();
            if (!StringUtils.hasText(objectCode)) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "对象编码不能为空");
            }
            Long exists = objectMapper.selectCount(Wrappers.<OaMigrationObject>lambdaQuery()
                    .eq(OaMigrationObject::getObjectCode, objectCode));
            if (exists != null && exists > 0) {
                throw new BusinessException(ResultCode.CONFLICT, "对象编码已存在: " + objectCode);
            }
            entity = new OaMigrationObject();
            entity.setObjectCode(objectCode);
            entity.setMigratedCount(0L);
            entity.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_PENDING);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireObject(id);
            if (StringUtils.hasText(request.getObjectCode())) {
                entity.setObjectCode(request.getObjectCode());
            }
        }
        entity.setObjectName(request.getObjectName());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setSourceType(StringUtils.hasText(request.getSourceType()) ? request.getSourceType() : "DB");
        entity.setSourceLocation(request.getSourceLocation());
        entity.setTargetObject(request.getTargetObject());
        entity.setSourceCount(request.getSourceCount() == null ? 0L : request.getSourceCount());
        entity.setMigrateRequired(Boolean.FALSE.equals(request.getMigrateRequired()) ? 0 : 1);
        if (StringUtils.hasText(request.getStatus())) {
            entity.setStatus(request.getStatus());
        }
        entity.setRemark(request.getRemark());
        if (id == null) {
            objectMapper.insert(entity);
        } else {
            objectMapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 标记对象迁移完成，回写已迁移数量。 */
    @Transactional
    public OaMigrationObject markObjectMigrated(Long id, Long migratedCount, String status) {
        OaMigrationObject entity = requireObject(id);
        entity.setMigratedCount(migratedCount == null ? entity.getMigratedCount() : migratedCount);
        entity.setStatus(StringUtils.hasText(status) ? status : "DONE");
        entity.setLastMigrateTime(LocalDateTime.now());
        objectMapper.updateById(entity);
        return entity;
    }

    @Transactional
    public void deleteObject(Long id) {
        OaMigrationObject entity = requireObject(id);
        Long mappingCount = mappingMapper.selectCount(Wrappers.<OaMigrationFieldMapping>lambdaQuery()
                .eq(OaMigrationFieldMapping::getObjectCode, entity.getObjectCode()));
        if (mappingCount != null && mappingCount > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该对象下存在字段映射，请先删除字段映射");
        }
        objectMapper.deleteById(id);
    }

    // ================= 字段映射字典 =================

    public PageResult<OaMigrationFieldMapping> pageMappings(OaMigrationQuery query) {
        Page<OaMigrationFieldMapping> page = query.toPage();
        mappingMapper.selectPage(page, Wrappers.<OaMigrationFieldMapping>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectCode()), OaMigrationFieldMapping::getObjectCode, query.getObjectCode())
                .eq(query.getStatus() != null, OaMigrationFieldMapping::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMigrationFieldMapping::getMappingNo, query.getKeyword()).or()
                        .like(OaMigrationFieldMapping::getSourceField, query.getKeyword()).or()
                        .like(OaMigrationFieldMapping::getTargetField, query.getKeyword()))
                .orderByAsc(OaMigrationFieldMapping::getObjectCode)
                .orderByAsc(OaMigrationFieldMapping::getMappingNo));
        return PageResult.of(page);
    }

    public OaMigrationFieldMapping detailMapping(Long id) {
        return requireMapping(id);
    }

    @Transactional
    public Long saveMapping(Long id, BizMigrationFieldMappingSaveRequest request) {
        OaMigrationFieldMapping entity;
        if (id == null) {
            entity = new OaMigrationFieldMapping();
            entity.setMappingNo(StringUtils.hasText(request.getMappingNo())
                    ? request.getMappingNo() : flowSupport.nextBizNo("MFM"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireMapping(id);
            if (StringUtils.hasText(request.getMappingNo())) {
                entity.setMappingNo(request.getMappingNo());
            }
        }
        entity.setObjectCode(request.getObjectCode());
        entity.setSourceField(request.getSourceField());
        entity.setTargetField(request.getTargetField());
        entity.setDataType(request.getDataType());
        entity.setEnumMapping(request.getEnumMapping());
        entity.setValueMapping(request.getValueMapping());
        entity.setTransformRule(request.getTransformRule());
        entity.setRequiredFlag(Boolean.TRUE.equals(request.getRequiredFlag()) ? 1 : 0);
        entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mappingMapper.insert(entity);
        } else {
            mappingMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteMapping(Long id) {
        requireMapping(id);
        mappingMapper.deleteById(id);
    }

    /** 迁移准备总览。 */
    public Map<String, Object> overview() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("objectTotal", objectMapper.selectCount(null));
        result.put("objectDone", objectMapper.selectCount(Wrappers.<OaMigrationObject>lambdaQuery()
                .eq(OaMigrationObject::getStatus, "DONE")));
        result.put("objectRequired", objectMapper.selectCount(Wrappers.<OaMigrationObject>lambdaQuery()
                .eq(OaMigrationObject::getMigrateRequired, 1)));
        result.put("mappingTotal", mappingMapper.selectCount(null));
        result.put("mappingRequired", mappingMapper.selectCount(Wrappers.<OaMigrationFieldMapping>lambdaQuery()
                .eq(OaMigrationFieldMapping::getRequiredFlag, 1)));
        Long sourceTotal = 0L;
        Long migratedTotal = 0L;
        for (OaMigrationObject object : listAllObjects()) {
            sourceTotal += object.getSourceCount() == null ? 0L : object.getSourceCount();
            migratedTotal += object.getMigratedCount() == null ? 0L : object.getMigratedCount();
        }
        result.put("sourceTotal", sourceTotal);
        result.put("migratedTotal", migratedTotal);
        return result;
    }

    public OaMigrationObject requireObject(Long id) {
        OaMigrationObject entity = objectMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移对象不存在: " + id);
        }
        return entity;
    }

    public OaMigrationFieldMapping requireMapping(Long id) {
        OaMigrationFieldMapping entity = mappingMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "字段映射不存在: " + id);
        }
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
