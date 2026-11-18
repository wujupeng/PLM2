package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysLegalEntitySaveRequest;
import com.huaweicloud.plm.system.entity.SysLegalEntity;
import com.huaweicloud.plm.system.mapper.SysLegalEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 法人主体（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 法人主体登记、启停状态流转与统计。
 * 法人编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysLegalEntityService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysLegalEntityMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询法人主体：法人状态精确，关键字匹配编码/名称/统一社会信用代码，时间区间作用于创建时间。 */
    public PageResult<SysLegalEntity> pageLegalEntities(OrgQuery query) {
        Page<SysLegalEntity> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysLegalEntity>lambdaQuery()
                .eq(StringUtils.hasText(query.getLegalStatus()),
                        SysLegalEntity::getLegalStatus, query.getLegalStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysLegalEntity::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysLegalEntity::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysLegalEntity::getLegalCode, query.getKeyword()).or()
                        .like(SysLegalEntity::getLegalName, query.getKeyword()).or()
                        .like(SysLegalEntity::getUnifiedSocialCode, query.getKeyword()))
                .orderByDesc(SysLegalEntity::getId));
        return PageResult.of(page);
    }

    public SysLegalEntity detail(Long id) {
        return require(id);
    }

    /** 新增或更新法人主体：新增时回填默认法人状态与组织，法人编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysLegalEntitySaveRequest request) {
        SysLegalEntity entity;
        if (id == null) {
            entity = new SysLegalEntity();
            entity.setLegalCode(StringUtils.hasText(request.getLegalCode())
                    ? request.getLegalCode() : flowSupport.nextBizNo("LEG"));
            entity.setLegalStatus(STATUS_ACTIVE);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getLegalCode())) {
                entity.setLegalCode(request.getLegalCode());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 启用：法人状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysLegalEntity enable(Long id) {
        return changeLegalStatus(id, STATUS_ACTIVE);
    }

    /** 停用：法人状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysLegalEntity disable(Long id) {
        return changeLegalStatus(id, STATUS_DISABLED);
    }

    /** 删除法人主体：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 法人主体统计：按法人状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysLegalEntity::getLegalStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysLegalEntity::getLegalStatus, STATUS_DISABLED));
        return result;
    }

    public SysLegalEntity require(Long id) {
        SysLegalEntity entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "法人主体不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysLegalEntity entity, SysLegalEntitySaveRequest request) {
        if (StringUtils.hasText(request.getLegalCode())) {
            entity.setLegalCode(request.getLegalCode());
        }
        if (StringUtils.hasText(request.getLegalName())) {
            entity.setLegalName(request.getLegalName());
        }
        if (StringUtils.hasText(request.getUnifiedSocialCode())) {
            entity.setUnifiedSocialCode(request.getUnifiedSocialCode());
        }
        if (StringUtils.hasText(request.getTaxNo())) {
            entity.setTaxNo(request.getTaxNo());
        }
        if (StringUtils.hasText(request.getLegalRep())) {
            entity.setLegalRep(request.getLegalRep());
        }
        if (StringUtils.hasText(request.getBaseCurrency())) {
            entity.setBaseCurrency(request.getBaseCurrency());
        }
        if (StringUtils.hasText(request.getCountry())) {
            entity.setCountry(request.getCountry());
        }
        if (StringUtils.hasText(request.getRegion())) {
            entity.setRegion(request.getRegion());
        }
        if (StringUtils.hasText(request.getAddress())) {
            entity.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getContactPhone())) {
            entity.setContactPhone(request.getContactPhone());
        }
        if (StringUtils.hasText(request.getLegalStatus())) {
            entity.setLegalStatus(request.getLegalStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysLegalEntity changeLegalStatus(Long id, String legalStatus) {
        SysLegalEntity entity = require(id);
        entity.setLegalStatus(legalStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysLegalEntity, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysLegalEntity>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
