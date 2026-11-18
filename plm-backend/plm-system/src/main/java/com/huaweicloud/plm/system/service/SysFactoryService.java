package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysFactorySaveRequest;
import com.huaweicloud.plm.system.entity.SysFactory;
import com.huaweicloud.plm.system.mapper.SysFactoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 工厂（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 工厂登记、启停状态流转与统计。
 * 工厂编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFactoryService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysFactoryMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询工厂：所属法人/工厂类型/工厂状态精确，关键字匹配编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysFactory> pageFactories(OrgQuery query) {
        Page<SysFactory> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFactory>lambdaQuery()
                .eq(StringUtils.hasText(query.getLegalCode()),
                        SysFactory::getLegalCode, query.getLegalCode())
                .eq(StringUtils.hasText(query.getFactoryType()),
                        SysFactory::getFactoryType, query.getFactoryType())
                .eq(StringUtils.hasText(query.getFactoryStatus()),
                        SysFactory::getFactoryStatus, query.getFactoryStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysFactory::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFactory::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFactory::getFactoryCode, query.getKeyword()).or()
                        .like(SysFactory::getFactoryName, query.getKeyword()))
                .orderByDesc(SysFactory::getId));
        return PageResult.of(page);
    }

    public SysFactory detail(Long id) {
        return require(id);
    }

    /** 新增或更新工厂：新增时回填默认工厂状态与组织，工厂编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFactorySaveRequest request) {
        SysFactory entity;
        if (id == null) {
            entity = new SysFactory();
            entity.setFactoryCode(StringUtils.hasText(request.getFactoryCode())
                    ? request.getFactoryCode() : flowSupport.nextBizNo("FAC"));
            entity.setFactoryStatus(STATUS_ACTIVE);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getFactoryCode())) {
                entity.setFactoryCode(request.getFactoryCode());
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

    /** 启用：工厂状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFactory enable(Long id) {
        return changeFactoryStatus(id, STATUS_ACTIVE);
    }

    /** 停用：工厂状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFactory disable(Long id) {
        return changeFactoryStatus(id, STATUS_DISABLED);
    }

    /** 删除工厂：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 工厂统计：按工厂状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysFactory::getFactoryStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysFactory::getFactoryStatus, STATUS_DISABLED));
        return result;
    }

    public SysFactory require(Long id) {
        SysFactory entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工厂不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFactory entity, SysFactorySaveRequest request) {
        if (StringUtils.hasText(request.getFactoryCode())) {
            entity.setFactoryCode(request.getFactoryCode());
        }
        if (StringUtils.hasText(request.getFactoryName())) {
            entity.setFactoryName(request.getFactoryName());
        }
        if (StringUtils.hasText(request.getLegalCode())) {
            entity.setLegalCode(request.getLegalCode());
        }
        if (StringUtils.hasText(request.getFactoryType())) {
            entity.setFactoryType(request.getFactoryType());
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
        if (StringUtils.hasText(request.getTimezone())) {
            entity.setTimezone(request.getTimezone());
        }
        if (StringUtils.hasText(request.getManager())) {
            entity.setManager(request.getManager());
        }
        if (StringUtils.hasText(request.getFactoryStatus())) {
            entity.setFactoryStatus(request.getFactoryStatus());
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

    private SysFactory changeFactoryStatus(Long id, String factoryStatus) {
        SysFactory entity = require(id);
        entity.setFactoryStatus(factoryStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysFactory, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFactory>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
